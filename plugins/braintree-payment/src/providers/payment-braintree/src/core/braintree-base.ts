import {
  AbstractPaymentProvider,
  ContainerRegistrationKeys,
  MedusaError,
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
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  MedusaContainer,
  PaymentAccountHolderDTO,
  PaymentCustomerDTO,
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
import type { BraintreeOptions, CustomFields } from '../types';

export interface BraintreePaymentSessionData {
  clientToken: string;
  amount: number;
  currency_code: string;
  paymentMethodNonce?: string;
  braintreeTransaction?: Transaction;
}

class BraintreeBase extends AbstractPaymentProvider<BraintreeOptions> {
  identifier = 'braintree';
  protected readonly options_: BraintreeOptions;
  protected gateway: Braintree.BraintreeGateway;
  logger: Logger;
  container_: MedusaContainer;
  protected constructor(container: MedusaContainer, options: BraintreeOptions) {
    super(container, options);

    this.options_ = options;
    this.logger = container[ContainerRegistrationKeys.LOGGER];
    this.container_ = container;

    this.init();
  }

  private parsePaymentSessionData(data: Record<string, unknown>): BraintreePaymentSessionData {
    return {
      clientToken: data.clientToken as string,
      amount: data.amount as number,
      currency_code: data.currency_code as string,
      paymentMethodNonce: data.paymentMethodNonce as string | undefined,
      braintreeTransaction: data.braintreeTransaction as Transaction | undefined,
    };
  }

  protected init(): void {
    let environment: Braintree.Environment;
    switch (this.options_.environment) {
      case 'qa':
        environment = Braintree.Environment.Qa;
        break;
      case 'sandbox':
        environment = Braintree.Environment.Sandbox;
        break;
      case 'production':
        environment = Braintree.Environment.Production;
        break;
      case 'development':
        environment = Braintree.Environment.Development;
        break;
      default:
        environment = Braintree.Environment.Sandbox;
        break;
    }

    this.gateway =
      this.gateway ||
      new Braintree.BraintreeGateway({
        environment: environment,
        merchantId: this.options_.merchantId!,
        publicKey: this.options_.publicKey!,
        privateKey: this.options_.privateKey!,
      });
  }

  static validateOptions(options: BraintreeOptions): void {
    // Required string fields
    const requiredFields = ['merchantId', 'publicKey', 'privateKey', 'webhookSecret', 'environment'];
    for (const field of requiredFields) {
      if (!isDefined(options[field]) || typeof options[field] !== 'string') {
        throw new MedusaError(
          MedusaError.Types.INVALID_ARGUMENT,
          `Required option "${field}" is missing or invalid in Braintree plugin`,
        );
      }
    }

    // Validate environment value
    const validEnvironments = ['qa', 'sandbox', 'production', 'development'];
    if (!validEnvironments.includes(options.environment.toLowerCase())) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        `Invalid environment "${options.environment}" in Braintree plugin. Must be one of: ${validEnvironments.join(', ')}`,
      );
    }

    // Optional boolean fields with defaults
    options.enable3DSecure = options.enable3DSecure ?? false;
    options.savePaymentMethod = options.savePaymentMethod ?? false;
    options.autoCapture = options.autoCapture ?? false;

    // Type check boolean fields
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
    const sessionData = this.parsePaymentSessionData(input.data ?? {});
    const braintreeTransaction = sessionData.braintreeTransaction;

    if (!braintreeTransaction) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Braintree transaction not found');
    }

    const paymentsResponse = await this.gateway.transaction.find(braintreeTransaction.id);

    const authorized: TransactionStatus = 'authorized';
    const submitted_for_settlement: TransactionStatus = 'submitted_for_settlement';
    const settled: TransactionStatus = 'settled';
    const settling: TransactionStatus = 'settling';

    switch (paymentsResponse.status) {
      case authorized: {
        const { id, amount } = paymentsResponse;
        const toPay = amount.toString();

        const captureResult = await this.gateway.transaction.submitForSettlement(id, toPay.toString());

        if (captureResult.success) {
          const transaction = await this.retrieveTransaction(braintreeTransaction.id);

          const capturePaymentResult: CapturePaymentOutput = {
            data: {
              ...input.data,
              braintreeTransaction: transaction,
            },
          };
          return capturePaymentResult;
        } else {
          throw new MedusaError(
            MedusaError.Types.NOT_FOUND,
            `No payments found for transaction ${braintreeTransaction.id}`,
          );
        }
      }
      case settled:
      case settling:
      case submitted_for_settlement: {
        const syncResult = await this.retrieveTransaction(braintreeTransaction.id);

        const result: CapturePaymentOutput = {
          data: {
            ...input.data,
            braintreeTransaction: syncResult.braintreeTransaction,
          },
        };

        return result;
      }

      default: {
        throw new MedusaError(MedusaError.Types.NOT_FOUND, `Not in a state to settle ${braintreeTransaction.id}`);
      }
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    try {
      const sessionData = this.parsePaymentSessionData(input.data ?? {});

      this.logger.warn(`authorizePayment: ${JSON.stringify(sessionData)}`);

      let transaction: Transaction | undefined = sessionData.braintreeTransaction;

      if (!sessionData.paymentMethodNonce)
        throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, 'Payment method nonce is required');

      if (!transaction) {
        const braintreeTransaction = await this.createTransaction({
          input,
        });
        if (!braintreeTransaction) {
          throw new MedusaError(MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR, 'Braintree transaction failed');
        }
        transaction = braintreeTransaction;
      }

      const paymentStatusRequest: GetPaymentStatusInput = {
        ...input,
        data: {
          ...input.data,
          braintreeTransaction: transaction,
        },
      };

      const status = await this.getPaymentStatus(paymentStatusRequest);

      this.logger.warn(`authorizePayment status: ${JSON.stringify(status)}`);

      if (status.status === 'authorized' && this.options_.autoCapture) {
        status.status = 'captured';
      }

      return {
        data: {
          ...input.data,
          braintreeTransaction: transaction,
        },
        status: status.status,
      };
    } catch (error) {
      this.logger.error(`Error authorizing payment: ${error.message}`, error);
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Failed to authorize payment: ${error.message}`);
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const sessionData = this.parsePaymentSessionData(input.data ?? {});
    const { braintreeTransaction } = await this.retrieveTransaction(sessionData.braintreeTransaction?.id as string);

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
        const result = await this.retrieveTransaction(braintreeTransaction.id);
        return {
          data: {
            ...input.data,
            braintreeTransaction: result.braintreeTransaction,
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
    amount,
    customFields,
    nonce,
  }: {
    accountHolder?: PaymentAccountHolderDTO;
    customer?: PaymentCustomerDTO;
    amount: string;
    customFields?: CustomFields;
    nonce: string;
  }): Braintree.TransactionRequest {
    const billingAddress = customer?.billing_address;
    const transactionRequest: Braintree.TransactionRequest = {
      amount: amount.toString(),

      billing: {
        company: billingAddress?.company ?? '',
        streetAddress: billingAddress?.address_1 ?? '',
        extendedAddress: billingAddress?.address_2 ?? '',
        locality: billingAddress?.city ?? '',
        region: billingAddress?.province ?? '',
        postalCode: billingAddress?.postal_code ?? '',
        countryCodeAlpha2: billingAddress?.country_code ?? '',
      },
      customerId: (accountHolder?.data?.braintree_customer_id as string) ?? undefined,
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
      customFields: customFields,
    };
    return transactionRequest;
  }

  async retrieveTransaction(braintreeTransactionId: string): Promise<{
    braintreeTransaction: Transaction;
  }> {
    const transactionData = await this.gateway.transaction.find(braintreeTransactionId);

    return {
      braintreeTransaction: transactionData as Transaction,
    };
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const paymentSessionId = input.context?.idempotency_key;

    const { data } = input;
    const tokenData = await this.gateway.clientToken.generate({});
    const dataToSave: BraintreePaymentSessionData & { medusaPaymentSessionId: string } = {
      clientToken: tokenData.clientToken,
      medusaPaymentSessionId: paymentSessionId as string,
      paymentMethodNonce: data?.paymentMethodNonce as string,
      amount: input.amount as number,
      currency_code: input.currency_code,
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
    const sessionData = this.parsePaymentSessionData(input.data ?? {});

    const toPay = sessionData.amount.toString();

    const braintreeTransactionCreateRequest = this.getBraintreeTransactionCreateRequestBody({
      amount: toPay,
      nonce: sessionData.paymentMethodNonce as string,
      customFields: {
        medusa_payment_session_id: input.context?.idempotency_key,
        customer_id: input.context?.customer?.id ?? '',
      },
      accountHolder: input.context?.account_holder,
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
        const result = await this.retrieveTransaction(braintreeTransaction.transaction.id);
        return result.braintreeTransaction;
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
    if (!accountHolderId) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Account holder id is required`);
    }
    try {
      const accountHolder = await this.gateway.customer.find(accountHolderId);
      if (!accountHolder) {
        throw new MedusaError(MedusaError.Types.NOT_FOUND, `Account holder with id ${accountHolderId} not found`);
      }

      await this.gateway.customer.delete(accountHolder.id);

      return {
        data: {},
      };
    } catch (e) {
      this.logger.error(`Error deleting account holder: ${e.message}`, e);
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Failed to delete account holder: ${e.message}`);
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    const sessionData = this.parsePaymentSessionData(input.data ?? {});
    const braintreeTransaction = sessionData.braintreeTransaction;

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
    const braintreeTransaction = input.data?.braintreeTransaction as Transaction;
    const id = braintreeTransaction.id as string;

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
    let status: PaymentSessionStatus = PaymentSessionStatus.PENDING;
    switch (transaction.status) {
      case 'authorization_expired':
        status = PaymentSessionStatus.CANCELED;
        break;
      case 'authorizing':
        status = PaymentSessionStatus.REQUIRES_MORE;
        break;
      case 'authorized':
        status = PaymentSessionStatus.AUTHORIZED;
        break;
      case 'settled':
        status = PaymentSessionStatus.CAPTURED;
        break;
      case 'settling':
        status = PaymentSessionStatus.AUTHORIZED;
        break;
      case 'settlement_confirmed':
        status = PaymentSessionStatus.CAPTURED;
        break;
      case 'settlement_pending':
        status = PaymentSessionStatus.AUTHORIZED;
        break;
      case 'submitted_for_settlement':
        status = PaymentSessionStatus.AUTHORIZED;
        break;
      case 'voided':
        status = PaymentSessionStatus.CANCELED;
        break;
      case 'failed':
        status = PaymentSessionStatus.ERROR;
        break;
      default:
        status = PaymentSessionStatus.PENDING;
    }
    return { status };
  }

  async savePaymentMethod(input: SavePaymentMethodInput): Promise<SavePaymentMethodOutput> {
    const sessionData = this.parsePaymentSessionData(input.data ?? {});

    const braintreeCustomerId = input.context?.account_holder?.data?.id as string;
    if (!braintreeCustomerId) {
      throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, 'Braintree customer id is required');
    }

    const paymentMethodNonce = sessionData?.paymentMethodNonce;

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
    const sessionData = this.parsePaymentSessionData(input.data ?? {});
    const { braintreeTransaction } = await this.retrieveTransaction(sessionData.braintreeTransaction?.id as string);
    if (!braintreeTransaction) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Braintree transaction not found');
    }

    const refundAmount = Number.parseFloat(input.amount.toString());

    if (braintreeTransaction.status === 'submitted_for_settlement' || braintreeTransaction.status === 'authorized') {
      const cancelledTransaction = await this.gateway.transaction.void(braintreeTransaction.id);

      const result = await this.retrieveTransaction(braintreeTransaction.id);

      const refundResult: RefundPaymentOutput = {
        data: {
          ...input.data,
          braintreeTransaction: result.braintreeTransaction,
          braintreeRefund: cancelledTransaction,
        },
      };
      return refundResult;
    }

    if (braintreeTransaction.status !== 'settled' && braintreeTransaction.status !== 'settling') {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Braintree transaction with ID ${braintreeTransaction.id} cannot be refunded`,
      );
    }

    if (braintreeTransaction.id) {
      const refundRequest = {
        amount: refundAmount,
      };
      try {
        const { transaction: refundTransaction } = await this.gateway.transaction.refund(
          braintreeTransaction.id,
          refundRequest.amount.toString(),
        );

        const result = await this.retrieveTransaction(braintreeTransaction.id);

        const refundResult: RefundPaymentOutput = {
          data: {
            ...input.data,
            braintreeTransaction: result.braintreeTransaction,
            braintreeRefund: refundTransaction,
          },
        };
        return refundResult;
      } catch (e) {
        this.logger.error(`Error creating Braintree refund: ${e.message}`, e);
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
    const paymentSessionData = this.parsePaymentSessionData(input.data ?? {});

    if (!paymentSessionData.braintreeTransaction?.id) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Braintree transaction not found');
    }

    const retrieved = await this.retrieveTransaction(paymentSessionData.braintreeTransaction?.id);

    return {
      data: {
        ...input.data,
        braintreeTransaction: retrieved.braintreeTransaction,
      },
    };
  }

  // biome-ignore lint/suspicious/useAwait: <explanation>
  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return {
      data: {
        ...input.data,
        amount: input.amount,
        currency_code: input.currency_code,
      },
    };
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
}

export default BraintreeBase;
