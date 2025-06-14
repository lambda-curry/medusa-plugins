"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDraftOrderActionShippingMethodWorkflow = exports.removeDraftOrderActionShippingMethodWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const order_1 = require("../../order");
const get_draft_order_promotion_context_1 = require("../steps/get-draft-order-promotion-context");
const validate_draft_order_change_1 = require("../steps/validate-draft-order-change");
const validate_draft_order_shipping_method_action_1 = require("../steps/validate-draft-order-shipping-method-action");
const fields_1 = require("../utils/fields");
const refresh_draft_order_adjustments_1 = require("./refresh-draft-order-adjustments");
exports.removeDraftOrderActionShippingMethodWorkflowId = "remove-draft-order-action-shipping-method";
/**
 * This workflow removes a shipping method that was added to an edited draft order. It's used by the
 * [Remove Shipping Method from Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_deletedraftordersideditshippingmethodsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * removing a shipping method from an edited draft order.
 *
 * @example
 * const { result } = await removeDraftOrderActionShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "action_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove a shipping method from an edited draft order.
 */
exports.removeDraftOrderActionShippingMethodWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.removeDraftOrderActionShippingMethodWorkflowId, function (input) {
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
    (0, validate_draft_order_change_1.validateDraftOrderChangeStep)({ order, orderChange });
    (0, validate_draft_order_shipping_method_action_1.validateDraftOrderShippingMethodActionStep)({ orderChange, input });
    const dataToRemove = (0, workflows_sdk_1.transform)({ orderChange, input }, ({ orderChange, input }) => {
        const associatedAction = (orderChange.actions ?? []).find((a) => a.id === input.action_id);
        return {
            actionId: associatedAction.id,
            shippingMethodId: associatedAction.reference_id,
        };
    });
    (0, workflows_sdk_1.parallelize)((0, order_1.deleteOrderChangeActionsStep)({ ids: [dataToRemove.actionId] }), (0, order_1.deleteOrderShippingMethods)({ ids: [dataToRemove.shippingMethodId] }));
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
    (0, workflows_sdk_1.when)(appliedPromoCodes, (appliedPromoCodes) => appliedPromoCodes.length > 0).then(() => {
        refresh_draft_order_adjustments_1.refreshDraftOrderAdjustmentsWorkflow.runAsStep({
            input: {
                order,
                promo_codes: appliedPromoCodes,
                action: utils_1.PromotionActions.REPLACE,
            },
        });
    });
    return new workflows_sdk_1.WorkflowResponse((0, order_1.previewOrderChangeStep)(input.order_id));
});
//# sourceMappingURL=remove-draft-order-action-shipping-method.js.map