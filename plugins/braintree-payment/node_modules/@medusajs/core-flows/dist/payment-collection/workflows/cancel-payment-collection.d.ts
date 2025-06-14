import { PaymentCollectionDTO } from "@medusajs/framework/types";
/**
 * The data to cancel a payment collection.
 */
export interface CancelPaymentCollectionWorkflowInput {
    /**
     * The id of the payment collection to cancel.
     */
    payment_collection_id: string;
}
export declare const cancelPaymentCollectionWorkflowId = "cancel-payment-collection";
/**
 * This workflow cancels a payment collection that is either not paid or authorized.
 *
 * Payment colelction that is completed or already canceled cannot be canceled.
 *
 * @example
 * const data = cancelPaymentCollectionStep({
 *   payment_collection_id: "paycol_123",
 * })
 */
export declare const cancelPaymentCollectionWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CancelPaymentCollectionWorkflowInput, PaymentCollectionDTO, []>;
//# sourceMappingURL=cancel-payment-collection.d.ts.map