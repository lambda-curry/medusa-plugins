"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDraftOrderShippingMethodWorkflow = exports.updateDraftOrderShippingMethodWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const order_1 = require("../../order");
const update_draft_order_shipping_metod_1 = require("../steps/update-draft-order-shipping-metod");
const validate_draft_order_change_1 = require("../steps/validate-draft-order-change");
const fields_1 = require("../utils/fields");
const refresh_draft_order_adjustments_1 = require("./refresh-draft-order-adjustments");
exports.updateDraftOrderShippingMethodWorkflowId = "update-draft-order-shipping-method";
/**
 * This workflow updates an existing shipping method in a draft order edit. It's used by the
 * [Update Shipping Method in Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersideditshippingmethodsmethodmethod_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating an existing shipping method in a draft order edit.
 *
 * @example
 * const { result } = await updateDraftOrderShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     data: {
 *       shipping_method_id: "sm_123",
 *       custom_amount: 10,
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update an existing shipping method in a draft order edit.
 */
exports.updateDraftOrderShippingMethodWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateDraftOrderShippingMethodWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "status", "is_draft_order"],
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
    const { before, after } = (0, update_draft_order_shipping_metod_1.updateDraftOrderShippingMethodStep)({
        order_id: input.order_id,
        shipping_method_id: input.data.shipping_method_id,
        shipping_option_id: input.data.shipping_option_id,
        amount: input.data.custom_amount,
    });
    order_1.updateOrderTaxLinesWorkflow.runAsStep({
        input: {
            order_id: order.id,
            shipping_method_ids: [input.data.shipping_method_id],
        },
    });
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
    (0, workflows_sdk_1.when)(appliedPromoCodes, (appliedPromoCodes) => appliedPromoCodes.length > 0).then(() => {
        refresh_draft_order_adjustments_1.refreshDraftOrderAdjustmentsWorkflow.runAsStep({
            input: {
                order: refetchedOrder,
                promo_codes: appliedPromoCodes,
                action: utils_1.PromotionActions.REPLACE,
            },
        });
    });
    const orderChangeActionInput = (0, workflows_sdk_1.transform)({ order, orderChange, data: input.data, before, after }, ({ order, orderChange, data, before, after }) => {
        return {
            order_change_id: orderChange.id,
            reference: "order_shipping_method",
            reference_id: data.shipping_method_id,
            order_id: order.id,
            version: orderChange.version,
            action: utils_1.ChangeActionType.SHIPPING_UPDATE,
            internal_note: data.internal_note,
            details: {
                old_shipping_option_id: before.shipping_option_id,
                new_shipping_option_id: after.shipping_option_id,
                old_amount: before.amount,
                new_amount: after.amount,
            },
        };
    });
    order_1.createOrderChangeActionsWorkflow.runAsStep({
        input: [orderChangeActionInput],
    });
    return new workflows_sdk_1.WorkflowResponse((0, order_1.previewOrderChangeStep)(input.order_id));
});
//# sourceMappingURL=update-draft-order-shipping-method.js.map