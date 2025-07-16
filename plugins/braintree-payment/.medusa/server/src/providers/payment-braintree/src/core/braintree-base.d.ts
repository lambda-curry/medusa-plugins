import { AbstractPaymentProvider } from '@medusajs/framework/utils';
import type { AuthorizePaymentInput, AuthorizePaymentOutput, CancelPaymentInput, CancelPaymentOutput, CapturePaymentInput, CapturePaymentOutput, CreateAccountHolderInput, CreateAccountHolderOutput, DeleteAccountHolderInput, DeleteAccountHolderOutput, DeletePaymentInput, DeletePaymentOutput, GetPaymentStatusInput, GetPaymentStatusOutput, InitiatePaymentInput, InitiatePaymentOutput, Logger, MedusaContainer, ProviderWebhookPayload, RefundPaymentInput, RefundPaymentOutput, RetrievePaymentInput, RetrievePaymentOutput, SavePaymentMethodInput, SavePaymentMethodOutput, UpdateAccountHolderInput, UpdateAccountHolderOutput, UpdatePaymentInput, UpdatePaymentOutput, WebhookActionResult } from '@medusajs/types';
import type { Transaction } from 'braintree';
import Braintree from 'braintree';
import type { BraintreeOptions } from '../types';
export interface BraintreePaymentSessionData {
    clientToken: string;
    amount: number;
    currency_code: string;
    paymentMethodNonce?: string;
    braintreeTransaction?: Transaction;
}
declare class BraintreeBase extends AbstractPaymentProvider<BraintreeOptions> {
    identifier: string;
    protected readonly options_: BraintreeOptions;
    protected gateway: Braintree.BraintreeGateway;
    logger: Logger;
    container_: MedusaContainer;
    protected constructor(container: MedusaContainer, options: BraintreeOptions);
    private parsePaymentSessionData;
    protected init(): void;
    static validateOptions(options: BraintreeOptions): void;
    capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput>;
    authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput>;
    cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput>;
    private getBraintreeTransactionCreateRequestBody;
    retrieveTransaction(braintreeTransactionId: string): Promise<{
        braintreeTransaction: Transaction;
    }>;
    initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput>;
    private createTransaction;
    private createBraintreeCustomer;
    createAccountHolder(input: CreateAccountHolderInput): Promise<CreateAccountHolderOutput>;
    updateAccountHolder(input: UpdateAccountHolderInput): Promise<UpdateAccountHolderOutput>;
    deleteAccountHolder(input: DeleteAccountHolderInput): Promise<DeleteAccountHolderOutput>;
    deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput>;
    getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput>;
    savePaymentMethod(input: SavePaymentMethodInput): Promise<SavePaymentMethodOutput>;
    refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput>;
    retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput>;
    updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput>;
    getWebhookActionAndData(webhookData: ProviderWebhookPayload['payload']): Promise<WebhookActionResult>;
}
export default BraintreeBase;
