"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDraftOrderItemWorkflow = exports.updateDraftOrderItemWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const order_1 = require("../../order");
const get_draft_order_promotion_context_1 = require("../steps/get-draft-order-promotion-context");
const validate_draft_order_change_1 = require("../steps/validate-draft-order-change");
const fields_1 = require("../utils/fields");
const refresh_draft_order_adjustments_1 = require("./refresh-draft-order-adjustments");
exports.updateDraftOrderItemWorkflowId = "update-draft-order-item";
/**
 * This workflow updates an item in a draft order edit. It's used by the
 * [Update Item in Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersidedititemsitemitem_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating an item in a draft order edit.
 *
 * @example
 * const { result } = await updateDraftOrderItemWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     items: [{ id: "orli_123", quantity: 2 }],
 *   }
 * })
 *
 * @summary
 *
 * Update an item in a draft order edit.
 */
exports.updateDraftOrderItemWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateDraftOrderItemWorkflowId, function (input) {
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
    const orderChangeActionInput = (0, workflows_sdk_1.transform)({ order, orderChange, items: input.items }, ({ order, orderChange, items }) => {
        return items.map((item) => {
            const existing = order?.items?.find((exItem) => exItem.id === item.id);
            const quantityDiff = new utils_1.BigNumber(utils_1.MathBN.sub(item.quantity, existing.quantity));
            return {
                order_change_id: orderChange.id,
                order_id: order.id,
                version: orderChange.version,
                action: utils_1.ChangeActionType.ITEM_UPDATE,
                internal_note: item.internal_note,
                details: {
                    reference_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    compare_at_unit_price: item.compare_at_unit_price,
                    quantity_diff: quantityDiff,
                },
            };
        });
    });
    order_1.createOrderChangeActionsWorkflow.runAsStep({
        input: orderChangeActionInput,
    });
    const context = (0, get_draft_order_promotion_context_1.getDraftOrderPromotionContextStep)({
        order,
    });
    const appliedPromoCodes = (0, workflows_sdk_1.transform)(context, (context) => {
        const promotionLink = context.promotion_link;
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
                order: context,
                promo_codes: appliedPromoCodes,
                action: utils_1.PromotionActions.REPLACE,
            },
        });
    });
    return new workflows_sdk_1.WorkflowResponse((0, order_1.previewOrderChangeStep)(input.order_id));
});
//# sourceMappingURL=update-draft-order-item.js.map