"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beginDraftOrderEditWorkflow = exports.beginDraftOrderEditWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const order_1 = require("../../order");
const steps_1 = require("../steps");
exports.beginDraftOrderEditWorkflowId = "begin-draft-order-edit";
/**
 * This workflow begins a draft order edit. It's used by the
 * [Create Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersidedit).
 *
 * The draft order edit can later be requested using {@link requestDraftOrderEditWorkflow} or confirmed using {@link confirmDraftOrderEditWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * creating a draft order edit request.
 *
 * @example
 * const { result } = await beginDraftOrderEditWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Create a draft order edit request.
 */
exports.beginDraftOrderEditWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.beginDraftOrderEditWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "status", "is_draft_order"],
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    (0, steps_1.validateDraftOrderStep)({ order });
    const orderChangeInput = (0, workflows_sdk_1.transform)({ input }, ({ input }) => {
        return {
            change_type: "edit",
            order_id: input.order_id,
            created_by: input.created_by,
            description: input.description,
            internal_note: input.internal_note,
        };
    });
    (0, order_1.createOrderChangeStep)(orderChangeInput);
    return new workflows_sdk_1.WorkflowResponse((0, order_1.previewOrderChangeStep)(input.order_id));
});
//# sourceMappingURL=begin-draft-order-edit.js.map