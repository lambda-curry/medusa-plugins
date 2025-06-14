"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelPaymentCollectionWorkflow = exports.cancelPaymentCollectionWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const update_payment_collection_1 = require("../steps/update-payment-collection");
const cancel_payment_1 = require("../steps/cancel-payment");
const validatePaymentCollectionCancellationStep = (0, workflows_sdk_1.createStep)("validate-payment-collection-cancellation", async (input) => {
    const { paymentCollection } = input;
    if (paymentCollection.status === utils_1.PaymentCollectionStatus.COMPLETED) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Cannot cancel a completed payment collection");
    }
    if (paymentCollection.status == utils_1.PaymentCollectionStatus.CANCELED) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Payment collection is already canceled");
    }
});
exports.cancelPaymentCollectionWorkflowId = "cancel-payment-collection";
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
exports.cancelPaymentCollectionWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.cancelPaymentCollectionWorkflowId, (input) => {
    const paymentCollectionQuery = (0, common_1.useQueryGraphStep)({
        entity: "payment_collection",
        fields: [
            "id",
            "status",
            "payments.id",
            "payments.captured_at",
            "captured_amount",
        ],
        filters: { id: input.payment_collection_id },
    }).config({ name: "get-payment-collection" });
    const paymentCollection = (0, workflows_sdk_1.transform)({ paymentCollectionQuery }, ({ paymentCollectionQuery }) => paymentCollectionQuery.data[0]);
    validatePaymentCollectionCancellationStep({
        paymentCollection,
    });
    /**
     * Only cancel authorized payments, not captured payments.
     */
    const authorizedPaymentIds = (0, workflows_sdk_1.transform)({ paymentCollection }, ({ paymentCollection }) => paymentCollection.payments
        ?.filter((p) => !p.captured_at)
        .map((p) => p.id) ?? []);
    const status = (0, workflows_sdk_1.transform)({ paymentCollection }, ({ paymentCollection }) => paymentCollection.captured_amount > 0
        ? utils_1.PaymentCollectionStatus.PARTIALLY_CAPTURED
        : utils_1.PaymentCollectionStatus.CANCELED);
    const updatedPaymentCollections = (0, update_payment_collection_1.updatePaymentCollectionStep)({
        selector: { id: paymentCollection.id },
        update: {
            status: status,
        },
    });
    (0, cancel_payment_1.cancelPaymentStep)({
        ids: authorizedPaymentIds,
    });
    const resultPaymentCollection = (0, workflows_sdk_1.transform)({ updatedPaymentCollections }, ({ updatedPaymentCollections }) => updatedPaymentCollections[0]);
    return new workflows_sdk_1.WorkflowResponse(resultPaymentCollection);
});
//# sourceMappingURL=cancel-payment-collection.js.map