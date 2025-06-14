"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDraftOrderActionItemWorkflow = exports.removeDraftOrderActionItemWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const order_1 = require("../../order");
const validate_draft_order_change_1 = require("../steps/validate-draft-order-change");
const validate_draft_order_remove_action_item_1 = require("../steps/validate-draft-order-remove-action-item");
const fields_1 = require("../utils/fields");
const refresh_draft_order_adjustments_1 = require("./refresh-draft-order-adjustments");
exports.removeDraftOrderActionItemWorkflowId = "remove-draft-order-action-item";
/**
 * This workflow removes an item that was added or updated in a draft order edit. It's used by the
 * [Remove Item from Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_deletedraftordersidedititemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * removing an item from a draft order edit.
 *
 * @example
 * const { result } = await removeDraftOrderActionItemWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "action_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove an item from a draft order edit.
 */
exports.removeDraftOrderActionItemWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.removeDraftOrderActionItemWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "status", "is_draft_order", "canceled_at", "items.*"],
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
    (0, validate_draft_order_change_1.validateDraftOrderChangeStep)({ order, orderChange });
    (0, validate_draft_order_remove_action_item_1.validateDraftOrderRemoveActionItemStep)({
        input,
        orderChange,
    });
    (0, order_1.deleteOrderChangeActionsStep)({ ids: [input.action_id] });
    const refetchedOrder = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: fields_1.draftOrderFieldsForRefreshSteps,
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "refetched-order-query" });
    const appliedPromoCodes = (0, workflows_sdk_1.transform)(refetchedOrder, (refetchedOrder) => {
        const promotionLink = refetchedOrder.promotion_link;
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
                order: refetchedOrder,
                promo_codes: appliedPromoCodes,
                action: utils_1.PromotionActions.REPLACE,
            },
        });
    });
    return new workflows_sdk_1.WorkflowResponse((0, order_1.previewOrderChangeStep)(input.order_id));
});
//# sourceMappingURL=remove-draft-order-action-item.js.map