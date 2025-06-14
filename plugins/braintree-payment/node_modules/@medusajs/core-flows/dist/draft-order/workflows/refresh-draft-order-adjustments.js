"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshDraftOrderAdjustmentsWorkflow = exports.refreshDraftOrderAdjustmentsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const cart_1 = require("../../cart");
const create_draft_order_line_item_adjustments_1 = require("../steps/create-draft-order-line-item-adjustments");
const create_draft_order_shipping_method_adjustments_1 = require("../steps/create-draft-order-shipping-method-adjustments");
const remove_draft_order_line_item_adjustments_1 = require("../steps/remove-draft-order-line-item-adjustments");
const remove_draft_order_shipping_method_adjustments_1 = require("../steps/remove-draft-order-shipping-method-adjustments");
const update_draft_order_promotions_1 = require("../steps/update-draft-order-promotions");
exports.refreshDraftOrderAdjustmentsWorkflowId = "refresh-draft-order-adjustments";
/**
 * This workflow refreshes the adjustments or promotions for a draft order. It's used by other workflows
 * like {@link addDraftOrderItemsWorkflow} to refresh the promotions whenever changes
 * are made to the draft order.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * refreshing the adjustments or promotions for a draft order.
 *
 * @example
 * const { result } = await refreshDraftOrderAdjustmentsWorkflow(container)
 * .run({
 *   input: {
 *     order: order,
 *     promo_codes: ["PROMO_CODE_1", "PROMO_CODE_2"],
 *     // imported from "@medusajs/framework/utils"
 *     action: PromotionActions.ADD,
 *   }
 * })
 *
 * @summary
 *
 * Refresh the promotions in a draft order.
 */
exports.refreshDraftOrderAdjustmentsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.refreshDraftOrderAdjustmentsWorkflowId, function (input) {
    const promotionCodesToApply = (0, cart_1.getPromotionCodesToApply)({
        cart: input.order,
        promo_codes: input.promo_codes,
        action: input.action,
    });
    const actions = (0, cart_1.getActionsToComputeFromPromotionsStep)({
        cart: input.order,
        promotionCodesToApply,
    });
    const { lineItemAdjustmentsToCreate, lineItemAdjustmentIdsToRemove, shippingMethodAdjustmentsToCreate, shippingMethodAdjustmentIdsToRemove, } = (0, cart_1.prepareAdjustmentsFromPromotionActionsStep)({ actions });
    (0, workflows_sdk_1.parallelize)((0, remove_draft_order_line_item_adjustments_1.removeDraftOrderLineItemAdjustmentsStep)({
        lineItemAdjustmentIdsToRemove: lineItemAdjustmentIdsToRemove,
    }), (0, remove_draft_order_shipping_method_adjustments_1.removeDraftOrderShippingMethodAdjustmentsStep)({
        shippingMethodAdjustmentIdsToRemove: shippingMethodAdjustmentIdsToRemove,
    }), (0, create_draft_order_line_item_adjustments_1.createDraftOrderLineItemAdjustmentsStep)({
        lineItemAdjustmentsToCreate: lineItemAdjustmentsToCreate,
        order_id: input.order.id,
    }), (0, create_draft_order_shipping_method_adjustments_1.createDraftOrderShippingMethodAdjustmentsStep)({
        shippingMethodAdjustmentsToCreate: shippingMethodAdjustmentsToCreate,
    }), (0, update_draft_order_promotions_1.updateDraftOrderPromotionsStep)({
        id: input.order.id,
        promo_codes: input.promo_codes,
        action: input.action,
    }));
    return new workflows_sdk_1.WorkflowResponse(void 0);
});
//# sourceMappingURL=refresh-draft-order-adjustments.js.map