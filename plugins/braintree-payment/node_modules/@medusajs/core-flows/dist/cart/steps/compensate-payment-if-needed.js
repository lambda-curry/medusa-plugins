"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compensatePaymentIfNeededStep = exports.compensatePaymentIfNeededStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const refund_payment_recreate_payment_session_1 = require("../workflows/refund-payment-recreate-payment-session");
exports.compensatePaymentIfNeededStepId = "compensate-payment-if-needed";
/**
 * Purpose of this step is to be the last compensation in cart completion workflow.
 * If the cart completion fails, this step tries to cancel or refund the payment.
 *
 * @example
 * const data = compensatePaymentIfNeededStep({
 *   payment_session_id: "pay_123"
 * })
 */
exports.compensatePaymentIfNeededStep = (0, workflows_sdk_1.createStep)(exports.compensatePaymentIfNeededStepId, async (data, { container }) => {
    const { payment_session_id } = data;
    return new workflows_sdk_1.StepResponse(payment_session_id);
}, async (paymentSessionId, { container }) => {
    if (!paymentSessionId) {
        return;
    }
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data: paymentSessions } = await query.graph({
        entity: "payment_session",
        fields: [
            "id",
            "payment_collection_id",
            "amount",
            "raw_amount",
            "provider_id",
            "data",
            "payment.id",
            "payment.captured_at",
            "payment.customer.id",
        ],
        filters: {
            id: paymentSessionId,
        },
    });
    const paymentSession = paymentSessions[0];
    if (!paymentSession) {
        return;
    }
    if (paymentSession.payment?.captured_at) {
        try {
            const workflowInput = {
                payment_collection_id: paymentSession.payment_collection_id,
                provider_id: paymentSession.provider_id,
                customer_id: paymentSession.payment?.customer?.id,
                data: paymentSession.data,
                amount: paymentSession.raw_amount ?? paymentSession.amount,
                payment_id: paymentSession.payment.id,
                note: "Refunded due to cart completion failure",
            };
            await (0, refund_payment_recreate_payment_session_1.refundPaymentAndRecreatePaymentSessionWorkflow)(container).run({
                input: workflowInput,
            });
        }
        catch (e) {
            logger.error(`Error was thrown trying to refund payment - ${paymentSession.payment?.id} - ${e}`);
        }
    }
});
//# sourceMappingURL=compensate-payment-if-needed.js.map