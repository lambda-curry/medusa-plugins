import {
  AbstractPaymentProvider,
  ContainerRegistrationKeys,
  MathBN,
  MedusaError,
  Modules,
  PaymentActions,
  PaymentSessionStatus,
  isDefined,
} from '@medusajs/framework/utils';
import type {
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
  ICacheService,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  PaymentAccountHolderDTO,
  PaymentCustomerDTO,
  PaymentProviderContext,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  SavePaymentMethodInput,
  SavePaymentMethodOutput,
  UpdateAccountHolderInput,
  UpdateAccountHolderOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from '@medusajs/types';
import type { Transaction, TransactionNotification, TransactionStatus } from 'braintree';
import Braintree from 'braintree';
import { z } from 'zod';
import { formatToTwoDecimalString } from '../../../../utils/format-amount';
import type { BraintreeOptions, CustomFields } from '../types';

export type BraintreeConstructorArgs = Record<string, unknown> & {
  logger: Logger;
  cache: ICacheService;
};

export type BraintreeTransactionContext = PaymentProviderContext &
  Pick<
    Braintree.TransactionRequest,
    | 'billing'
    | 'shipping'
    | 'customFields'
    | 'orderId'
    | 'lineItems'
    | 'shippingAmount'
    | 'taxAmount'
    | 'shippingTaxAmount'
    | 'discountAmount'
  >;

export interface BraintreePaymentSessionData {
  client_token: string;
  transaction: Transaction;
  amount: number;
  currency_code: string;
  payment_method_nonce?: string;
  account_holder?: PaymentAccountHolderDTO;
}

export interface BraintreeInitiatePaymentData {
  payment_method_nonce?: string;
}

const buildTokenCacheKey = (customerId: string) => `braintree:clientToken:${customerId}`;
const UNKNOWN_BRAINTREE_ERROR = 'Unknown error';

type BraintreeValidationErrorLike = {
  attribute?: string;
  code?: string;
  message?: string;
};

type BraintreeValidationErrorsCollectionLike = {
  deepErrors?: () => BraintreeValidationErrorLike[];
};

type TransactionSaleResponse = Awaited<
  ReturnType<Braintree.BraintreeGateway['transaction']['sale']>
>;

type BraintreeErrorResponseLike = {
  message?: string;
  errors?: BraintreeValidationErrorsCollectionLike;
  transaction?: {
    gatewayRejectionReason?: string;
    processorResponseCode?: string;
    processorResponseText?: string;
  };
};

const BRAINTREE_DECLINED_TRANSACTION_STATUSES = ['processor_declined', 'settlement_declined'] as const;

const VOIDABLE_REFUND_STATUSES: readonly TransactionStatus[] = ['submitted_for_settlement', 'authorized'];
const SETTLED_REFUND_STATUSES: readonly TransactionStatus[] = ['settled', 'settling'];

const isVoidableRefundStatus = (status: TransactionStatus): boolean =>
  (VOIDABLE_REFUND_STATUSES as readonly string[]).includes(status);

const isSettledRefundStatus = (status: TransactionStatus): boolean =>
  (SETTLED_REFUND_STATUSES as readonly string[]).includes(status);

/** History entries persisted on payment session data under `braintreeRefund`. */
type BraintreeRefundHistoryEntry = {
  type: 'voided' | 'refund';
  transaction: Transaction;
};

type RefundAction =
  | { kind: 'void'; transaction: Transaction }
  | { kind: 'refund'; transaction: Transaction };

export const isBraintreeDeclinedTransactionStatus = (status?: string): boolean =>
  (BRAINTREE_DECLINED_TRANSACTION_STATUSES as readonly string[]).includes(status ?? '');

// Type guard utilities for safe type validation
const validateString = (value: unknown, fieldName: string): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, `${fieldName} must be a non-empty string`);
  }
  return value;
};

const getBraintreeValidationErrors = (
  errors?: BraintreeValidationErrorsCollectionLike,
): BraintreeValidationErrorLike[] => {
  if (typeof errors?.deepErrors !== 'function') return [];
  return errors.deepErrors().filter((error): error is BraintreeValidationErrorLike => Boolean(error?.message));
};

const formatBraintreeValidationError = (error: BraintreeValidationErrorLike): string => {
  const prefix = error.attribute ? `${error.attribute}: ` : '';
  const suffix = error.code ? ` (${error.code})` : '';
  return `${prefix}${error.message}${suffix}`;
};

const getBraintreeErrorMessage = (response: BraintreeErrorResponseLike): string => {
  const gatewayRejectionReason = response.transaction?.gatewayRejectionReason?.trim();
  if (gatewayRejectionReason) return gatewayRejectionReason;

  const processorResponseText = response.transaction?.processorResponseText?.trim();
  if (processorResponseText) {
    const processorResponseCode = response.transaction?.processorResponseCode?.trim();
    return processorResponseCode ? `${processorResponseText} (${processorResponseCode})` : processorResponseText;
  }

  const validationErrors = getBraintreeValidationErrors(response.errors).map(formatBraintreeValidationError);
  if (validationErrors.length) return validationErrors.join('; ');

  const message = response.message?.trim();
  if (message) return message;

  return UNKNOWN_BRAINTREE_ERROR;
};

// Error handling utility that preserves full error context
export const buildBraintreeError = (
  error: unknown,
  operation: string,
  logger: Logger,
  context?: Record<string, unknown>,
): MedusaError => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const contextSuffix = context ? ` ${JSON.stringify(context)}` : '';

  // Preserve full error context in logging
  logger.error(
    `Braintree ${operation} failed: ${errorMessage}${contextSuffix}`,
    error instanceof Error ? error : undefined,
  );

  return new MedusaError(MedusaError.Types.INVALID_DATA, `Failed to ${operation}: ${errorMessage}`);
};

class BraintreeBase extends AbstractPaymentProvider<BraintreeOptions> {
  identifier = 'braintree';
  protected readonly options_: BraintreeOptions;
  protected gateway: Braintree.BraintreeGateway;
  logger: Logger;
  cache: ICacheService;

  protected constructor(container: BraintreeConstructorArgs, options: BraintreeOptions) {
    super(container, options);

    this.options_ = options;
    this.logger = container[ContainerRegistrationKeys.LOGGER];
    this.cache = container[Modules.CACHE];
    this.gateway = this.init();
  }

  async saveClientTokenToCache(clientToken: string, customerId: string, expiresOnEpochSeconds: number): Promise<void> {
    if (!customerId) throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, 'Customer ID is required');
    const nowSeconds = Math.floor(Date.now() / 1000);
    const ttlSeconds = expiresOnEpochSeconds - nowSeconds - 1;
    if (!customerId || !clientToken || ttlSeconds <= 0) return;
    await this.cache.set(buildTokenCacheKey(customerId), clientToken, ttlSeconds);
  }

  async getClientTokenFromCache(customerId: string): Promise<string | null> {
    const token = (await this.cache.get(buildTokenCacheKey(customerId))) as string | null;
    return token;
  }

  /** Logs to console when options.logging is true. Use for debugging. */
  protected logDebug(message: string, context?: Record<string, unknown>): void {
    if (this.options_.logging) {
      const msg = context ? `${message} ${JSON.stringify(context)}` : message;
      this.logger.info(`[Braintree] ${msg}`);
    }
  }

  /** When options.logging is true, logs error details to help debug vague failures. */
  protected logErrorDetail(operation: string, error: unknown, context?: Record<string, unknown>): void {
    if (!this.options_.logging) return;
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const ctx = context ? ` ${JSON.stringify(context)}` : '';
    const stackLine = stack ? ` stack: ${stack}` : '';
    this.logger.info(`[Braintree] ERROR ${operation}: ${msg}${ctx}${stackLine}`);
  }

  async getValidClientToken(
    medusaCustomerId: string | undefined,
    accountHolder: PaymentAccountHolderDTO | undefined,
  ): Promise<string | null> {
    if (!medusaCustomerId) {
      const generatedToken = await this.gateway.clientToken.generate({});
      return generatedToken.clientToken;
    }

    const token = await this.getClientTokenFromCache(medusaCustomerId);

    if (token) return token;

    const generatedToken = await this.gateway.clientToken.generate({});

    const defaultExpiryEpochSeconds = Math.floor(Date.now() / 1000) + 24 * 3600; // 24 hours default

    await this.saveClientTokenToCache(generatedToken.clientToken, medusaCustomerId, defaultExpiryEpochSeconds);
    return generatedToken.clientToken;
  }

  private async parsePaymentSessionData(data: Record<string, unknown>): Promise<BraintreePaymentSessionData> {
    const schema = z.object({
      clientToken: z.string().optional(),
      client_token: z.string().optional(),
      amount: z.number(),
      currency_code: z.string(),
      paymentMethodNonce: z.string().optional(),
      payment_method_nonce: z.string().optional(),
      braintreeTransaction: z.any().optional(),
      transaction: z.any().optional(),
      account_holder: z.any().optional(),
    });

    const result = schema.safeParse(data);
    if (!result.success) {
      throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, result.error.message);
    }

    result.data.transaction = result.data.transaction ?? result.data.braintreeTransaction;
    result.data.client_token = result.data.client_token ?? result.data.clientToken;
    result.data.payment_method_nonce = result.data.payment_method_nonce ?? result.data.paymentMethodNonce;

    return result.data as BraintreePaymentSessionData;
  }

  init(): Braintree.BraintreeGateway {
    const envKey = (this.options_.environment || 'sandbox').toLowerCase();
    const envMap: Record<string, Braintree.Environment> = {
      qa: Braintree.Environment.Qa,
      sandbox: Braintree.Environment.Sandbox,
      production: Braintree.Environment.Production,
      development: Braintree.Environment.Development,
    };
    const environment = envMap[envKey] ?? Braintree.Environment.Sandbox;

    const gateway =
      this.gateway ||
      new Braintree.BraintreeGateway({
        environment,
        merchantId: this.options_.merchantId!,
        publicKey: this.options_.publicKey!,
        privateKey: this.options_.privateKey!,
      });

    this.logDebug(`Gateway initialized (environment: ${envKey})`);
    return gateway;
  }

  static validateOptions(options: BraintreeOptions): void {
    const requiredFields = ['merchantId', 'publicKey', 'privateKey', 'webhookSecret', 'environment'];

    for (const field of requiredFields) {
      if (!isDefined(options[field as keyof BraintreeOptions]) || typeof options[field as keyof BraintreeOptions] !== 'string') {
        throw new MedusaError(
          MedusaError.Types.INVALID_ARGUMENT,
          `Required option "${field}" is missing or invalid in Braintree plugin`,
        );
      }
    }

    const validEnvironments = ['qa', 'sandbox', 'production', 'development'];
    if (!validEnvironments.includes(options.environment.toLowerCase())) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        `Invalid environment "${options.environment}" in Braintree plugin. Must be one of: ${validEnvironments.join(', ')}`,
      );
    }

    options.enable3DSecure = options.enable3DSecure ?? false;
    options.savePaymentMethod = options.savePaymentMethod ?? false;
    options.autoCapture = options.autoCapture ?? false;
    options.allowRefundOnRefunded = options.allowRefundOnRefunded ?? false;
    options.logging = options.logging ?? false;

    const booleanFields = ['enable3DSecure', 'savePaymentMethod', 'autoCapture', 'allowRefundOnRefunded', 'logging'];
    for (const field of booleanFields) {
      if (isDefined(options[field as keyof BraintreeOptions]) && typeof options[field as keyof BraintreeOptions] !== 'boolean') {
        throw new MedusaError(
          MedusaError.Types.INVALID_ARGUMENT,
          `Option "${field}" must be a boolean in Braintree plugin`,
        );
      }
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const sessionData = await this.parsePaymentSessionData(input.data ?? {});
    const transaction = sessionData.transaction;

    this.logDebug('capturePayment', { transactionId: transaction?.id });

    if (!transaction) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Braintree transaction not found');
    }

    const paymentsResponse = await this.gateway.transaction.find(transaction.id);

    switch (paymentsResponse.status) {
      case 'authorized': {
        const { id, amount } = paymentsResponse;
        const toPay = amount.toString();

        const captureResult = await this.gateway.transaction.submitForSettlement(id, toPay);

        if (captureResult.success) {
          const _transaction = await this.retrieveTransaction(transaction.id);

          return {
            data: {
              ...input.data,
              transaction: _transaction,
            },
          };
        }

        throw new MedusaError(MedusaError.Types.NOT_FOUND, `No payments found for transaction ${transaction.id}`);
      }
      case 'settled':
      case 'settling':
      case 'submitted_for_settlement': {
        const _transaction = await this.retrieveTransaction(transaction.id);

        return {
          data: {
            ...input.data,
            transaction: _transaction,
          },
        };
      }

      default: {
        throw new MedusaError(MedusaError.Types.NOT_FOUND, `Not in a state to settle ${transaction.id}`);
      }
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    this.logDebug('authorizePayment', {
      amount: (input.data as { amount?: number })?.amount,
      currency_code: (input.data as { currency_code?: string })?.currency_code,
    });
    try {
      const sessionData = await this.parsePaymentSessionData(input.data ?? {});

      let transaction = sessionData.transaction;

      if (!sessionData.payment_method_nonce)
        throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, 'Payment method nonce is required');

      if (!transaction) {
        transaction = await this.createTransaction(input);
      }

      const paymentStatusRequest: GetPaymentStatusInput = {
        ...input,
        data: {
          ...input.data,
          transaction,
        },
      };

      const status = await this.getPaymentStatus(paymentStatusRequest);

      const finalStatus = status.status === 'authorized' && this.options_.autoCapture ? 'captured' : status.status;

      return {
        data: {
          ...input.data,
          transaction,
        },
        status: finalStatus,
      };
    } catch (error) {
      this.logErrorDetail('authorizePayment', error, {
        amount: (input.data as { amount?: number })?.amount,
        currency_code: (input.data as { currency_code?: string })?.currency_code,
      });
      this.logger.error(`Error authorizing transaction: ${(error as Error).message}`, error as Error);
      throw new MedusaError(MedusaError.Types.INVALID_DATA, (error as Error).message ?? 'Unknown error');
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const sessionData = await this.parsePaymentSessionData(input.data ?? {});
    this.logDebug('cancelPayment', { transactionId: sessionData.transaction?.id });
    const transaction = await this.retrieveTransaction(sessionData.transaction?.id as string);

    if (!transaction) return {};

    if (
      transaction.status === 'authorized' ||
      transaction.status === 'submitted_for_settlement' ||
      (transaction.status === 'settling' && transaction.paymentInstrumentType === 'paypal_account')
    ) {
      const updatedTransaction = await this.gateway.transaction.void(transaction.id as string);

      if (updatedTransaction) {
        const updated = await this.retrieveTransaction(transaction.id);
        return {
          data: {
            ...input.data,
            transaction: updated,
          },
        };
      }

      throw new MedusaError(MedusaError.Types.NOT_FOUND, `No payments found for transaction ${transaction.id}`);
    }

    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Payment cannot be cancelled ${transaction.id}`);
  }

  private async getTransactionCreateRequestBody({
    accountHolder,
    customer,
    context,
    amount,
    nonce,
  }: {
    accountHolder?: PaymentAccountHolderDTO;
    customer?: PaymentCustomerDTO;
    amount: string;
    nonce: string;
    context?: BraintreeTransactionContext;
  }): Promise<Braintree.TransactionRequest> {
    const braintreeContext: Partial<Braintree.TransactionRequest> = {
      shipping: context?.shipping,
      billing: context?.billing,
      customFields: context?.customFields,
      orderId: context?.orderId,
      lineItems: context?.lineItems,
      shippingAmount: context?.shippingAmount,
      taxAmount: context?.taxAmount,
      shippingTaxAmount: context?.shippingTaxAmount,
      discountAmount: context?.discountAmount,
    };

    const transactionRequest: Braintree.TransactionRequest = {
      amount: amount.toString(),
      customerId: (accountHolder?.data?.id as string) ?? undefined,
      options: {
        submitForSettlement: this.options_.autoCapture,
        storeInVaultOnSuccess: this.options_.savePaymentMethod,
        storeInVault: this.options_.savePaymentMethod,
        threeDSecure: this.options_.enable3DSecure
          ? {
              required: this.options_.enable3DSecure,
            }
          : undefined,
      },
      paymentMethodNonce: nonce,
      ...braintreeContext,
    };

    return transactionRequest;
  }

  private async retrieveTransaction(id: string, throwOnMissing: boolean = true): Promise<Transaction> {
    const transactionData = await this.gateway.transaction.find(id);

    if (!transactionData && throwOnMissing)
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `Braintree transaction not found: ${id}`);

    return transactionData;
  }

  private mapTransactionStatusToPaymentStatus(status: TransactionStatus): PaymentSessionStatus {
    switch (status) {
      case 'authorization_expired':
        return PaymentSessionStatus.CANCELED;
      case 'authorizing':
        return PaymentSessionStatus.REQUIRES_MORE;
      case 'authorized':
        return PaymentSessionStatus.AUTHORIZED;
      case 'settled':
      case 'settlement_confirmed':
        return PaymentSessionStatus.CAPTURED;
      case 'settling':
      case 'settlement_pending':
      case 'submitted_for_settlement':
        return PaymentSessionStatus.AUTHORIZED;
      case 'voided':
        return PaymentSessionStatus.CANCELED;
      case 'failed':
        return PaymentSessionStatus.ERROR;
      default:
        return PaymentSessionStatus.PENDING;
    }
  }

  private validateInitiatePaymentData(data: Record<string, unknown>): BraintreeInitiatePaymentData {
    const schema = z.object({
      paymentMethodNonce: z.string().optional(),
      payment_method_nonce: z.string().optional(),
      cardDetails: z
        .object({
          cardType: z.string().optional(),
          lastFour: z.string().optional(),
          lastTwo: z.string().optional(),
          expirationMonth: z.string().optional(),
          expirationYear: z.string().optional(),
          cardholderName: z.string().optional(),
        })
        .optional(),
    });

    const result = schema.safeParse(data);

    if (!result.success) {
      throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, result.error.message);
    }

    result.data.payment_method_nonce = result.data.payment_method_nonce ?? result.data.paymentMethodNonce;

    return result.data;
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    this.logDebug('initiatePayment', {
      amount: input.amount,
      currency_code: input.currency_code,
      idempotency_key: input.context?.idempotency_key,
    });
    const data = this.validateInitiatePaymentData(input.data ?? {});

    let transaction: Transaction | undefined;

    const token = await this.getValidClientToken(input.context?.customer?.id, input.context?.account_holder);

    const paymentSessionId = validateString(input.context?.idempotency_key, 'Payment session ID');

    if (!token) {
      throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, 'Failed to generate client token');
    }

    const dataToSave: BraintreePaymentSessionData = {
      transaction: transaction as Transaction,
      client_token: token,
      payment_method_nonce: data?.payment_method_nonce as string,
      amount: Number(input.amount),
      currency_code: input.currency_code,
      account_holder: input.context?.account_holder,
    };

    return {
      id: paymentSessionId!,
      data: { ...dataToSave },
    };
  }

  private rethrowGatewayError(
    error: unknown,
    operation: string,
    context?: Record<string, unknown>,
  ): never {
    if (error instanceof MedusaError) throw error;
    this.logErrorDetail(operation, error, context);
    throw buildBraintreeError(error, operation, this.logger, context);
  }

  private async saleTransaction(
    request: Braintree.TransactionRequest,
    context: BraintreeTransactionContext | undefined,
  ): Promise<TransactionSaleResponse> {
    this.logDebug('createTransaction (sale)', {
      amount: request.amount,
      orderId: context?.orderId,
    });

    const saleResponse = await this.gateway.transaction.sale(request);
    if (saleResponse.success) return saleResponse;

    const errorMessage = getBraintreeErrorMessage(saleResponse);
    this.logErrorDetail('transaction.sale failed', new Error(errorMessage), {
      transactionId: saleResponse.transaction?.id,
      gatewayRejectionReason: saleResponse.transaction?.gatewayRejectionReason,
      processorResponseCode: saleResponse.transaction?.processorResponseCode,
      processorResponseText: saleResponse.transaction?.processorResponseText,
      validationErrors: getBraintreeValidationErrors(saleResponse.errors).map(formatBraintreeValidationError),
    });
    throw new MedusaError(MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR, errorMessage);
  }

  /** Retrieve the created sale; void it if session sync fails so we don't leave an orphan auth. */
  private async retrieveOrVoidSale(saleResponse: TransactionSaleResponse): Promise<Transaction> {
    const transactionId = saleResponse.transaction?.id;

    try {
      return await this.retrieveTransaction(saleResponse.transaction.id);
    } catch (error) {
      this.logErrorDetail('sync payment session (retrieveTransaction)', error, { transactionId });
      if (transactionId) {
        await this.gateway.transaction.void(transactionId);
      }
      throw buildBraintreeError(error, 'sync payment session', this.logger, { transactionId });
    }
  }

  private async createTransaction(input: AuthorizePaymentInput): Promise<Transaction> {
    const sessionData = await this.parsePaymentSessionData(input.data ?? {});
    const context = input.context as BraintreeTransactionContext | undefined;
    const request = await this.getTransactionCreateRequestBody({
      amount: formatToTwoDecimalString(Number(sessionData.amount)),
      nonce: validateString(sessionData.payment_method_nonce, 'Payment method nonce'),
      context,
      accountHolder: sessionData.account_holder,
      customer: input.context?.customer,
    });

    try {
      const saleResponse = await this.saleTransaction(request, context);
      return await this.retrieveOrVoidSale(saleResponse);
    } catch (error) {
      this.rethrowGatewayError(error, 'create Braintree transaction', {
        amount: request.amount,
        orderId: context?.orderId,
      });
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    const sessionData = await this.parsePaymentSessionData(input.data ?? {});
    const transaction = sessionData.transaction;
    this.logDebug('deletePayment', { transactionId: transaction?.id });

    if (transaction) {
      try {
        const result = await this.cancelPayment(input);

        return {
          data: {
            ...input.data,
            transaction: result.data?.transaction,
          },
        };
      } catch (e) {
        this.logErrorDetail('delete Braintree payment', e, { transactionId: transaction?.id });
        throw buildBraintreeError(e, 'delete Braintree payment', this.logger);
      }
    } else {
      return {
        data: {
          ...input.data,
          transaction,
        },
      };
    }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    // Support both `data.transaction` and `data.braintreeTransaction` without requiring full session parsing
    const tx = (input.data?.transaction ?? input.data?.braintreeTransaction) as Transaction | undefined;
    const id = tx?.id as string | undefined;
    this.logDebug('getPaymentStatus', { transactionId: id });

    if (!id) {
      return { status: PaymentSessionStatus.PENDING };
    }

    let transaction: Transaction;
    try {
      transaction = await this.gateway.transaction.find(id);
    } catch (e) {
      this.logErrorDetail('getPaymentStatus (transaction.find)', e, { transactionId: id });
      this.logger.warn('received payment data from session not transaction data');
      throw e;
    }
    const status = this.mapTransactionStatusToPaymentStatus(transaction.status);
    return { status };
  }

  async savePaymentMethod(input: SavePaymentMethodInput): Promise<SavePaymentMethodOutput> {
    this.logDebug('savePaymentMethod', {
      accountHolderId: input.context?.account_holder?.data?.id,
    });
    const sessionData = await this.parsePaymentSessionData(input.data ?? {});

    const braintreeCustomerId = validateString(input.context?.account_holder?.data?.id, 'Braintree customer ID');

    const paymentMethodNonce = sessionData?.payment_method_nonce;

    if (!paymentMethodNonce) {
      throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, 'Payment method nonce is required');
    }

    const paymentMethodResult = await this.gateway.paymentMethod.create({
      customerId: braintreeCustomerId,
      paymentMethodNonce: paymentMethodNonce,
    });

    if (!paymentMethodResult.success) {
      this.logErrorDetail(
        'savePaymentMethod (paymentMethod.create)',
        new Error(JSON.stringify(paymentMethodResult.errors)),
        {
          customerId: braintreeCustomerId,
          errors: paymentMethodResult.errors,
        },
      );
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Failed to save payment method: ${JSON.stringify(paymentMethodResult.errors)}`,
      );
    }

    return {
      id: paymentMethodResult.paymentMethod.token,
      data: {
        ...input.data,
      },
    };
  }

  private appendRefundHistory(
    data: Record<string, unknown> | undefined,
    entry: BraintreeRefundHistoryEntry,
  ): BraintreeRefundHistoryEntry[] {
    const prior = (data?.braintreeRefund as BraintreeRefundHistoryEntry[] | undefined) ?? [];
    return [...prior, entry];
  }

  private buildRefundPaymentOutput(
    input: RefundPaymentInput,
    transaction: Transaction,
    entry: BraintreeRefundHistoryEntry,
  ): RefundPaymentOutput {
    return {
      data: {
        ...input.data,
        transaction,
        braintreeRefund: this.appendRefundHistory(input.data, entry),
      },
    };
  }

  private async loadRefundContext(input: RefundPaymentInput): Promise<{
    transaction: Transaction;
    refundAmount: number;
  }> {
    const sessionData = await this.parsePaymentSessionData(input.data ?? {});
    this.logDebug('refundPayment', {
      transactionId: sessionData.transaction?.id,
      amount: input.amount,
    });

    const refundAmount = MathBN.convert(input.amount, 2).toNumber();
    if (!refundAmount) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Refund amount is invalid');
    }

    const transactionId = sessionData.transaction?.id;
    if (!transactionId) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Braintree transaction not found');
    }

    return {
      transaction: await this.retrieveTransaction(transactionId),
      refundAmount,
    };
  }

  /** Sandbox-only: force settle so refund paths can be exercised in tests. */
  private async applyTestForceSettled(transaction: Transaction): Promise<Transaction> {
    if (process.env.TEST_FORCE_SETTLED !== 'true') return transaction;

    if (!this.isTestForceSettledEnabled()) {
      this.logger.warn(
        '[Braintree refund] TEST_FORCE_SETTLED ignored — only supported when environment is sandbox',
      );
      return transaction;
    }

    await this.gateway.testing.settle(transaction.id);
    return this.retrieveTransaction(transaction.id);
  }

  private async resolveRefundAction(transaction: Transaction): Promise<RefundAction> {
    const resolved = await this.applyTestForceSettled(transaction);

    if (isVoidableRefundStatus(resolved.status)) {
      return { kind: 'void', transaction: resolved };
    }

    if (isSettledRefundStatus(resolved.status)) {
      return { kind: 'refund', transaction: resolved };
    }

    this.logger.error(
      `Braintree transaction with ID ${resolved.id} cannot be refunded because it's in status ${resolved.status}`,
    );
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Braintree transaction with ID ${resolved.id} cannot be refunded`,
    );
  }

  private async voidForRefund(
    input: RefundPaymentInput,
    transaction: Transaction,
  ): Promise<RefundPaymentOutput> {
    const voidResponse = await this.gateway.transaction.void(transaction.id);
    this.logDebug('refundPayment void response', { response: voidResponse });

    if (isBraintreeFailureResponse(voidResponse)) {
      throwOnBraintreeFailure(voidResponse, 'refundPayment (void)', this.logErrorDetail.bind(this), {
        transactionId: transaction.id,
      });
    }

    const voidedTransaction = voidResponse.transaction ?? (await this.retrieveTransaction(transaction.id));

    return this.buildRefundPaymentOutput(input, transaction, {
      type: 'voided',
      transaction: voidedTransaction,
    });
  }

  private async refundSettled(
    input: RefundPaymentInput,
    transaction: Transaction,
    refundAmount: number,
  ): Promise<RefundPaymentOutput> {
    const refundAmountDecimal = formatToTwoDecimalString(refundAmount);

    try {
      this.logger.info(
        `Refunding transaction: ${transaction.id} with amount: ${refundAmountDecimal} (created from ${refundAmount})`,
      );

      const refundResponse = await this.gateway.transaction.refund(transaction.id, refundAmountDecimal);
      this.logDebug('refundPayment refund response', { response: refundResponse });

      if (isBraintreeFailureResponse(refundResponse)) {
        throwOnBraintreeFailure(refundResponse, 'refundPayment (refund)', this.logErrorDetail.bind(this), {
          transactionId: transaction.id,
          refundAmount: refundAmountDecimal,
        });
      }

      const refundTransaction = refundResponse.transaction ?? (await this.retrieveTransaction(transaction.id));

      return this.buildRefundPaymentOutput(input, transaction, {
        type: 'refund',
        transaction: refundTransaction,
      });
    } catch (error) {
      this.rethrowGatewayError(error, 'create Braintree refund', {
        transactionId: transaction.id,
        refundAmount: refundAmountDecimal,
      });
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const { transaction, refundAmount } = await this.loadRefundContext(input);
    const action = await this.resolveRefundAction(transaction);

    switch (action.kind) {
      case 'void':
        return this.voidForRefund(input, action.transaction);
      case 'refund':
        return this.refundSettled(input, action.transaction, refundAmount);
    }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const paymentSessionData = await this.parsePaymentSessionData(input.data ?? {});
    this.logDebug('retrievePayment', { transactionId: paymentSessionData.transaction?.id });

    if (!paymentSessionData.transaction?.id) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Braintree transaction not found');
    }

    const retrieved = await this.retrieveTransaction(paymentSessionData.transaction?.id);

    return {
      data: {
        ...input.data,
        transaction: retrieved,
      },
    };
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    this.logDebug('updatePayment', { amount: input.amount, currency_code: input.currency_code });
    return Promise.resolve({
      data: {
        ...input.data,
        amount: input.amount,
        currency_code: input.currency_code,
      },
    });
  }

  async createAccountHolder(input: CreateAccountHolderInput): Promise<CreateAccountHolderOutput> {
    this.logDebug('createAccountHolder', { customerId: input.context.customer?.id });
    const customer = await this.createBraintreeCustomer(input.context.customer);

    return {
      id: customer.id,
      data: {
        ...customer,
      },
    };
  }

  async updateAccountHolder(input: UpdateAccountHolderInput): Promise<UpdateAccountHolderOutput> {
    const { context } = input;
    const accountHolderId = context.account_holder?.data?.id as string;
    this.logDebug('updateAccountHolder', { accountHolderId });
    if (!accountHolderId) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Account holder id is required`);
    }
    try {
      const accountHolder = await this.gateway.customer.find(accountHolderId);
      if (!accountHolder) {
        throw new MedusaError(MedusaError.Types.NOT_FOUND, `Account holder with id ${accountHolderId} not found`);
      }
      const customerUpdateRequest: Braintree.CustomerUpdateRequest = {
        firstName: input.context.customer?.first_name ?? accountHolder.firstName,
        lastName: input.context.customer?.last_name ?? accountHolder.lastName,
        email: input.context.customer?.email ?? accountHolder.email,
        phone: input.context.customer?.phone ?? accountHolder.phone,
      };

      const updateResult = await this.gateway.customer.update(accountHolder.id, customerUpdateRequest);

      if (!updateResult.success) {
        this.logErrorDetail('updateAccountHolder (customer.update)', new Error(JSON.stringify(updateResult.errors)), {
          accountHolderId,
          errors: updateResult.errors,
        });
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Failed to update account holder: ${JSON.stringify(updateResult.errors)}`,
        );
      }

      return {
        data: { ...updateResult.customer },
      };
    } catch (e) {
      this.logErrorDetail('update account holder', e, { accountHolderId });
      throw buildBraintreeError(e, 'update account holder', this.logger);
    }
  }

  async deleteAccountHolder(input: DeleteAccountHolderInput): Promise<DeleteAccountHolderOutput> {
    const { context } = input;

    const accountHolderId = context.account_holder?.data?.id as string;
    this.logDebug('deleteAccountHolder', { accountHolderId });

    if (!accountHolderId) throw new MedusaError(MedusaError.Types.INVALID_DATA, `Account holder id is required`);

    try {
      const accountHolder = await this.gateway.customer.find(accountHolderId);

      if (!accountHolder)
        throw new MedusaError(MedusaError.Types.NOT_FOUND, `Account holder with id ${accountHolderId} not found`);

      await this.gateway.customer.delete(accountHolder.id);

      return {
        data: {},
      };
    } catch (e) {
      this.logErrorDetail('delete account holder', e, { accountHolderId });
      throw buildBraintreeError(e, 'delete account holder', this.logger);
    }
  }

  async getWebhookActionAndData(webhookData: ProviderWebhookPayload['payload']): Promise<WebhookActionResult> {
    const logger = this.logger;

    this.logDebug('getWebhookActionAndData', { hasData: !!webhookData?.data });
    logger.info(`Received Braintree webhook with data: ${!!webhookData.data}`);

    const decodedPayload = new URLSearchParams(webhookData.data as unknown as string);

    let notification: TransactionNotification;
    try {
      notification = (await this.gateway.webhookNotification.parse(
        decodedPayload.get('bt_signature') ?? '',
        decodedPayload.get('bt_payload') ?? '',
      )) as TransactionNotification;

      if (!notification) {
        return { action: PaymentActions.FAILED };
      }
    } catch (error) {
      this.logErrorDetail('webhook validation', error, { hasPayload: !!webhookData?.data });
      logger.error(`Braintree webhook validation failed : ${error}`);

      return { action: PaymentActions.FAILED };
    }

    const paymentData = await this.gateway.transaction.find(notification.transaction.id);

    const customFields = paymentData.customFields as CustomFields;

    switch (notification.kind) {
      case 'transaction_settled':
        return {
          action: PaymentActions.SUCCESSFUL,
          data: {
            session_id: customFields.medusa_payment_session_id ?? '',
            amount: paymentData.amount,
          },
        };

      case 'transaction_settlement_declined':
        return {
          action: PaymentActions.FAILED,
          data: {
            session_id: customFields.medusa_payment_session_id ?? '',
            amount: paymentData.amount,
          },
        };

      default:
        return { action: PaymentActions.NOT_SUPPORTED };
    }
  }

  private async createBraintreeCustomer(customer: PaymentCustomerDTO): Promise<Braintree.Customer> {
    const customerResult = await this.gateway.customer.create({
      email: customer.email,
      firstName: customer.first_name ?? undefined,
      lastName: customer.last_name ?? undefined,
      phone: customer.phone ?? undefined,
    });

    if (!customerResult.success) {
      this.logErrorDetail('createBraintreeCustomer', new Error(JSON.stringify(customerResult.errors)), {
        customerId: customer.id,
        errors: customerResult.errors,
      });
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Failed to create Braintree customer: ${JSON.stringify(customerResult.errors)}`,
      );
    }

    return customerResult.customer;
  }
}

export default BraintreeBase;
