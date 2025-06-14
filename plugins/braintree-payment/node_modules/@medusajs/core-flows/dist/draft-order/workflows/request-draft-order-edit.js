"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestDraftOrderEditWorkflow = exports.requestDraftOrderEditId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const order_1 = require("../../order");
const validate_draft_order_change_1 = require("../steps/validate-draft-order-change");
exports.requestDraftOrderEditId = "request-draft-order-edit";
function getOrderChangesData({ input, orderChange, }) {
    return (0, workflows_sdk_1.transform)({ input, orderChange }, ({ input, orderChange }) => {
        return [
            {
                id: orderChange.id,
                status: utils_1.OrderChangeStatus.REQUESTED,
                requested_at: new Date(),
                requested_by: input.requested_by,
            },
        ];
    });
}
/**
 * This workflow requests a draft order edit. It's used by the
 * [Request Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersideditrequest).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * requesting a draft order edit.
 *
 * @example
 * const { result } = await requestDraftOrderEditWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     requested_by: "user_123",
 *   }
 * })
 *
 * @summary
 *
 * Request a draft order edit.
 */
exports.requestDraftOrderEditWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.requestDraftOrderEditId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "version", "status", "is_draft_order", "canceled_at"],
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: ["id", "canceled_at"],
        variables: {
            filters: {
                order_id: input.order_id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, validate_draft_order_change_1.validateDraftOrderChangeStep)({
        order,
        orderChange,
    });
    const updateOrderChangesData = getOrderChangesData({ input, orderChange });
    (0, order_1.updateOrderChangesStep)(updateOrderChangesData);
    order_1.createOrUpdateOrderPaymentCollectionWorkflow.runAsStep({
        input: {
            order_id: order.id,
        },
    });
    return new workflows_sdk_1.WorkflowResponse((0, order_1.previewOrderChangeStep)(order.id));
});
//# sourceMappingURL=request-draft-order-edit.js.map