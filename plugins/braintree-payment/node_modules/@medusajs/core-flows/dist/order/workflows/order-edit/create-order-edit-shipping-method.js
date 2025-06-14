"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderEditShippingMethodWorkflow = exports.createOrderEditShippingMethodWorkflowId = exports.createOrderEditShippingMethodValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const create_order_shipping_methods_1 = require("../../steps/create-order-shipping-methods");
const order_validation_1 = require("../../utils/order-validation");
const prepare_shipping_method_1 = require("../../utils/prepare-shipping-method");
const create_order_change_actions_1 = require("../create-order-change-actions");
const update_tax_lines_1 = require("../update-tax-lines");
const schemas_1 = require("../../../cart/utils/schemas");
/**
 * This step validates that a shipping method can be created for an order edit.
 * If the order is canceled or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = createOrderEditShippingMethodValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   }
 * })
 */
exports.createOrderEditShippingMethodValidationStep = (0, workflows_sdk_1.createStep)("validate-create-order-edit-shipping-method", async function ({ order, orderChange, }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
});
exports.createOrderEditShippingMethodWorkflowId = "create-order-edit-shipping-method";
/**
 * This workflow creates a shipping method for an order edit. It's used by the
 * [Add Shipping Method API Route](https://docs.medusajs.com/api/admin#order-edits_postordereditsidshippingmethod).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to create a shipping method
 * for an order edit in your in your own custom flows.
 *
 * @example
 * const { result } = await createOrderEditShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     shipping_option_id: "so_123",
 *   }
 * })
 *
 * @summary
 *
 * Create a shipping method for an order edit.
 *
 * @property hooks.setPricingContext - This hook is executed before the shipping method is created. You can consume this hook to return any custom context useful for the prices retrieval of the shipping method's option.
 *
 * For example, assuming you have the following custom pricing rule:
 *
 * ```json
 * {
 *   "attribute": "location_id",
 *   "operator": "eq",
 *   "value": "sloc_123",
 * }
 * ```
 *
 * You can consume the `setPricingContext` hook to add the `location_id` context to the prices calculation:
 *
 * ```ts
 * import { createOrderEditShippingMethodWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 *
 * createOrderEditShippingMethodWorkflow.hooks.setPricingContext((
 *   { order, shipping_option_id, additional_data }, { container }
 * ) => {
 *   return new StepResponse({
 *     location_id: "sloc_123", // Special price for in-store purchases
 *   });
 * });
 * ```
 *
 * The price of the shipping method's option will now be retrieved using the context you return.
 *
 * :::note
 *
 * Learn more about prices calculation context in the [Prices Calculation](https://docs.medusajs.com/resources/commerce-modules/pricing/price-calculation) documentation.
 *
 * :::
 */
exports.createOrderEditShippingMethodWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createOrderEditShippingMethodWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "status", "currency_code", "canceled_at"],
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const setPricingContext = (0, workflows_sdk_1.createHook)("setPricingContext", {
        order,
        shipping_option_id: input.shipping_option_id,
        additional_data: input.additional_data,
    }, {
        resultValidator: schemas_1.pricingContextResult,
    });
    const setPricingContextResult = setPricingContext.getResult();
    const pricingContext = (0, workflows_sdk_1.transform)({ order, setPricingContextResult }, (data) => {
        return {
            ...(data.setPricingContextResult ? data.setPricingContextResult : {}),
            currency_code: data.order.currency_code,
        };
    });
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
                context: pricingContext,
            },
        },
    }).config({ name: "fetch-shipping-option" });
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
    const shippingMethodInput = (0, workflows_sdk_1.transform)({
        relatedEntity: { order_id: order.id },
        shippingOptions,
        customPrice: input.custom_amount,
        orderChange,
        input,
    }, (0, prepare_shipping_method_1.prepareShippingMethod)());
    const createdMethods = (0, create_order_shipping_methods_1.createOrderShippingMethods)({
        shipping_methods: [shippingMethodInput],
    });
    const shippingMethodIds = (0, workflows_sdk_1.transform)(createdMethods, (createdMethods) => {
        return createdMethods.map((item) => item.id);
    });
    update_tax_lines_1.updateOrderTaxLinesWorkflow.runAsStep({
        input: {
            order_id: order.id,
            shipping_method_ids: shippingMethodIds,
        },
    });
    const orderChangeActionInput = (0, workflows_sdk_1.transform)({
        order,
        shippingOptions,
        createdMethods,
        customPrice: input.custom_amount,
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
    create_order_change_actions_1.createOrderChangeActionsWorkflow.runAsStep({
        input: [orderChangeActionInput],
    });
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.previewOrderChangeStep)(order.id), {
        hooks: [setPricingContext],
    });
});
//# sourceMappingURL=create-order-edit-shipping-method.js.map