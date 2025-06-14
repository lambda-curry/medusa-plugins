"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDraftOrderWorkflow = exports.convertDraftOrderStep = exports.convertDraftOrderWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const validate_draft_order_1 = require("../steps/validate-draft-order");
exports.convertDraftOrderWorkflowId = "convert-draft-order";
/**
 * This step converts a draft order to a pending order.
 */
exports.convertDraftOrderStep = (0, workflows_sdk_1.createStep)("convert-draft-order", async function ({ id }, { container }) {
    const service = container.resolve(utils_1.Modules.ORDER);
    const response = await service.updateOrders([
        {
            id,
            status: utils_1.OrderStatus.PENDING,
            is_draft_order: false,
        },
    ]);
    const order = response[0];
    return new workflows_sdk_1.StepResponse(order, {
        id,
    });
}, async function (prevData, { container }) {
    if (!prevData) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.updateOrders([
        {
            id: prevData.id,
            status: utils_1.OrderStatus.DRAFT,
            is_draft_order: true,
        },
    ]);
});
/**
 * This workflow converts a draft order to a pending order. It's used by the
 * [Convert Draft Order to Order Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersidconverttoorder).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * converting a draft order to a pending order.
 *
 * @example
 * const { result } = await convertDraftOrderWorkflow(container)
 * .run({
 *   input: {
 *     id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Convert a draft order to a pending order.
 */
exports.convertDraftOrderWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.convertDraftOrderWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "status", "is_draft_order"],
        variables: {
            id: input.id,
        },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    (0, validate_draft_order_1.validateDraftOrderStep)({ order });
    const updatedOrder = (0, exports.convertDraftOrderStep)({ id: input.id });
    (0, common_1.emitEventStep)({
        eventName: utils_1.OrderWorkflowEvents.PLACED,
        data: { id: updatedOrder.id },
    });
    return new workflows_sdk_1.WorkflowResponse(updatedOrder);
});
//# sourceMappingURL=convert-draft-order.js.map