"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrUpdateOrderPaymentCollectionWorkflow = exports.createOrUpdateOrderPaymentCollectionWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const payment_collection_1 = require("../../payment-collection");
const create_order_payment_collection_1 = require("./create-order-payment-collection");
const cancel_payment_collection_1 = require("../../payment-collection/workflows/cancel-payment-collection");
exports.createOrUpdateOrderPaymentCollectionWorkflowId = "create-or-update-order-payment-collection";
/**
 * This workflow creates or updates payment collection for an order. It's used by other order-related workflows,
 * such as {@link createOrderPaymentCollectionWorkflow} to update an order's payment collections based on changes made to the order.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * creating or updating payment collections for an order.
 *
 * @example
 * const { result } = await createOrUpdateOrderPaymentCollectionWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     amount: 20
 *   }
 * })
 *
 * @summary
 *
 * Create or update payment collection for an order.
 */
exports.createOrUpdateOrderPaymentCollectionWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createOrUpdateOrderPaymentCollectionWorkflowId, (input) => {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "order",
        fields: ["id", "summary", "currency_code", "region_id"],
        variables: { id: input.order_id },
        throw_if_key_not_found: true,
        list: false,
    });
    const orderPaymentCollections = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_payment_collection",
        fields: ["payment_collection_id"],
        variables: { order_id: order.id },
    }).config({ name: "order-payment-collection-query" });
    const orderPaymentCollectionIds = (0, workflows_sdk_1.transform)({ orderPaymentCollections }, ({ orderPaymentCollections }) => orderPaymentCollections.map((opc) => opc.payment_collection_id));
    const existingPaymentCollection = (0, common_1.useRemoteQueryStep)({
        entry_point: "payment_collection",
        fields: ["id", "status"],
        variables: {
            filters: {
                id: orderPaymentCollectionIds,
                status: [
                    // To update the collection amoun
                    utils_1.PaymentCollectionStatus.NOT_PAID,
                    utils_1.PaymentCollectionStatus.AWAITING,
                    // To cancel the authorized payments and create a new collection
                    utils_1.PaymentCollectionStatus.AUTHORIZED,
                    utils_1.PaymentCollectionStatus.PARTIALLY_AUTHORIZED,
                ],
            },
        },
        list: false,
    }).config({ name: "payment-collection-query" });
    const shouldRecreate = (0, workflows_sdk_1.transform)({ existingPaymentCollection }, ({ existingPaymentCollection }) => existingPaymentCollection?.status ===
        utils_1.PaymentCollectionStatus.AUTHORIZED ||
        existingPaymentCollection?.status ===
            utils_1.PaymentCollectionStatus.PARTIALLY_AUTHORIZED);
    const amountPending = (0, workflows_sdk_1.transform)({ order, input }, ({ order, input }) => {
        const amountToCharge = input.amount ?? 0;
        const amountPending = order.summary.raw_pending_difference ?? order.summary.pending_difference;
        if (amountToCharge > 0 && utils_1.MathBN.gt(amountToCharge, amountPending)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `Amount cannot be greater than ${amountPending}`);
        }
        return amountPending;
    });
    const updatedPaymentCollections = (0, workflows_sdk_1.when)({ existingPaymentCollection, amountPending, shouldRecreate }, ({ existingPaymentCollection, amountPending, shouldRecreate }) => {
        return (!!existingPaymentCollection?.id &&
            !shouldRecreate &&
            utils_1.MathBN.gt(amountPending, 0));
    }).then(() => {
        return (0, payment_collection_1.updatePaymentCollectionStep)({
            selector: { id: existingPaymentCollection.id },
            update: {
                amount: amountPending,
            },
        });
    });
    const createdPaymentCollection = (0, workflows_sdk_1.when)({ existingPaymentCollection, amountPending, shouldRecreate }, ({ existingPaymentCollection, amountPending, shouldRecreate }) => {
        return ((!existingPaymentCollection?.id || shouldRecreate) &&
            utils_1.MathBN.gt(amountPending, 0));
    }).then(() => {
        return create_order_payment_collection_1.createOrderPaymentCollectionWorkflow.runAsStep({
            input: {
                order_id: order.id,
                amount: amountPending,
            },
        });
    });
    (0, workflows_sdk_1.when)({ existingPaymentCollection, amountPending, shouldRecreate }, ({ existingPaymentCollection, amountPending, shouldRecreate }) => {
        return (!!existingPaymentCollection?.id &&
            shouldRecreate &&
            utils_1.MathBN.gt(amountPending, 0));
    }).then(() => {
        cancel_payment_collection_1.cancelPaymentCollectionWorkflow.runAsStep({
            input: {
                payment_collection_id: existingPaymentCollection.id,
            },
        });
    });
    const paymentCollections = (0, workflows_sdk_1.transform)({ updatedPaymentCollections, createdPaymentCollection }, ({ updatedPaymentCollections, createdPaymentCollection }) => updatedPaymentCollections || createdPaymentCollection);
    return new workflows_sdk_1.WorkflowResponse(paymentCollections);
});
//# sourceMappingURL=create-or-update-order-payment-collection.js.map