"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDraftOrderActionShippingMethodWorkflow = exports.updateDraftOrderActionShippingMethodWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const order_1 = require("../../order");
const prepare_shipping_method_1 = require("../../order/utils/prepare-shipping-method");
const get_draft_order_promotion_context_1 = require("../steps/get-draft-order-promotion-context");
const validate_draft_order_change_1 = require("../steps/validate-draft-order-change");
const validate_draft_order_shipping_method_action_1 = require("../steps/validate-draft-order-shipping-method-action");
const fields_1 = require("../utils/fields");
const refresh_draft_order_adjustments_1 = require("./refresh-draft-order-adjustments");
exports.updateDraftOrderActionShippingMethodWorkflowId = "update-draft-order-action-shipping-method";
/**
 * This workflow updates a new shipping method that was added to a draft order edit. It's used by the
 * [Update New Shipping Method in Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersideditshippingmethodsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating a new shipping method in a draft order edit.
 *
 * @example
 * const { result } = await updateDraftOrderActionShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "action_123",
 *     data: {
 *       custom_amount: 10,
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update a new shipping method in a draft order edit.
 */
exports.updateDraftOrderActionShippingMethodWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateDraftOrderActionShippingMethodWorkflowId, function (input) {
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
    const shippingOptions = (0, workflows_sdk_1.when)({ input }, ({ input }) => {
        return input.data?.custom_amount === null;
    }).then(() => {
        const action = (0, workflows_sdk_1.transform)({ orderChange, input, order }, ({ orderChange, input, order }) => {
            const originalAction = (orderChange.actions ?? []).find((a) => a.id === input.action_id);
            return {
                shipping_method_id: originalAction.reference_id,
                currency_code: order.currency_code,
            };
        });
        const shippingMethod = (0, common_1.useRemoteQueryStep)({
            entry_point: "order_shipping_method",
            fields: ["id", "shipping_option_id"],
            variables: {
                id: action.shipping_method_id,
            },
            list: false,
        }).config({ name: "fetch-shipping-method" });
        return (0, common_1.useRemoteQueryStep)({
            entry_point: "shipping_option",
            fields: [
                "id",
                "name",
                "calculated_price.calculated_amount",
                "calculated_price.is_calculated_price_tax_inclusive",
            ],
            variables: {
                id: shippingMethod.shipping_option_id,
                calculated_price: {
                    context: { currency_code: action.currency_code },
                },
            },
        }).config({ name: "fetch-shipping-option" });
    });
    (0, validate_draft_order_shipping_method_action_1.validateDraftOrderShippingMethodActionStep)({
        orderChange,
        input,
    });
    const updateData = (0, workflows_sdk_1.transform)({ orderChange, input, shippingOptions }, prepare_shipping_method_1.prepareShippingMethodUpdate);
    (0, workflows_sdk_1.parallelize)((0, order_1.updateOrderChangeActionsStep)([updateData.action]), (0, order_1.updateOrderShippingMethodsStep)([updateData.shippingMethod]));
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
//# sourceMappingURL=update-draft-order-action-shipping-method.js.map