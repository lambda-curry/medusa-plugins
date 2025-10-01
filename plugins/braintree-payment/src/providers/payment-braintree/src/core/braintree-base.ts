import {
  AbstractPaymentProvider,
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
  Order,
  PaymentActions,
  PaymentSessionStatus,
  isDefined,
} from '@medusajs/framework/utils';
import type {
  AddressDTO,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  CartLineItemDTO,
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
  MedusaContainer,
  OrderDTO,
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
import type { BraintreeOptions, CustomFields } from '../types';

export type BraintreeConstructorArgs = Record<string, unknown> & {
  logger: Logger;
  cache: ICacheService;
};

export interface ExtendedPaymentProviderContext extends PaymentProviderContext {
  custom_fields?: Record<string, string>;
  order_id?: string;
  shipping_address?: AddressDTO;
  billing_address?: AddressDTO;
  order_display_id?: string;
  totals?: {
    tax_total: number;
    shipping_total: number;
    shipping_tax_total: number;
    discount_total: number;
    discount_tax_total: number;
    item_total: number;
    item_tax_total: number;
    item_subtotal: number;
  };
  items?: Array<CartLineItemDTO>;
}

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
    this.cache = container[Modules.CACHE] as unknown as ICacheService;
    this.init();
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

  init(): void {
    const envKey = (this.options_.environment || 'sandbox').toLowerCase();
    const envMap: Record<string, Braintree.Environment> = {
      qa: Braintree.Environment.Qa,
      sandbox: Braintree.Environment.Sandbox,
      production: Braintree.Environment.Production,
      development: Braintree.Environment.Development,
    };
    const environment = envMap[envKey] ?? Braintree.Environment.Sandbox;

    this.gateway =
      this.gateway ||
      new Braintree.BraintreeGateway({
        environment,
        merchantId: this.options_.merchantId!,
        publicKey: this.options_.publicKey!,
        privateKey: this.options_.privateKey!,
      });
  }

  private formatToTwoDecimalString(amount: number): string {
    const rounded = Math.round(Number(amount) * 100) / 100;
    return rounded.toFixed(2);
  }

  static validateOptions(options: BraintreeOptions): void {
    const requiredFields = ['merchantId', 'publicKey', 'privateKey', 'webhookSecret', 'environment'];

    for (const field of requiredFields) {
      if (!isDefined(options[field]) || typeof options[field] !== 'string') {
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

    const booleanFields = ['enable3DSecure', 'savePaymentMethod', 'autoCapture'];
    for (const field of booleanFields) {
      if (isDefined(options[field]) && typeof options[field] !== 'boolean') {
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
          const braintreeTransaction = await this.retrieveTransaction(transaction.id);

          const capturePaymentResult: CapturePaymentOutput = {
            data: {
              ...input.data,
              transaction: braintreeTransaction,
            },
          };
          return capturePaymentResult;
        }
        throw new MedusaError(MedusaError.Types.NOT_FOUND, `No payments found for transaction ${transaction.id}`);
      }
      case 'settled':
      case 'settling':
      case 'submitted_for_settlement': {
        const braintreeTransaction = await this.retrieveTransaction(transaction.id);

        const result: CapturePaymentOutput = {
          data: {
            ...input.data,
            transaction: braintreeTransaction,
          },
        };

        return result;
      }

      default: {
        throw new MedusaError(MedusaError.Types.NOT_FOUND, `Not in a state to settle ${transaction.id}`);
      }
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    try {
      const sessionData = await this.parsePaymentSessionData(input.data ?? {});

      let braintreeTransaction = sessionData.transaction;

      if (!sessionData.payment_method_nonce)
        throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, 'Payment method nonce is required');

      if (!braintreeTransaction)
        braintreeTransaction = await this.createTransaction({
          input,
        });

      const paymentStatusRequest: GetPaymentStatusInput = {
        ...input,
        data: {
          ...input.data,
          transaction: braintreeTransaction,
        },
      };

      const status = await this.getPaymentStatus(paymentStatusRequest);
      const finalStatus = status.status === 'authorized' && this.options_.autoCapture ? 'captured' : status.status;

      return {
        data: {
          ...input.data,
          transaction: braintreeTransaction,
        },
        status: finalStatus,
      };
    } catch (error) {
      this.logger.error(`Error authorizing payment: ${error.message}`, error);
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Failed to authorize payment: ${error.message}`);
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const sessionData = await this.parsePaymentSessionData(input.data ?? {});
    const braintreeTransaction = await this.retrieveTransaction(sessionData.transaction?.id as string);

    if (!braintreeTransaction) {
      return {};
    }

    if (
      braintreeTransaction.status === 'authorized' ||
      braintreeTransaction.status === 'submitted_for_settlement' ||
      (braintreeTransaction.status === 'settling' && braintreeTransaction.paymentInstrumentType === 'paypal_account')
    ) {
      const updatedTransaction = await this.gateway.transaction.void(braintreeTransaction.id as string);
      if (updatedTransaction) {
        const updated = await this.retrieveTransaction(braintreeTransaction.id);
        return {
          data: {
            ...input.data,
            transaction: updated,
          },
        };
      }

      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `No payments found for transaction ${braintreeTransaction.id}`,
      );
    }

    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Payment cannot be cancelled ${braintreeTransaction.id}`);
  }

  private getBraintreeTransactionCreateRequestBody({
    accountHolder,
    customer,
    context,
    amount,
    nonce,
    orderId,
  }: {
    accountHolder?: PaymentAccountHolderDTO;
    customer?: PaymentCustomerDTO;
    amount: string;
    nonce: string;
    context: ExtendedPaymentProviderContext;
    orderId?: string;
  }): Braintree.TransactionRequest {
    const transactionRequest: Braintree.TransactionRequest = {
      amount: amount.toString(),
      billing: context.billing_address
        ? {
            company: context.billing_address?.company ?? '',
            streetAddress: context.billing_address?.address_1 ?? '',
            extendedAddress: context.billing_address?.address_2 ?? '',
            locality: context.billing_address?.city ?? '',
            region: context.billing_address?.province ?? '',
            postalCode: context.billing_address?.postal_code ?? '',
            countryCodeAlpha2: context.billing_address?.country_code ?? '',
          }
        : undefined,
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
      shipping: context.shipping_address
        ? {
            company: context.shipping_address?.company ?? '',
            streetAddress: context.shipping_address?.address_1 ?? '',
            extendedAddress: context.shipping_address?.address_2 ?? '',
            locality: context.shipping_address?.city ?? '',
            region: context.shipping_address?.province ?? '',
            postalCode: context.shipping_address?.postal_code ?? '',
            countryCodeAlpha2: context.shipping_address?.country_code ?? '',
          }
        : undefined,
      paymentMethodNonce: nonce,
      customFields: context.custom_fields,
      orderId: orderId || undefined,
      discountAmount: context.totals?.discount_total
        ? this.formatToTwoDecimalString(Number(context.totals.discount_total))
        : undefined,
      taxAmount: context.totals?.tax_total
        ? this.formatToTwoDecimalString(Number(context.totals.tax_total))
        : undefined,
      shippingAmount: context.totals?.shipping_total
        ? this.formatToTwoDecimalString(Number(context.totals.shipping_total))
        : undefined,
      shippingTaxAmount: context.totals?.shipping_tax_total
        ? this.formatToTwoDecimalString(Number(context.totals.shipping_tax_total))
        : undefined,
      lineItems: context.items?.map((item) => ({
        kind: 'debit',
        name: item.title,
        quantity: item.quantity.toString(),
        unitAmount: this.formatToTwoDecimalString(Number(item.unit_price)),
        totalAmount: this.formatToTwoDecimalString(Number(item.total)),
        discountAmount: this.formatToTwoDecimalString(Number(item.discount_total)),
      })),
    };
    return transactionRequest;
  }

  private async retrieveTransaction(
    braintreeTransactionId: string,
    throwOnMissing: boolean = true,
  ): Promise<Transaction> {
    const transactionData = await this.gateway.transaction.find(braintreeTransactionId);

    if (!transactionData && throwOnMissing)
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `Braintree transaction not found: ${braintreeTransactionId}`);

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
    });

    const result = schema.safeParse(data);

    if (!result.success) {
      throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, result.error.message);
    }

    result.data.payment_method_nonce = result.data.payment_method_nonce ?? result.data.paymentMethodNonce;

    return result.data;
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const data = this.validateInitiatePaymentData(input.data ?? {});

    let braintreeTransaction: Transaction | undefined;

    const token = await this.getValidClientToken(input.context?.customer?.id, input.context?.account_holder);

    const paymentSessionId = input.context?.idempotency_key as string;

    if (!token) {
      throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, 'Failed to generate client token');
    }

    const dataToSave: BraintreePaymentSessionData = {
      transaction: braintreeTransaction as Transaction,
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

  private async createTransaction({
    input,
  }: {
    input: AuthorizePaymentInput;
  }): Promise<Transaction> {
    const sessionData = await this.parsePaymentSessionData(input.data ?? {});

    const _context = input.context as ExtendedPaymentProviderContext;

    const toPayDecimal = this.formatToTwoDecimalString(Number(sessionData.amount));

    const braintreeTransactionCreateRequest = this.getBraintreeTransactionCreateRequestBody({
      amount: toPayDecimal,
      nonce: sessionData.payment_method_nonce as string,
      context: _context,
      accountHolder: sessionData.account_holder,
      customer: input.context?.customer,
    });
    try {
      const braintreeTransaction = await this.gateway.transaction.sale(braintreeTransactionCreateRequest);

      if (!braintreeTransaction.success) {
        throw new MedusaError(
          MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR,
          `Failed to create Braintree transaction: ${JSON.stringify(braintreeTransaction)}`,
        );
      }

      try {
        return await this.retrieveTransaction(braintreeTransaction.transaction.id);
      } catch (error) {
        this.logger.error(`Error syncing payment session: ${error.message}`, error);
        if (braintreeTransaction.transaction?.id) {
          await this.gateway.transaction.void(braintreeTransaction.transaction.id);
        }
        throw new MedusaError(MedusaError.Types.INVALID_DATA, `Failed to sync payment session: ${error.message}`);
      }
    } catch (error) {
      this.logger.error(`Error creating Braintree transaction: ${error.message}`, error);
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Failed to create Braintree transaction: ${error.message}`);
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    const sessionData = await this.parsePaymentSessionData(input.data ?? {});
    const braintreeTransaction = sessionData.transaction;

    if (braintreeTransaction) {
      try {
        const result = await this.cancelPayment(input);
        return {
          data: {
            ...input.data,
            braintreeTransaction: result.data?.braintreeTransaction,
          },
        };
      } catch (e) {
        this.logger.error(`Error deleting Braintree payment: ${e.message}`, e);
        throw new MedusaError(MedusaError.Types.INVALID_DATA, `Failed to delete Braintree payment: ${e.message}`);
      }
    } else {
      return {
        data: {
          ...input.data,
          braintreeTransaction: braintreeTransaction,
        },
      };
    }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    // Support both `data.transaction` and `data.braintreeTransaction` without requiring full session parsing
    const tx = (input.data?.transaction ?? input.data?.braintreeTransaction) as Transaction | undefined;
    const id = tx?.id as string | undefined;

    if (!id) {
      return { status: PaymentSessionStatus.PENDING };
    }

    let transaction: Transaction;
    try {
      transaction = await this.gateway.transaction.find(id);
    } catch (e) {
      this.logger.warn('received payment data from session not transaction data');
      throw e;
    }
    const status = this.mapTransactionStatusToPaymentStatus(transaction.status);
    return { status };
  }

  async savePaymentMethod(input: SavePaymentMethodInput): Promise<SavePaymentMethodOutput> {
    const sessionData = await this.parsePaymentSessionData(input.data ?? {});

    const braintreeCustomerId = input.context?.account_holder?.data?.id as string;
    if (!braintreeCustomerId) {
      throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, 'Braintree customer id is required');
    }

    const paymentMethodNonce = sessionData?.payment_method_nonce;

    if (!paymentMethodNonce) {
      throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, 'Payment method nonce is required');
    }

    const paymentMethodResult = await this.gateway.paymentMethod.create({
      customerId: braintreeCustomerId,
      paymentMethodNonce: paymentMethodNonce,
    });

    if (!paymentMethodResult.success) {
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

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const sessionData = await this.parsePaymentSessionData(input.data ?? {});
    const refundAmount = Number(input.amount);
    const refundAmountRounded = Number(this.formatToTwoDecimalString(refundAmount));

    const braintreeTransaction = await this.retrieveTransaction(sessionData.transaction?.id as string);

    const shouldVoid = ['submitted_for_settlement', 'authorized'].includes(braintreeTransaction.status);
    if (shouldVoid) {
      const cancelledTransaction = await this.gateway.transaction.void(braintreeTransaction.id);

      const result = await this.retrieveTransaction(braintreeTransaction.id);

      const refundResult: RefundPaymentOutput = {
        data: {
          ...input.data,
          transaction: braintreeTransaction,
          braintreeRefund: cancelledTransaction,
        },
      };

      return refundResult;
    }

    const shouldRefund = ['settled', 'settling'].includes(braintreeTransaction.status);

    if (!shouldRefund) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Braintree transaction with ID ${braintreeTransaction.id} cannot be refunded`,
      );
    }

    if (braintreeTransaction.id) {
      const refundAmountDecimal = this.formatToTwoDecimalString(refundAmountRounded);
      try {
        const { transaction: refundTransaction } = await this.gateway.transaction.refund(
          braintreeTransaction.id,
          refundAmountDecimal,
        );

        const updatedTransaction = await this.retrieveTransaction(braintreeTransaction.id);

        const refundResult: RefundPaymentOutput = {
          data: {
            ...input.data,
            braintreeTransaction: updatedTransaction,
            braintreeRefund: refundTransaction,
          },
        };
        return refundResult;
      } catch (e) {
        this.logger.error(`Error creating Braintree refund: ${e.message} ${JSON.stringify(e)}`, e);
        throw new MedusaError(MedusaError.Types.INVALID_DATA, `Failed to create Braintree refund: ${e.message}`);
      }
    } else {
      return {
        data: {
          ...input.data,
          braintreeTransaction: braintreeTransaction,
        },
      };
    }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const paymentSessionData = await this.parsePaymentSessionData(input.data ?? {});

    if (!paymentSessionData.transaction?.id) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Braintree transaction not found');
    }

    const retrieved = await this.retrieveTransaction(paymentSessionData.transaction?.id);

    return {
      data: {
        ...input.data,
        braintreeTransaction: retrieved,
      },
    };
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return Promise.resolve({
      data: {
        ...input.data,
        amount: input.amount,
        currency_code: input.currency_code,
      },
    });
  }

  async createAccountHolder(input: CreateAccountHolderInput): Promise<CreateAccountHolderOutput> {
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
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Failed to update account holder: ${JSON.stringify(updateResult.errors)}`,
        );
      }

      return {
        data: { ...updateResult.customer },
      };
    } catch (e) {
      this.logger.error(`Error updating account holder: ${e.message}`, e);
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Failed to update account holder: ${e.message}`);
    }
  }

  async deleteAccountHolder(input: DeleteAccountHolderInput): Promise<DeleteAccountHolderOutput> {
    const { context } = input;

    const accountHolderId = context.account_holder?.data?.id as string;

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
      this.logger.error(`Error deleting account holder: ${e.message}`, e);
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Failed to delete account holder: ${e.message}`);
    }
  }

  async getWebhookActionAndData(webhookData: ProviderWebhookPayload['payload']): Promise<WebhookActionResult> {
    const logger = this.logger;

    logger.info(`Received Braintree webhook body as object : ${JSON.stringify(webhookData.data)}`);

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
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Failed to create Braintree customer: ${JSON.stringify(customerResult.errors)}`,
      );
    }

    return customerResult.customer;
  }
}

export default BraintreeBase;
