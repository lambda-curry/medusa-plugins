"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDraftOrderActionItemWorkflow = exports.updateDraftOrderActionItemId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const order_1 = require("../../order");
const get_draft_order_promotion_context_1 = require("../steps/get-draft-order-promotion-context");
const validate_draft_order_change_1 = require("../steps/validate-draft-order-change");
const validate_draft_order_update_action_item_1 = require("../steps/validate-draft-order-update-action-item");
const fields_1 = require("../utils/fields");
const refresh_draft_order_adjustments_1 = require("./refresh-draft-order-adjustments");
exports.updateDraftOrderActionItemId = "update-draft-order-action-item";
/**
 * This workflow updates a new item that was added to a draft order edit. It's used by the
 * [Update New Item in Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersidedititemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating a new item in a draft order edit.
 *
 * @example
 * const { result } = await updateDraftOrderActionItemWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "action_123",
 *     data: {
 *       quantity: 2,
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update a new item in a draft order edit.
 */
exports.updateDraftOrderActionItemWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateDraftOrderActionItemId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: fields_1.draftOrderFieldsForRefreshSteps,
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: ["id", "status", "version", "actions.*"],
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
    (0, validate_draft_order_update_action_item_1.validateDraftOrderUpdateActionItemStep)({
        input,
        orderChange,
    });
    const updateData = (0, workflows_sdk_1.transform)({ orderChange, input }, ({ input, orderChange }) => {
        const originalAction = (orderChange.actions ?? []).find((a) => a.id === input.action_id);
        const data = input.data;
        return {
            id: input.action_id,
            details: {
                quantity: data.quantity ?? originalAction.details?.quantity,
                unit_price: data.unit_price ?? originalAction.details?.unit_price,
                compare_at_unit_price: data.compare_at_unit_price ??
                    originalAction.details?.compare_at_unit_price,
            },
            internal_note: data.internal_note,
        };
    });
    (0, order_1.updateOrderChangeActionsStep)([updateData]);
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
//# sourceMappingURL=update-draft-order-action-item.js.map