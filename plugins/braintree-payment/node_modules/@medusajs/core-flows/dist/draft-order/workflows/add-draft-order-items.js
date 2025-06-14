"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDraftOrderItemsWorkflow = exports.addDraftOrderItemsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const order_1 = require("../../order");
const validate_draft_order_change_1 = require("../steps/validate-draft-order-change");
const fields_1 = require("../utils/fields");
const refresh_draft_order_adjustments_1 = require("./refresh-draft-order-adjustments");
exports.addDraftOrderItemsWorkflowId = "add-draft-order-items";
/**
 * This workflow adds items to a draft order. It's used by the
 * [Add Item to Draft Order Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersidedititems).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around adding items to
 * a draft order.
 *
 * @example
 * const { result } = await addDraftOrderItemsWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     items: [{
 *       variant_id: "variant_123",
 *       quantity: 1
 *     }]
 *   }
 * })
 *
 * @summary
 *
 * Add items to a draft order.
 */
exports.addDraftOrderItemsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.addDraftOrderItemsWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: fields_1.draftOrderFieldsForRefreshSteps,
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: ["id", "status"],
        variables: {
            filters: {
                order_id: input.order_id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, validate_draft_order_change_1.validateDraftOrderChangeStep)({ order, orderChange });
    const lineItems = order_1.addOrderLineItemsWorkflow.runAsStep({
        input: {
            order_id: order.id,
            items: input.items,
        },
    });
    const lineItemIds = (0, workflows_sdk_1.transform)(lineItems, (lineItems) => {
        return lineItems.map((item) => item.id);
    });
    order_1.updateOrderTaxLinesWorkflow.runAsStep({
        input: {
            order_id: order.id,
            item_ids: lineItemIds,
        },
    });
    const appliedPromoCodes = (0, workflows_sdk_1.transform)(order, (order) => {
        const promotionLink = order.promotion_link;
        if (!promotionLink) {
            return [];
        }
        if (Array.isArray(promotionLink)) {
            return promotionLink.map((promo) => promo.promotion.code);
        }
        return [promotionLink.promotion.code];
    });
    // If any the order has any promo codes, then we need to refresh the adjustments.
    (0, workflows_sdk_1.when)(appliedPromoCodes, (appliedPromoCodes) => appliedPromoCodes.length > 0).then(() => {
        refresh_draft_order_adjustments_1.refreshDraftOrderAdjustmentsWorkflow.runAsStep({
            input: {
                order,
                promo_codes: appliedPromoCodes,
                action: utils_1.PromotionActions.REPLACE,
            },
        });
    });
    const orderChangeActionInput = (0, workflows_sdk_1.transform)({ order, orderChange, items: input.items, lineItems }, ({ order, orderChange, items, lineItems }) => {
        return items.map((item, index) => ({
            order_change_id: orderChange.id,
            order_id: order.id,
            version: orderChange.version,
            action: utils_1.ChangeActionType.ITEM_ADD,
            internal_note: item.internal_note,
            details: {
                reference_id: lineItems[index].id,
                quantity: item.quantity,
                unit_price: item.unit_price ?? lineItems[index].unit_price,
                compare_at_unit_price: item.compare_at_unit_price ??
                    lineItems[index].compare_at_unit_price,
                metadata: item.metadata,
            },
        }));
    });
    order_1.createOrderChangeActionsWorkflow.runAsStep({
        input: orderChangeActionInput,
    });
    return new workflows_sdk_1.WorkflowResponse((0, order_1.previewOrderChangeStep)(input.order_id));
});
//# sourceMappingURL=add-draft-order-items.js.map