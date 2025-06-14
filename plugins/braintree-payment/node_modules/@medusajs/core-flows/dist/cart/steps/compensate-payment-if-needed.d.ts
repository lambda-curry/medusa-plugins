/**
 * The payment session's details for compensation.
 */
export interface CompensatePaymentIfNeededStepInput {
    /**
     * The payment to compensate.
     */
    payment_session_id: string;
}
export declare const compensatePaymentIfNeededStepId = "compensate-payment-if-needed";
/**
 * Purpose of this step is to be the last compensation in cart completion workflow.
 * If the cart completion fails, this step tries to cancel or refund the payment.
 *
 * @example
 * const data = compensatePaymentIfNeededStep({
 *   payment_session_id: "pay_123"
 * })
 */
export declare const compensatePaymentIfNeededStep: import("@medusajs/framework/workflows-sdk").StepFunction<CompensatePaymentIfNeededStepInput, string>;
//# sourceMappingURL=compensate-payment-if-needed.d.ts.map