import {
  AbstractPaymentProvider,
  ContainerRegistrationKeys,
  MathBN,
  MedusaError,
  PaymentActions,
  PaymentSessionStatus,
} from '@medusajs/framework/utils';
import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  CreateAccountHolderInput,
  CreateAccountHolderOutput,
  DeleteAccountHolderInput,
  DeleteAccountHolderOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from '@medusajs/types';
import Braintree, { Transaction } from 'braintree';
import { z } from 'zod';
import { formatToTwoDecimalString } from '../../../../utils/format-amount';
import { BraintreeOptions, PaymentProviderKeys } from '../types';
import { buildBraintreeError } from './braintree-base';
import type { BraintreeConstructorArgs } from './braintree-base';

export interface BraintreeImportInitiatePaymentData {
  transactionId?: string;
  importedAsRefunded?: boolean;
}

export interface BraintreeImportPaymentSessionData {
  transactionId?: string;
  transaction?: Transaction | undefined;
  refundedTotal?: number;
  importedAsRefunded?: boolean;
  status: PaymentSessionStatus;
}

class BraintreeImport extends AbstractPaymentProvider<BraintreeOptions> {
  static identifier = PaymentProviderKeys.IMPORTED;
  options: BraintreeOptions;
  logger: Logger;
  private gateway: Braintree.BraintreeGateway;

  constructor(container: BraintreeConstructorArgs, options: BraintreeOptions) {
    super(container, options);
    this.options = options;
    this.logger = container[ContainerRegistrationKeys.LOGGER];
    // Create a lightweight Braintree gateway for refund operations only
    const envKey = (this.options.environment || 'sandbox').toLowerCase();
    const envMap: Record<string, Braintree.Environment> = {
      qa: Braintree.Environment.Qa,
      sandbox: Braintree.Environment.Sandbox,
      production: Braintree.Environment.Production,
      development: Braintree.Environment.Development,
    };
    const environment = envMap[envKey] ?? Braintree.Environment.Sandbox;

    this.gateway = new Braintree.BraintreeGateway({
      environment,
      merchantId: this.options.merchantId!,
      publicKey: this.options.publicKey!,
      privateKey: this.options.privateKey!,
    });
  }

  private parseInitiateData(data: Record<string, unknown>): BraintreeImportInitiatePaymentData {
    const schema = z.object({
      transactionId: z.string().optional(),
      importedAsRefunded: z.boolean().optional().default(false),
    });
    const result = schema.safeParse(data ?? {});
    if (!result.success) {
      throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, result.error.message);
    }
    return result.data as BraintreeImportInitiatePaymentData;
  }

  private parseSessionData(data: Record<string, unknown>): BraintreeImportPaymentSessionData {
    const schema = z.object({
      transactionId: z.string().optional(),
      refundedTotal: z.number().optional().default(0),
      importedAsRefunded: z.boolean().optional().default(false),
      status: z.nativeEnum(PaymentSessionStatus).optional().default(PaymentSessionStatus.PENDING),
    });
    const result = schema.safeParse(data ?? {});
    if (!result.success) {
      throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, result.error.message);
    }
    return result.data as BraintreeImportPaymentSessionData;
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const data = this.parseInitiateData(input.data ?? {});
    const id = input.context?.idempotency_key ?? crypto.randomUUID();

    const session: BraintreeImportPaymentSessionData = {
      transactionId: data.transactionId,
      refundedTotal: 0,
      importedAsRefunded: data.importedAsRefunded ?? false,
      status: PaymentSessionStatus.PENDING,
    };

    if (session.transactionId) {
      try {
        session.transaction = await this.gateway.transaction.find(session.transactionId);
      } catch (error) {
        this.logger.warn(
          `Could not find transaction with ID ${session.transactionId} in Braintree for imported payment`,
        );
      }
    }

    return { id, data: { ...session } };
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const session = this.parseSessionData(input.data ?? {});
    return { status: session.status };
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data: { ...input.data } };
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const session = this.parseSessionData(input.data ?? {});
    const updated: BraintreeImportPaymentSessionData = { ...session, status: PaymentSessionStatus.AUTHORIZED };
    return { data: { ...updated }, status: PaymentSessionStatus.AUTHORIZED };
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return { data: { ...input.data } };
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    const session = this.parseSessionData(input.data ?? {});
    return { data: { ...session, status: PaymentSessionStatus.CANCELED } };
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const session = this.parseSessionData(input.data ?? {});
    return { data: { ...session, status: PaymentSessionStatus.CAPTURED } };
  }

  async createAccountHolder(input: CreateAccountHolderInput): Promise<CreateAccountHolderOutput> {
    return { id: input.context.customer.id };
  }

  async deleteAccountHolder(input: DeleteAccountHolderInput): Promise<DeleteAccountHolderOutput> {
    return { data: {} };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const session = this.parseSessionData(input.data ?? {});

    const refundAmountBN = MathBN.convert(input.amount, 2);
    const refundAmount = refundAmountBN.toNumber();

    if (!refundAmount) throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Refund amount is invalid');

    const refundAmountRounded = Number(formatToTwoDecimalString(refundAmount));
    const previouslyRefunded = Number(formatToTwoDecimalString(session.refundedTotal ?? 0));

    // If the order was imported as already refunded, simulate refund without hitting Braintree
    if (session.importedAsRefunded) {
      return {
        data: {
          ...session,
          refundedTotal: Number(formatToTwoDecimalString(previouslyRefunded + refundAmountRounded)),
        },
      };
    }

    // Otherwise, perform a real refund/void against Braintree using the provided transaction id
    const transactionId = session.transactionId;

    if (!transactionId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        'transactionId is required on session data to perform a refund',
      );
    }

    const transaction = await this.gateway.transaction.find(transactionId);

    // Explicit guard to verify transaction and transaction.id exist
    if (!transaction || !transaction.id) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `Braintree transaction not found: ${transactionId}`);
    }

    const shouldVoid = ['submitted_for_settlement', 'authorized'].includes(transaction.status);

    if (shouldVoid) {
      const cancelResponse = await this.gateway.transaction.void(transaction.id);

      if (!cancelResponse.success) {
        throw buildBraintreeError(new Error(cancelResponse.message), 'void Braintree transaction', this.logger, {
          transactionId: transaction.id,
        });
      }

      return {
        data: {
          ...session,
          transaction: cancelResponse?.transaction,
          refundedTotal: Number(formatToTwoDecimalString(previouslyRefunded + refundAmountRounded)),
        },
      };
    }

    const shouldRefund = ['settled', 'settling'].includes(transaction.status);

    if (!shouldRefund) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Braintree transaction with ID ${transaction.id} cannot be refunded`,
      );
    }

    const refundAmountDecimal = formatToTwoDecimalString(refundAmountRounded);

    const refundResponse = await this.gateway.transaction.refund(transaction.id, refundAmountDecimal);

    if (!refundResponse.success) {
      throw buildBraintreeError(new Error(refundResponse.message), 'create Braintree refund', this.logger, {
        transactionId: transaction.id,
        refundAmount: refundAmountDecimal,
      });
    }

    return {
      data: {
        ...session,
        transaction: refundResponse.transaction,
        refundedTotal: Number(formatToTwoDecimalString(previouslyRefunded + refundAmountRounded)),
      },
    };
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const session = this.parseSessionData(input.data ?? {});
    return { data: { ...session, status: PaymentSessionStatus.CANCELED } };
  }

  async getWebhookActionAndData(_payload: ProviderWebhookPayload['payload']): Promise<WebhookActionResult> {
    return { action: PaymentActions.NOT_SUPPORTED };
  }
}

export default BraintreeImport;
