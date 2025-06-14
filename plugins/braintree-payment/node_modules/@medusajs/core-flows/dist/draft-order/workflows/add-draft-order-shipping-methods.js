"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDraftOrderShippingMethodsWorkflow = exports.addDraftOrderShippingMethodsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const order_1 = require("../../order");
const create_order_shipping_methods_1 = require("../../order/steps/create-order-shipping-methods");
const prepare_shipping_method_1 = require("../../order/utils/prepare-shipping-method");
const validate_draft_order_change_1 = require("../steps/validate-draft-order-change");
const fields_1 = require("../utils/fields");
const refresh_draft_order_adjustments_1 = require("./refresh-draft-order-adjustments");
exports.addDraftOrderShippingMethodsWorkflowId = "add-draft-order-shipping-methods";
/**
 * This workflow adds shipping methods to a draft order. It's used by the
 * [Add Shipping Method to Draft Order Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersideditshippingmethods).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around adding shipping methods to
 * a draft order.
 *
 * @example
 * const { result } = await addDraftOrderShippingMethodsWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     shipping_option_id: "so_123",
 *     custom_amount: 10
 *   }
 * })
 *
 * @summary
 *
 * Add shipping methods to a draft order.
 */
exports.addDraftOrderShippingMethodsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.addDraftOrderShippingMethodsWorkflowId, function (input) {
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
    const shippingOptions = (0, common_1.useRemoteQueryStep)({
        entry_point: "shipping_option",
        fields: [
            "id",
            "name",
            "calculated_price.calculated_amount",
            "calculated_price.is_calculated_price_tax_inclusive",
        ],
        variables: {
            id: input.shipping_option_id,
            calculated_price: {
                context: { currency_code: order.currency_code },
            },
        },
    }).config({ name: "fetch-shipping-option" });
    const shippingMethodInput = (0, workflows_sdk_1.transform)({
        relatedEntity: { order_id: order.id },
        shippingOptions,
        customPrice: input.custom_amount, // Need to cast this to any otherwise the type becomes to complex.
        orderChange,
        input,
    }, (0, prepare_shipping_method_1.prepareShippingMethod)());
    const createdMethods = (0, create_order_shipping_methods_1.createOrderShippingMethods)({
        shipping_methods: [shippingMethodInput],
    });
    const shippingMethodIds = (0, workflows_sdk_1.transform)(createdMethods, (createdMethods) => {
        return createdMethods.map((item) => item.id);
    });
    order_1.updateOrderTaxLinesWorkflow.runAsStep({
        input: {
            order_id: order.id,
            shipping_method_ids: shippingMethodIds,
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
        order,
        shippingOptions,
        createdMethods,
        customPrice: input.custom_amount, // Need to cast this to any otherwise the type becomes too complex.
        orderChange,
    }, ({ shippingOptions, order, createdMethods, customPrice, orderChange, }) => {
        const shippingOption = shippingOptions[0];
        const createdMethod = createdMethods[0];
        const methodPrice = customPrice ?? shippingOption.calculated_price.calculated_amount;
        return {
            action: utils_1.ChangeActionType.SHIPPING_ADD,
            reference: "order_shipping_method",
            order_change_id: orderChange.id,
            reference_id: createdMethod.id,
            amount: methodPrice,
            order_id: order.id,
        };
    });
    order_1.createOrderChangeActionsWorkflow.runAsStep({
        input: [orderChangeActionInput],
    });
    return new workflows_sdk_1.WorkflowResponse((0, order_1.previewOrderChangeStep)(order.id));
});
//# sourceMappingURL=add-draft-order-shipping-methods.js.map