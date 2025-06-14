/**
 * The data to cancel payments.
 */
export interface CancelPaymentStepInput {
    /**
     * The IDs of the payments to cancel.
     */
    ids: string[];
}
export declare const cancelPaymentStepId = "cancel-payment";
/**
 * This step cancels one or more authorized payments.
 */
export declare const cancelPaymentStep: import("@medusajs/framework/workflows-sdk").StepFunction<CancelPaymentStepInput, string[]>;
//# sourceMappingURL=cancel-payment.d.ts.map