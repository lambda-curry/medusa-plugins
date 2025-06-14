"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeRefreshShippingMethodsWorkflow = exports.maybeRefreshShippingMethodsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
const steps_1 = require("../../fulfillment/steps");
const steps_2 = require("../steps");
const common_1 = require("../../common");
const COMMON_OPTIONS_FIELDS = [
    "id",
    "name",
    "price_type",
    "service_zone_id",
    "service_zone.fulfillment_set_id",
    "service_zone.fulfillment_set.type",
    "service_zone.fulfillment_set.location.*",
    "service_zone.fulfillment_set.location.address.*",
    "shipping_profile_id",
    "provider_id",
    "data",
    "type.id",
    "type.label",
    "type.description",
    "type.code",
    "provider.id",
    "provider.is_enabled",
    "rules.attribute",
    "rules.value",
    "rules.operator",
];
exports.maybeRefreshShippingMethodsWorkflowId = "maybe-refresh-shipping-methods";
/**
 * This workflows refreshes shipping method prices of an order and its changes. It's used in Return Merchandise Authorization (RMA) flows. It's used
 * by other workflows, such as {@link refreshExchangeShippingWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * refreshing shipping methods in your custom flows.
 *
 * @example
 * const { result } = await maybeRefreshShippingMethodsWorkflow(container)
 * .run({
 *   input: {
 *     shipping_method_id: "shipping_method_123",
 *     order_id: "order_123",
 *     action_id: "orchact_123",
 *     context: {
 *       return_id: "ret_123",
 *       return_items: [
 *         {
 *            id: "orli_123",
 *            quantity: 1,
 *         }
 *       ]
 *     }
 *  }
 * })
 *
 * @summary
 *
 * Refreshes the shipping method prices of an order and its changes.
 */
exports.maybeRefreshShippingMethodsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.maybeRefreshShippingMethodsWorkflowId, function (input) {
    const shippingMethodQuery = (0, common_1.useQueryGraphStep)({
        entity: "order_shipping_method",
        fields: ["id", "shipping_option_id"],
        filters: {
            id: input.shipping_method_id,
        },
    }).config({ name: "fetch-shipping-method" });
    const shippingMethod = (0, workflows_sdk_1.transform)(shippingMethodQuery, ({ data }) => data[0]);
    const shippingOptionQuery = (0, common_1.useQueryGraphStep)({
        entity: "shipping_option",
        fields: [...COMMON_OPTIONS_FIELDS],
        filters: { id: shippingMethod.shipping_option_id },
    }).config({ name: "calculated-option" });
    const shippingOption = (0, workflows_sdk_1.transform)(shippingOptionQuery, ({ data }) => data[0]);
    const isCalculatedPriceShippingOption = (0, workflows_sdk_1.transform)(shippingOption, (option) => option?.price_type === utils_1.ShippingOptionPriceType.CALCULATED);
    (0, workflows_sdk_1.when)({ isCalculatedPriceShippingOption, shippingOption }, ({ isCalculatedPriceShippingOption, shippingOption }) => isCalculatedPriceShippingOption).then(() => {
        const orderQuery = (0, common_1.useQueryGraphStep)({
            entity: "order",
            fields: ["id", "shipping_address", "items.*", "items.variant.*"],
            filters: { id: input.order_id },
            options: { throwIfKeyNotFound: true },
        }).config({ name: "order-query" });
        const order = (0, workflows_sdk_1.transform)(orderQuery, (data) => data[0]);
        const calculateShippingOptionsPricesData = (0, workflows_sdk_1.transform)({
            shippingOption,
            order,
            input,
        }, ({ shippingOption, order, input }) => {
            return [
                {
                    id: shippingOption.id,
                    optionData: shippingOption.data,
                    context: {
                        ...order,
                        ...input.context,
                        from_location: shippingOption.service_zone.fulfillment_set.location,
                    },
                    // data: {}, // TODO: add data
                    provider_id: shippingOption.provider_id,
                },
            ];
        });
        const prices = (0, steps_1.calculateShippingOptionsPricesStep)(calculateShippingOptionsPricesData);
        const updateData = (0, workflows_sdk_1.transform)({
            shippingOption,
            prices,
            input,
        }, ({ prices, input }) => {
            return [
                {
                    id: input.action_id,
                    amount: prices[0].calculated_amount,
                },
                {
                    id: input.shipping_method_id,
                    amount: prices[0].calculated_amount,
                    is_custom_amount: false,
                },
            ];
        });
        (0, workflows_sdk_1.parallelize)((0, steps_2.updateOrderChangeActionsStep)([updateData[0]]), (0, steps_2.updateOrderShippingMethodsStep)([updateData[1]]));
    });
    return new workflows_sdk_1.WorkflowResponse(void 0);
});
//# sourceMappingURL=maybe-refresh-shipping-methods.js.map