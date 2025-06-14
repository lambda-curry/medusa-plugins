"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDraftOrderShippingMethodWorkflow = exports.removeDraftOrderShippingMethodWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const order_1 = require("../../order");
const validate_draft_order_change_1 = require("../steps/validate-draft-order-change");
const fields_1 = require("../utils/fields");
const refresh_draft_order_adjustments_1 = require("./refresh-draft-order-adjustments");
exports.removeDraftOrderShippingMethodWorkflowId = "remove-draft-order-shipping-method";
/**
 * This workflow removes an existing shipping method from a draft order edit. It's used by the
 * [Remove Shipping Method from Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_deletedraftordersideditshippingmethodsmethodmethod_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * removing a shipping method from a draft order edit.
 *
 * @example
 * const { result } = await removeDraftOrderShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     shipping_method_id: "sm_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove an existing shipping method from a draft order edit.
 */
exports.removeDraftOrderShippingMethodWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.removeDraftOrderShippingMethodWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: fields_1.draftOrderFieldsForRefreshSteps,
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: ["id", "status", "version"],
        variables: {
            filters: {
                order_id: input.order_id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, validate_draft_order_change_1.validateDraftOrderChangeStep)({ order, orderChange });
    order_1.updateOrderTaxLinesWorkflow.runAsStep({
        input: {
            order_id: order.id,
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
        const refetchedOrder = (0, common_1.useRemoteQueryStep)({
            entry_point: "orders",
            fields: fields_1.draftOrderFieldsForRefreshSteps,
            variables: { id: input.order_id },
            list: false,
            throw_if_key_not_found: true,
        }).config({ name: "refetched-order-query" });
        refresh_draft_order_adjustments_1.refreshDraftOrderAdjustmentsWorkflow.runAsStep({
            input: {
                order: refetchedOrder,
                promo_codes: appliedPromoCodes,
                action: utils_1.PromotionActions.REPLACE,
            },
        });
    });
    const orderChangeActionInput = (0, workflows_sdk_1.transform)({
        input,
        order,
        orderChange,
    }, ({ order, orderChange, input }) => {
        return [
            {
                action: utils_1.ChangeActionType.SHIPPING_REMOVE,
                reference: "order_shipping_method",
                order_change_id: orderChange.id,
                reference_id: input.shipping_method_id,
                order_id: order.id,
            },
        ];
    });
    order_1.createOrderChangeActionsWorkflow.runAsStep({
        input: orderChangeActionInput,
    });
    return new workflows_sdk_1.WorkflowResponse((0, order_1.previewOrderChangeStep)(order.id));
});
//# sourceMappingURL=remove-draft-order-shipping-method.js.map