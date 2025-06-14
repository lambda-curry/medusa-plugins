"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchShippingOptionForOrderWorkflow = exports.fetchShippingOptionsForOrderWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
const steps_1 = require("../../fulfillment/steps");
const common_1 = require("../../common");
const schemas_1 = require("../../cart/utils/schemas");
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
exports.fetchShippingOptionsForOrderWorkflowId = "fetch-shipping-option";
/**
 * This workflow fetches a shipping option for an order. It's used in Return Merchandise Authorization (RMA) flows. It's used
 * by other workflows, such as {@link createClaimShippingMethodWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around fetching
 * shipping options for an order.
 *
 * @example
 * const { result } = await fetchShippingOptionForOrderWorkflow(container)
 * .run({
 *   input: {
 *     shipping_option_id: "so_123",
 *     currency_code: "usd",
 *     order_id: "order_123",
 *     context: {
 *       return_id: "ret_123",
 *       return_items: [
 *         {
 *           id: "orli_123",
 *           quantity: 1,
 *         }
 *       ]
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Fetch a shipping option for an order.
 *
 * @property hooks.setPricingContext - This hook is executed before the shipping option is fetched. You can consume this hook to set the pricing context for the shipping option. This is useful when you have custom pricing rules that depend on the context of the order.
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
 * import { fetchShippingOptionForOrderWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 *
 * fetchShippingOptionForOrderWorkflow.hooks.setPricingContext((
 *   { shipping_option_id, currency_code, order_id, context, additional_data }, { container }
 * ) => {
 *   return new StepResponse({
 *     location_id: "sloc_123", // Special price for in-store purchases
 *   });
 * });
 * ```
 *
 * The shipping option's price will now be retrieved using the context you return.
 *
 * :::note
 *
 * Learn more about prices calculation context in the [Prices Calculation](https://docs.medusajs.com/resources/commerce-modules/pricing/price-calculation) documentation.
 *
 * :::
 *
 * @privateRemarks
 * There can be 3 cases:
 * 1. The shipping option is a flat rate shipping option.
 *    In this case, pricing calculation context is not used.
 * 2. The shipping option is a calculated shipping option.
 *    In this case, calculate shipping price method from the provider is called.
 * 3. The shipping option is a custom shipping option. -- TODO
 *    In this case, we don't need to do caluclations above and just return the shipping option with the custom amount.
 */
exports.fetchShippingOptionForOrderWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.fetchShippingOptionsForOrderWorkflowId, function (input) {
    const initialOption = (0, common_1.useRemoteQueryStep)({
        entry_point: "shipping_option",
        variables: { id: input.shipping_option_id },
        fields: ["id", "price_type"],
        list: false,
    }).config({ name: "shipping-option-query" });
    const isCalculatedPriceShippingOption = (0, workflows_sdk_1.transform)(initialOption, (option) => option.price_type === utils_1.ShippingOptionPriceType.CALCULATED);
    const calculatedPriceShippingOption = (0, workflows_sdk_1.when)("option-calculated", { isCalculatedPriceShippingOption }, ({ isCalculatedPriceShippingOption }) => isCalculatedPriceShippingOption).then(() => {
        const order = (0, common_1.useRemoteQueryStep)({
            entry_point: "orders",
            fields: ["id", "shipping_address", "items.*", "items.variant.*"],
            variables: { id: input.order_id },
            list: false,
            throw_if_key_not_found: true,
        }).config({ name: "order-query" });
        const shippingOption = (0, common_1.useRemoteQueryStep)({
            entry_point: "shipping_option",
            fields: [...COMMON_OPTIONS_FIELDS],
            variables: { id: input.shipping_option_id },
            list: false,
        }).config({ name: "calculated-option" });
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
        const shippingOptionsWithPrice = (0, workflows_sdk_1.transform)({
            shippingOption,
            prices,
        }, ({ shippingOption, prices }) => {
            return {
                id: shippingOption.id,
                name: shippingOption.name,
                calculated_price: prices[0],
            };
        });
        return shippingOptionsWithPrice;
    });
    const setPricingContext = (0, workflows_sdk_1.createHook)("setPricingContext", input, {
        resultValidator: schemas_1.pricingContextResult,
    });
    const setPricingContextResult = setPricingContext.getResult();
    const pricingContext = (0, workflows_sdk_1.transform)({ input, setPricingContextResult }, (data) => {
        return {
            ...(data.setPricingContextResult ? data.setPricingContextResult : {}),
            currency_code: data.input.currency_code,
        };
    });
    const flatRateShippingOption = (0, workflows_sdk_1.when)("option-flat", { isCalculatedPriceShippingOption }, ({ isCalculatedPriceShippingOption }) => !isCalculatedPriceShippingOption).then(() => {
        const shippingOption = (0, common_1.useRemoteQueryStep)({
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
            list: false,
        }).config({ name: "flat-reate-option" });
        return shippingOption;
    });
    const result = (0, workflows_sdk_1.transform)({
        calculatedPriceShippingOption,
        flatRateShippingOption,
    }, ({ calculatedPriceShippingOption, flatRateShippingOption }) => {
        return calculatedPriceShippingOption ?? flatRateShippingOption;
    });
    return new workflows_sdk_1.WorkflowResponse(result, { hooks: [setPricingContext] });
});
//# sourceMappingURL=fetch-shipping-option.js.map