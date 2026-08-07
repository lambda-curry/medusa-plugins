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

/** Medusa DI container fields required by {@link BraintreeBase}. */
export type BraintreeConstructorArgs = Record<string, unknown> & {
  logger: Logger;
  cache: ICacheService;
};

/**
 * Payment provider context plus optional Braintree sale fields
 * (billing, shipping, line items, amounts) passed through to `transaction.sale`.
 */
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

/**
 * Shape stored on the Medusa payment session `data` for this provider.
 * Accepts camelCase aliases when parsing (normalized to snake_case fields).
 */
export interface BraintreePaymentSessionData {
  client_token: string;
  transaction: Transaction;
  amount: number;
  currency_code: string;
  payment_method_nonce?: string;
  account_holder?: PaymentAccountHolderDTO;
}

/** Optional fields accepted on {@link BraintreeBase.initiatePayment} input `data`. */
export interface BraintreeInitiatePaymentData {
  payment_method_nonce?: string;
}

/**
 * Builds the cache key used for client tokens scoped to a Medusa customer id.
 * @param customerId - Medusa customer id
 */
const buildTokenCacheKey = (customerId: string) => `braintree:clientToken:${customerId}`;
const UNKNOWN_BRAINTREE_ERROR = 'Unknown error';

/** Minimal shape of a Braintree validation error entry. */
type BraintreeValidationErrorLike = {
  attribute?: string;
  code?: string;
  message?: string;
};

/** Braintree `errors` collection that exposes `deepErrors()`. */
type BraintreeValidationErrorsCollectionLike = {
  deepErrors?: () => BraintreeValidationErrorLike[];
};

type TransactionSaleResponse = Awaited<
  ReturnType<Braintree.BraintreeGateway['transaction']['sale']>
>;

/**
 * Subset of Braintree Result / transaction fields used when classifying failures
 * and building user-facing error messages.
 */
type BraintreeErrorResponseLike = {
  message?: string;
  success?: boolean;
  errors?: BraintreeValidationErrorsCollectionLike;
  transaction?: {
    status?: string;
    gatewayRejectionReason?: string;
    processorResponseCode?: string;
    processorResponseText?: string;
    processorSettlementResponseCode?: string;
    processorSettlementResponseText?: string;
  };
};

const BRAINTREE_DECLINED_TRANSACTION_STATUSES = ['processor_declined', 'settlement_declined'] as const;

/** Transaction statuses refunded via void rather than a separate refund call. */
const VOIDABLE_REFUND_STATUSES: readonly TransactionStatus[] = ['submitted_for_settlement', 'authorized'];
/** Transaction statuses refunded via `transaction.refund`. */
const SETTLED_REFUND_STATUSES: readonly TransactionStatus[] = ['settled', 'settling'];

/**
 * @param status - Braintree transaction status
 * @returns Whether a refund should void the transaction instead of calling refund
 */
const isVoidableRefundStatus = (status: TransactionStatus): boolean =>
  (VOIDABLE_REFUND_STATUSES as readonly string[]).includes(status);

/**
 * @param status - Braintree transaction status
 * @returns Whether a refund should call `transaction.refund`
 */
const isSettledRefundStatus = (status: TransactionStatus): boolean =>
  (SETTLED_REFUND_STATUSES as readonly string[]).includes(status);

/** One entry appended to session `data.braintreeRefund` after a void or refund. */
type BraintreeRefundHistoryEntry = {
  type: 'voided' | 'refund';
  transaction: Transaction;
};

/** Resolved void-vs-refund action for {@link BraintreeBase.executeRefundAction}. */
type RefundAction = {
  kind: BraintreeRefundHistoryEntry['type'];
  transaction: Transaction;
};

/** Gateway Result that may include a transaction payload. */
type GatewayTransactionResponse = BraintreeErrorResponseLike & {
  transaction?: Transaction;
};

/**
 * Whether a Braintree transaction status is a known processor/settlement decline.
 * @param status - Optional Braintree transaction status string
 */
export const isBraintreeDeclinedTransactionStatus = (status?: string): boolean =>
  (BRAINTREE_DECLINED_TRANSACTION_STATUSES as readonly string[]).includes(status ?? '');

/**
 * Asserts `value` is a non-empty string.
 * @param value - Value to validate
 * @param fieldName - Used in the error message
 * @returns The original string value (not trimmed)
 * @throws {MedusaError} `INVALID_ARGUMENT` when empty or not a string
 */
const validateString = (value: unknown, fieldName: string): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, `${fieldName} must be a non-empty string`);
  }
  return value;
};

/**
 * Flattens Braintree validation errors that include a message.
 * @param errors - Optional Braintree errors collection
 */
const getBraintreeValidationErrors = (
  errors?: BraintreeValidationErrorsCollectionLike,
): BraintreeValidationErrorLike[] => {
  if (typeof errors?.deepErrors !== 'function') return [];
  return errors.deepErrors().filter((error): error is BraintreeValidationErrorLike => Boolean(error?.message));
};

/**
 * Formats a single Braintree validation error for logging / messages.
 * @param error - Validation error entry
 */
const formatBraintreeValidationError = (error: BraintreeValidationErrorLike): string => {
  const attribute = error.attribute?.trim();
  const prefix = attribute ? `${attribute}: ` : '';
  const suffix = error.code ? ` (${error.code})` : '';
  return `BT: ${prefix}${error.message}${suffix}`;
};

/**
 * Picks the best human-readable message from a Braintree Result
 * (gateway rejection → processor → settlement → validation → message).
 * @param response - Braintree-like failure response
 */
const getBraintreeErrorMessage = (response: BraintreeErrorResponseLike): string => {
  const gatewayRejectionReason = response.transaction?.gatewayRejectionReason?.trim();
  if (gatewayRejectionReason) return gatewayRejectionReason;

  const processorResponseText = response.transaction?.processorResponseText?.trim();
  if (processorResponseText) {
    const processorResponseCode = response.transaction?.processorResponseCode?.trim();
    return processorResponseCode ? `${processorResponseText} (${processorResponseCode})` : processorResponseText;
  }

  const settlementResponseText = response.transaction?.processorSettlementResponseText?.trim();
  if (settlementResponseText) {
    const settlementResponseCode = response.transaction?.processorSettlementResponseCode?.trim();
    return settlementResponseCode
      ? `${settlementResponseText} (${settlementResponseCode})`
      : settlementResponseText;
  }

  const validationErrors = getBraintreeValidationErrors(response.errors).map(formatBraintreeValidationError);
  if (validationErrors.length) return validationErrors.join('; ');

  const message = response.message?.trim();
  if (message) return message;

  return UNKNOWN_BRAINTREE_ERROR;
};

/**
 * Whether a Braintree Result should be treated as a failure
 * (`success === false` or declined transaction status).
 * @param response - Braintree-like response
 */
export const isBraintreeFailureResponse = (response: BraintreeErrorResponseLike): boolean =>
  !response.success || isBraintreeDeclinedTransactionStatus(response.transaction?.status);

/** Logger callback used by {@link throwOnBraintreeFailure}. */
type BraintreeFailureLogFn = (operation: string, error: unknown, context?: Record<string, unknown>) => void;

/**
 * Logs and throws a {@link MedusaError} for a failed Braintree Result.
 * Uses `PAYMENT_AUTHORIZATION_ERROR` when processor/gateway signals are present;
 * otherwise `INVALID_DATA`.
 * @param response - Failed Braintree-like response
 * @param operation - Label for logs (e.g. `refundPayment (void)`)
 * @param log - Detail logger (typically `logErrorDetail`)
 * @param context - Extra fields merged into the log payload
 * @throws {MedusaError} Always throws; never returns
 */
export function throwOnBraintreeFailure(
  response: BraintreeErrorResponseLike,
  operation: string,
  log: BraintreeFailureLogFn,
  context: Record<string, unknown>,
): never {
  const message = getBraintreeErrorMessage(response);
  const hasProcessorSignal =
    response.transaction?.gatewayRejectionReason ||
    response.transaction?.processorResponseText ||
    response.transaction?.processorSettlementResponseText;
  const type = hasProcessorSignal
    ? MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR
    : MedusaError.Types.INVALID_DATA;

  log(`${operation} failed`, new Error(message), {
    ...context,
    transactionStatus: response.transaction?.status,
    gatewayRejectionReason: response.transaction?.gatewayRejectionReason,
    processorResponseCode: response.transaction?.processorResponseCode,
    processorResponseText: response.transaction?.processorResponseText,
    processorSettlementResponseCode: response.transaction?.processorSettlementResponseCode,
    processorSettlementResponseText: response.transaction?.processorSettlementResponseText,
    validationErrors: getBraintreeValidationErrors(response.errors).map(formatBraintreeValidationError),
  });

  throw new MedusaError(type, message);
}

/**
 * Wraps an unknown exception as `MedusaError` (`INVALID_DATA`) after logging.
 * Does not inspect or preserve an existing {@link MedusaError} type — callers
 * that need rethrow-as-is should check before calling this.
 * @param error - Caught value
 * @param operation - Verb phrase used in the message (`Failed to ${operation}`)
 * @param logger - Medusa logger
 * @param context - Optional structured context appended to the log line
 * @returns A new `INVALID_DATA` MedusaError (does not throw)
 */
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

/**
 * Medusa {@link AbstractPaymentProvider} implementation for Braintree.
 * Handles client tokens, sale/authorize, capture, void/cancel, refunds,
 * vaulted payment methods, account holders (Braintree customers), and webhooks.
 */
class BraintreeBase extends AbstractPaymentProvider<BraintreeOptions> {
  identifier = 'braintree';
  protected readonly options_: BraintreeOptions;
  protected gateway: Braintree.BraintreeGateway;
  logger: Logger;
  cache: ICacheService;

  /**
   * @param container - Medusa container with logger and cache
   * @param options - Validated Braintree plugin options
   */
  protected constructor(container: BraintreeConstructorArgs, options: BraintreeOptions) {
    super(container, options);

    this.options_ = options;
    this.logger = container[ContainerRegistrationKeys.LOGGER];
    this.cache = container[Modules.CACHE];
    this.gateway = this.init();
  }

  /**
   * Caches a Braintree client token for a Medusa customer until near expiry.
   * No-ops when TTL is non-positive or the token is empty.
   * @param clientToken - Token from `clientToken.generate`
   * @param customerId - Medusa customer id (required)
   * @param expiresOnEpochSeconds - Absolute expiry in unix seconds
   * @throws {MedusaError} `INVALID_ARGUMENT` when `customerId` is empty
   */
  async saveClientTokenToCache(clientToken: string, customerId: string, expiresOnEpochSeconds: number): Promise<void> {
    if (!customerId) throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, 'Customer ID is required');
    const nowSeconds = Math.floor(Date.now() / 1000);
    const ttlSeconds = expiresOnEpochSeconds - nowSeconds - 1;
    if (!customerId || !clientToken || ttlSeconds <= 0) return;
    await this.cache.set(buildTokenCacheKey(customerId), clientToken, ttlSeconds);
  }

  /**
   * Reads a cached client token for a Medusa customer, if present.
   * @param customerId - Medusa customer id
   * @returns Cached token or `null`
   */
  async getClientTokenFromCache(customerId: string): Promise<string | null> {
    const token = (await this.cache.get(buildTokenCacheKey(customerId))) as string | null;
    return token;
  }

  /**
   * Logs an info line when `options.logging` is true.
   * @param message - Message prefix
   * @param context - Optional structured context JSON-stringified onto the line
   */
  protected logDebug(message: string, context?: Record<string, unknown>): void {
    if (this.options_.logging) {
      const msg = context ? `${message} ${JSON.stringify(context)}` : message;
      this.logger.info(`[Braintree] ${msg}`);
    }
  }

  /**
   * Logs error details when `options.logging` is true (message, context, stack).
   * @param operation - Operation label
   * @param error - Caught value
   * @param context - Optional structured context
   */
  protected logErrorDetail(operation: string, error: unknown, context?: Record<string, unknown>): void {
    if (!this.options_.logging) return;
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const ctx = context ? ` ${JSON.stringify(context)}` : '';
    const stackLine = stack ? ` stack: ${stack}` : '';
    this.logger.info(`[Braintree] ERROR ${operation}: ${msg}${ctx}${stackLine}`);
  }

  /**
   * Whether sandbox test settlement is enabled (`TEST_FORCE_SETTLED=true` and env is sandbox).
   */
  private isTestForceSettledEnabled(): boolean {
    return (
      process.env.TEST_FORCE_SETTLED === 'true' && this.options_.environment.toLowerCase() === 'sandbox'
    );
  }

  /**
   * Returns a usable Braintree client token, preferring cache for known customers.
   * Guests always generate a fresh token. `accountHolder` is accepted for API symmetry
   * but is not used when generating the token today.
   * @param medusaCustomerId - Optional Medusa customer id for cache keying
   * @param accountHolder - Optional account holder (unused for token generation)
   * @returns Client token string, or `null` only if generation returned none (unusual)
   */
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

  /**
   * Validates and normalizes payment session `data` (camelCase → snake_case aliases).
   * @param data - Raw session / payment `data` bag
   * @returns Normalized {@link BraintreePaymentSessionData}
   * @throws {MedusaError} `INVALID_ARGUMENT` when Zod validation fails
   */
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

  /**
   * Creates (or reuses) the Braintree SDK gateway from plugin options.
   * @returns Configured {@link Braintree.BraintreeGateway}
   */
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

  /**
   * Validates plugin options at module load (Medusa `validateOptions` hook).
   * Mutates `options` to apply boolean defaults when unset.
   * @param options - Raw provider options
   * @throws {MedusaError} `INVALID_ARGUMENT` for missing/invalid fields
   */
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
    options.disableVoidTransactions = options.disableVoidTransactions ?? false;
    options.logging = options.logging ?? false;

    const booleanFields = [
      'enable3DSecure',
      'savePaymentMethod',
      'autoCapture',
      'allowRefundOnRefunded',
      'disableVoidTransactions',
      'logging',
    ];
    for (const field of booleanFields) {
      if (isDefined(options[field as keyof BraintreeOptions]) && typeof options[field as keyof BraintreeOptions] !== 'boolean') {
        throw new MedusaError(
          MedusaError.Types.INVALID_ARGUMENT,
          `Option "${field}" must be a boolean in Braintree plugin`,
        );
      }
    }
  }

  /**
   * Medusa capture hook: submits an authorized transaction for settlement,
   * or returns current data if already settling/settled.
   * @param input - Payment `data` including Braintree `transaction`
   * @throws {MedusaError} `NOT_FOUND` when transaction missing, settle fails, or status is not capturable
   */
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

  /**
   * Medusa authorize hook (cart completion): creates a Braintree sale from the
   * payment method nonce when no transaction exists yet, then returns mapped status.
   * When `autoCapture` is on and status is authorized, returns `captured`.
   * Propagates existing {@link MedusaError} values; wraps unknown errors via {@link rethrowGatewayError}.
   * @param input - Session `data` including amount, nonce, optional transaction
   * @throws {MedusaError} `INVALID_ARGUMENT` without nonce; auth/gateway errors otherwise
   */
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
      this.logger.error(`Error authorizing transaction: ${(error as Error).message}`, error as Error);
      this.rethrowGatewayError(error, 'authorize payment', {
        amount: (input.data as { amount?: number })?.amount,
        currency_code: (input.data as { currency_code?: string })?.currency_code,
      });
    }
  }

  /**
   * Medusa cancel hook: voids the Braintree transaction when status allows
   * (authorized, submitted_for_settlement, or PayPal settling).
   * @param input - Payment `data` with transaction id
   * @throws {MedusaError} `NOT_FOUND` when void fails or status is not voidable
   */
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

  /**
   * Builds a Braintree `TransactionRequest` for `transaction.sale`
   * (amount, nonce, vault/3DS/autoCapture options, optional order context).
   * @param params.accountHolder - Used for Braintree `customerId` when present
   * @param params.customer - Medusa customer (reserved; not mapped into request today)
   * @param params.amount - Two-decimal amount string
   * @param params.nonce - Payment method nonce (required by caller)
   * @param params.context - Optional billing/shipping/line-item context
   */
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

  /**
   * Fetches a transaction by id from Braintree.
   * @param id - Braintree transaction id
   * @param throwOnMissing - When true (default), throw if the find result is falsy
   * @throws {MedusaError} `NOT_FOUND` when missing and `throwOnMissing` is true
   */
  private async retrieveTransaction(id: string, throwOnMissing: boolean = true): Promise<Transaction> {
    const transactionData = await this.gateway.transaction.find(id);

    if (!transactionData && throwOnMissing)
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `Braintree transaction not found: ${id}`);

    return transactionData;
  }

  /**
   * Maps a Braintree transaction status to Medusa {@link PaymentSessionStatus}.
   * Unmapped statuses (including declines) fall through to `PENDING`.
   * @param status - Braintree transaction status
   */
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

  /**
   * Validates initiate-payment `data` and normalizes nonce field aliases.
   * @param data - Raw initiate input `data`
   * @throws {MedusaError} `INVALID_ARGUMENT` when Zod validation fails
   */
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

  /**
   * Medusa initiate hook: generates/caches a client token and stores session data.
   * Does not create a Braintree sale (sale happens in {@link authorizePayment}).
   * @param input - Amount, currency, context (`idempotency_key` = payment session id)
   * @throws {MedusaError} `INVALID_ARGUMENT` for bad session id or failed token generation
   */
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

  /**
   * Re-throws {@link MedusaError} unchanged; otherwise wraps via {@link buildBraintreeError}.
   * Uses {@link MedusaError.isMedusaError} so typed errors survive across package boundaries.
   * @param error - Caught value
   * @param operation - Verb phrase for wrap message
   * @param context - Optional log context
   * @throws {MedusaError} Always throws
   */
  private rethrowGatewayError(
    error: unknown,
    operation: string,
    context?: Record<string, unknown>,
  ): never {
    if (MedusaError.isMedusaError(error)) throw error;
    this.logErrorDetail(operation, error, context);
    throw buildBraintreeError(error, operation, this.logger, context);
  }

  /**
   * Fail on gateway error responses; otherwise return the transaction (retrieve if missing).
   * @param response - Braintree Result-like payload
   * @param operation - Label passed to {@link throwOnBraintreeFailure}
   * @param context - Log context
   * @param fallbackTransactionId - Id used when `response.transaction` is absent
   * @throws {MedusaError} Via {@link throwOnBraintreeFailure} on failure responses
   */
  private async requireGatewayTransaction(
    response: GatewayTransactionResponse,
    operation: string,
    context: Record<string, unknown>,
    fallbackTransactionId: string,
  ): Promise<Transaction> {
    if (isBraintreeFailureResponse(response)) {
      throwOnBraintreeFailure(response, operation, this.logErrorDetail.bind(this), context);
    }

    return response.transaction ?? (await this.retrieveTransaction(fallbackTransactionId));
  }

  /**
   * Executes `gateway.transaction.sale`. Successful Results are returned as-is.
   * Failures always throw `PAYMENT_AUTHORIZATION_ERROR` (including validation declines).
   * @param request - Sale request body
   * @param context - Optional order context (logging only)
   * @throws {MedusaError} `PAYMENT_AUTHORIZATION_ERROR` when `success` is false
   */
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

    // Sales always surface as authorization failures (even validation declines).
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

  /**
   * Retrieve the created sale; void it if session sync fails so we don't leave an orphan auth.
   * A failed void is logged but does not replace the original sync error.
   * @param saleResponse - Successful sale Result (must include `transaction.id`)
   * @throws {MedusaError} `INVALID_DATA` when the sale Result has no transaction id, or via
   *   {@link buildBraintreeError} for the sync failure
   */
  private async retrieveOrVoidSale(saleResponse: TransactionSaleResponse): Promise<Transaction> {
    const transactionId = saleResponse.transaction?.id;

    if (!transactionId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Braintree sale succeeded without a transaction id',
      );
    }

    try {
      return await this.retrieveTransaction(transactionId);
    } catch (error) {
      this.logErrorDetail('sync payment session (retrieveTransaction)', error, { transactionId });
      try {
        const voidResponse = await this.gateway.transaction.void(transactionId);
        if (isBraintreeFailureResponse(voidResponse)) {
          const voidMessage = getBraintreeErrorMessage(voidResponse);
          this.logErrorDetail('void orphan sale after sync failure', new Error(voidMessage), {
            transactionId,
            transactionStatus: voidResponse.transaction?.status,
          });
          this.logger.error(
            `Failed to void orphan Braintree transaction ${transactionId} after sync failure: ${voidMessage}`,
          );
        }
      } catch (voidError) {
        this.logErrorDetail('void orphan sale after sync failure', voidError, { transactionId });
        this.logger.error(
          `Failed to void orphan Braintree transaction ${transactionId} after sync failure`,
          voidError instanceof Error ? voidError : undefined,
        );
      }
      throw buildBraintreeError(error, 'sync payment session', this.logger, { transactionId });
    }
  }

  /**
   * Creates a Braintree sale from authorize input (amount + nonce + context).
   * @param input - Authorize payment input with session data
   * @returns Created Braintree transaction
   * @throws {MedusaError} Propagated from sale / sync / {@link rethrowGatewayError}
   */
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

  /**
   * Medusa delete-payment hook: cancels (voids) when a transaction exists;
   * otherwise returns `data` unchanged.
   * @param input - Payment `data`
   * @throws {MedusaError} Via {@link rethrowGatewayError} when cancel fails
   */
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
        this.rethrowGatewayError(e, 'delete Braintree payment', { transactionId: transaction?.id });
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

  /**
   * Medusa status hook: maps live Braintree transaction status to {@link PaymentSessionStatus}.
   * Accepts `data.transaction` or `data.braintreeTransaction`. Missing id → `PENDING`.
   * @param input - Session/payment data containing a transaction id
   * @throws Re-throws raw gateway errors from `transaction.find` (unchanged)
   */
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

  /**
   * Medusa save-payment-method hook: vaults a nonce onto the Braintree customer
   * identified by `context.account_holder.data.id`.
   * @param input - Session data with nonce + account holder context
   * @throws {MedusaError} `INVALID_ARGUMENT` without customer id/nonce; `INVALID_DATA` on create failure
   */
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

  /**
   * Builds refund output `data`, appending one entry to `braintreeRefund` history.
   * Legacy non-array `braintreeRefund` values are ignored so spreads stay safe.
   * @param input - Original refund input (prior history read from `data.braintreeRefund`)
   * @param transaction - Pre-refund Braintree transaction retained on session data
   * @param entry - New void/refund history entry
   */
  private buildRefundPaymentOutput(
    input: RefundPaymentInput,
    transaction: Transaction,
    entry: BraintreeRefundHistoryEntry,
  ): RefundPaymentOutput {
    const stored = input.data?.braintreeRefund;
    const prior: BraintreeRefundHistoryEntry[] = Array.isArray(stored)
      ? (stored as BraintreeRefundHistoryEntry[])
      : [];

    return {
      data: {
        ...input.data,
        transaction,
        braintreeRefund: [...prior, entry],
      },
    };
  }

  /**
   * Loads and validates refund amount + live transaction for {@link refundPayment}.
   * @param input - Refund input with amount and session transaction
   * @throws {MedusaError} `INVALID_DATA` for bad amount; `NOT_FOUND` without transaction id
   */
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

  /**
   * Sandbox-only: force settle so refund paths can be exercised in tests.
   * No-ops unless `TEST_FORCE_SETTLED=true` and environment is sandbox.
   * @param transaction - Transaction to optionally settle
   */
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

  /**
   * Chooses void vs refund based on transaction status (after optional test settle).
   * @param transaction - Live Braintree transaction
   * @throws {MedusaError} `INVALID_DATA` when void is disabled and status is voidable
   * @throws {MedusaError} `NOT_FOUND` when status is neither voidable nor refundable
   */
  private async resolveRefundAction(transaction: Transaction): Promise<RefundAction> {
    const resolved = await this.applyTestForceSettled(transaction);

    if (isVoidableRefundStatus(resolved.status)) {
      if (this.options.disableVoidTransactions) {
        this.logger.error(
          `Braintree transaction with ID ${resolved.id} cannot be refunded right now because it's in status ${resolved.status}`,
        );
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Braintree transaction with ID ${resolved.id} cannot be refunded right now`,
        );
      }
      return { kind: 'voided', transaction: resolved };
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

  /**
   * Executes void or refund against Braintree for the resolved {@link RefundAction}.
   * @param action - Void or refund with target transaction
   * @param refundAmount - Amount used for refund calls (ignored for void)
   * @throws {MedusaError} Via {@link requireGatewayTransaction} / {@link rethrowGatewayError}
   */
  private async executeRefundAction(action: RefundAction, refundAmount: number): Promise<Transaction> {
    const { transaction, kind } = action;

    try {
      if (kind === 'voided') {
        const response = await this.gateway.transaction.void(transaction.id);
        this.logDebug('refundPayment void response', { response });
        return await this.requireGatewayTransaction(
          response,
          'refundPayment (void)',
          { transactionId: transaction.id },
          transaction.id,
        );
      }

      const refundAmountDecimal = formatToTwoDecimalString(refundAmount);
      this.logger.info(
        `Refunding transaction: ${transaction.id} with amount: ${refundAmountDecimal} (created from ${refundAmount})`,
      );

      const response = await this.gateway.transaction.refund(transaction.id, refundAmountDecimal);
      this.logDebug('refundPayment refund response', { response });
      return await this.requireGatewayTransaction(
        response,
        'refundPayment (refund)',
        { transactionId: transaction.id, refundAmount: refundAmountDecimal },
        transaction.id,
      );
    } catch (error) {
      this.rethrowGatewayError(
        error,
        kind === 'voided' ? 'void Braintree transaction' : 'create Braintree refund',
        { transactionId: transaction.id },
      );
    }
  }

  /**
   * Medusa refund hook: voids or refunds based on transaction status and
   * appends history under `data.braintreeRefund`.
   * @param input - Amount + session transaction
   */
  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const { transaction, refundAmount } = await this.loadRefundContext(input);
    const action = await this.resolveRefundAction(transaction);
    const resultTransaction = await this.executeRefundAction(action, refundAmount);

    return this.buildRefundPaymentOutput(input, action.transaction, {
      type: action.kind,
      transaction: resultTransaction,
    });
  }

  /**
   * Medusa retrieve hook: refreshes the Braintree transaction on payment `data`.
   * @param input - Payment `data` with transaction id
   * @throws {MedusaError} `NOT_FOUND` when transaction id is missing
   */
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

  /**
   * Medusa update-payment hook: updates amount/currency on session `data` only
   * (no Braintree API call).
   * @param input - New amount and currency
   */
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

  /**
   * Medusa create-account-holder hook: creates a Braintree customer from Medusa customer fields.
   * @param input - Context with Medusa customer
   * @throws {MedusaError} `INVALID_DATA` when Braintree customer create fails
   */
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

  /**
   * Medusa update-account-holder hook: updates Braintree customer fields.
   * Propagates existing {@link MedusaError}; wraps unknown errors via {@link buildBraintreeError}.
   * @param input - Account holder id + customer patch fields
   * @throws {MedusaError} `INVALID_DATA` / `NOT_FOUND` / wrapped gateway failures
   */
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
      if (MedusaError.isMedusaError(e)) throw e;
      throw buildBraintreeError(e, 'update account holder', this.logger, { accountHolderId });
    }
  }

  /**
   * Medusa delete-account-holder hook: deletes the Braintree customer.
   * Propagates existing {@link MedusaError}; wraps unknown errors via {@link buildBraintreeError}.
   * @param input - Account holder id in context
   * @throws {MedusaError} `INVALID_DATA` / `NOT_FOUND` / wrapped gateway failures
   */
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
      if (MedusaError.isMedusaError(e)) throw e;
      throw buildBraintreeError(e, 'delete account holder', this.logger, { accountHolderId });
    }
  }

  /**
   * Parses a Braintree webhook notification from form-encoded signature + payload.
   * @param webhookData - Provider webhook payload from Medusa
   * @returns Parsed notification, or `null` when parse succeeds with an empty body
   * @throws {MedusaError} When signature/payload validation fails (does not swallow)
   */
  private async parseWebhookNotification(
    webhookData: ProviderWebhookPayload['payload'],
  ): Promise<TransactionNotification | null> {
    const decodedPayload = new URLSearchParams(webhookData.data as unknown as string);

    try {
      const notification = (await this.gateway.webhookNotification.parse(
        decodedPayload.get('bt_signature') ?? '',
        decodedPayload.get('bt_payload') ?? '',
      )) as TransactionNotification | null;

      return notification ?? null;
    } catch (error) {
      this.logErrorDetail('webhook validation', error, { hasPayload: !!webhookData?.data });
      this.logger.error(`Braintree webhook validation failed : ${error}`);
      if (MedusaError.isMedusaError(error)) throw error;
      throw buildBraintreeError(error, 'validate Braintree webhook', this.logger, {
        hasPayload: !!webhookData?.data,
      });
    }
  }

  /**
   * Maps Braintree webhook `kind` to Medusa {@link PaymentActions}.
   * Unknown kinds → `NOT_SUPPORTED`.
   * @param kind - Braintree notification kind
   */
  private mapWebhookKindToAction(kind: TransactionNotification['kind']): PaymentActions {
    switch (kind) {
      case 'transaction_settled':
        return PaymentActions.SUCCESSFUL;
      case 'transaction_settlement_declined':
        return PaymentActions.FAILED;
      default:
        return PaymentActions.NOT_SUPPORTED;
    }
  }

  /**
   * Medusa webhook hook: parses the notification and returns action + session_id/amount.
   * Empty/null notification → `NOT_SUPPORTED`. Parse/signature failures propagate as errors.
   * Missing custom field session id → empty string.
   * @param webhookData - Raw provider webhook payload
   * @throws {MedusaError} When webhook validation fails
   */
  async getWebhookActionAndData(webhookData: ProviderWebhookPayload['payload']): Promise<WebhookActionResult> {
    this.logDebug('getWebhookActionAndData', { hasData: !!webhookData?.data });
    this.logger.info(`Received Braintree webhook with data: ${!!webhookData.data}`);

    const notification = await this.parseWebhookNotification(webhookData);
    if (!notification) {
      return { action: PaymentActions.NOT_SUPPORTED };
    }

    const action = this.mapWebhookKindToAction(notification.kind);
    if (action === PaymentActions.NOT_SUPPORTED) {
      return { action };
    }

    const paymentData = await this.gateway.transaction.find(notification.transaction.id);
    const customFields = (paymentData.customFields ?? {}) as CustomFields;
    const sessionId = customFields.medusa_payment_session_id ?? '';

    return {
      action,
      data: {
        session_id: sessionId,
        amount: paymentData.amount,
      },
    };
  }

  /**
   * Creates a Braintree customer from a Medusa {@link PaymentCustomerDTO}.
   * @param customer - Medusa customer fields
   * @throws {MedusaError} `INVALID_DATA` when `customer.create` is unsuccessful
   */
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
