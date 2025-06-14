"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundPaymentAndRecreatePaymentSessionWorkflow = exports.refundPaymentAndRecreatePaymentSessionWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const create_payment_session_1 = require("../../payment-collection/workflows/create-payment-session");
const refund_payments_1 = require("../../payment/workflows/refund-payments");
exports.refundPaymentAndRecreatePaymentSessionWorkflowId = "refund-payment-and-recreate-payment-session";
/**
 * This workflow refunds a payment and creates a new payment session.
 *
 * @summary
 *
 * Refund a payment and create a new payment session.
 */
exports.refundPaymentAndRecreatePaymentSessionWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.refundPaymentAndRecreatePaymentSessionWorkflowId, (input) => {
    refund_payments_1.refundPaymentsWorkflow.runAsStep({
        input: [
            {
                payment_id: input.payment_id,
                note: input.note,
                amount: input.amount,
            },
        ],
    });
    const paymentSession = create_payment_session_1.createPaymentSessionsWorkflow.runAsStep({
        input: {
            payment_collection_id: input.payment_collection_id,
            provider_id: input.provider_id,
            customer_id: input.customer_id,
            data: input.data,
        },
    });
    return new workflows_sdk_1.WorkflowResponse(paymentSession);
});
//# sourceMappingURL=refund-payment-recreate-payment-session.js.map