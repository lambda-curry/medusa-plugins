"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDraftOrderWorkflow = exports.updateDraftOrderStep = exports.updateDraftOrderWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const order_1 = require("../../order");
const validate_draft_order_1 = require("../steps/validate-draft-order");
exports.updateDraftOrderWorkflowId = "update-draft-order";
/**
 * This step updates a draft order's details.
 *
 * :::note
 *
 * You can retrieve a draft order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = updateDraftOrderStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   input: {
 *     // details to update...
 *   }
 * })
 */
exports.updateDraftOrderStep = (0, workflows_sdk_1.createStep)("update-draft-order", async ({ order, input }, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const updatedOrders = await service.updateOrders([
        {
            id: order.id,
            ...input,
        },
    ]);
    const updatedOrder = updatedOrders[0];
    return new workflows_sdk_1.StepResponse(updatedOrder, order);
}, async function (prevData, { container }) {
    if (!prevData) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.updateOrders([prevData]);
});
/**
 * This workflow updates a draft order's details. It's used by the
 * [Update Draft Order Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersid).
 *
 * This workflow doesn't update the draft order's items, shipping methods, or promotions. Instead, you have to
 * create a draft order edit using {@link beginDraftOrderEditWorkflow} and make updates in the draft order edit.
 * Then, you can confirm the draft order edit using {@link confirmDraftOrderEditWorkflow} or request a draft order edit
 * using {@link requestDraftOrderEditWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating a draft order.
 *
 * @example
 * const { result } = await updateDraftOrderWorkflow(container)
 * .run({
 *   input: {
 *     id: "order_123",
 *     user_id: "user_123",
 *     customer_id: "cus_123",
 *   }
 * })
 *
 * @summary
 *
 * Update a draft order's details.
 */
exports.updateDraftOrderWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateDraftOrderWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: [
            "id",
            "customer_id",
            "status",
            "is_draft_order",
            "sales_channel_id",
            "email",
            "customer_id",
            "shipping_address.*",
            "billing_address.*",
            "metadata",
        ],
        variables: {
            id: input.id,
        },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    (0, validate_draft_order_1.validateDraftOrderStep)({ order });
    const updateInput = (0, workflows_sdk_1.transform)({ input, order }, ({ input, order, }) => {
        const update = {};
        if (input.shipping_address) {
            const address = {
                ...order.shipping_address,
                ...input.shipping_address,
            };
            delete address.id;
            update.shipping_address = address;
        }
        if (input.billing_address) {
            const address = {
                ...order.billing_address,
                ...input.billing_address,
            };
            delete address.id;
            update.billing_address = address;
        }
        return { ...input, ...update };
    });
    const updatedOrder = (0, exports.updateDraftOrderStep)({
        order,
        input: updateInput,
    });
    const orderChangeInput = (0, workflows_sdk_1.transform)({ input, updatedOrder, order }, ({ input, updatedOrder, order }) => {
        const changes = [];
        if (input.shipping_address) {
            changes.push({
                change_type: "update_order",
                order_id: input.id,
                created_by: input.user_id,
                confirmed_by: input.user_id,
                details: {
                    type: "shipping_address",
                    old: order.shipping_address,
                    new: updatedOrder.shipping_address,
                },
            });
        }
        if (input.billing_address) {
            changes.push({
                change_type: "update_order",
                order_id: input.id,
                created_by: input.user_id,
                confirmed_by: input.user_id,
                details: {
                    type: "billing_address",
                    old: order.billing_address,
                    new: updatedOrder.billing_address,
                },
            });
        }
        if (input.customer_id) {
            changes.push({
                change_type: "update_order",
                order_id: input.id,
                created_by: input.user_id,
                confirmed_by: input.user_id,
                details: {
                    type: "customer_id",
                    old: order.customer_id,
                    new: updatedOrder.customer_id,
                },
            });
        }
        if (input.email) {
            changes.push({
                change_type: "update_order",
                order_id: input.id,
                created_by: input.user_id,
                confirmed_by: input.user_id,
                details: {
                    type: "email",
                    old: order.email,
                    new: updatedOrder.email,
                },
            });
        }
        if (input.sales_channel_id) {
            changes.push({
                change_type: "update_order",
                order_id: input.id,
                created_by: input.user_id,
                confirmed_by: input.user_id,
                details: {
                    type: "sales_channel_id",
                    old: order.sales_channel_id,
                    new: updatedOrder.sales_channel_id,
                },
            });
        }
        if (input.metadata) {
            changes.push({
                change_type: "update_order",
                order_id: input.id,
                created_by: input.user_id,
                confirmed_by: input.user_id,
                details: {
                    type: "metadata",
                    old: order.metadata,
                    new: updatedOrder.metadata,
                },
            });
        }
        return changes;
    });
    (0, order_1.registerOrderChangesStep)(orderChangeInput);
    (0, common_1.emitEventStep)({
        eventName: utils_1.OrderWorkflowEvents.UPDATED,
        data: { id: input.id },
    });
    const preview = (0, order_1.previewOrderChangeStep)(input.id);
    return new workflows_sdk_1.WorkflowResponse(preview);
});
//# sourceMappingURL=update-draft-order.js.map