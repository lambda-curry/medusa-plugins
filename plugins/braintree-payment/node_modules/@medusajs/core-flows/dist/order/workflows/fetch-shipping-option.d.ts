import { AdditionalData, BigNumberInput, CalculatedRMAShippingContext, ShippingOptionDTO } from "@medusajs/framework/types";
import { BigNumber } from "@medusajs/framework/utils";
/**
 * The data to create a shipping method for an order edit.
 */
export type FetchShippingOptionForOrderWorkflowInput = AdditionalData & {
    /**
     * The ID of the shipping option to fetch.
     */
    shipping_option_id: string;
    /**
     * The custom amount of the shipping option.
     * If not provided, the shipping option's amount is used.
     */
    custom_amount?: BigNumberInput | null;
    /**
     * The currency code of the order.
     */
    currency_code: string;
    /**
     * The ID of the order.
     */
    order_id: string;
    /**
     * The context of the RMA flow, which can be useful for retrieving the shipping option's price.
     */
    context: CalculatedRMAShippingContext;
};
/**
 * The output of the fetch shipping option for order workflow.
 */
export type FetchShippingOptionForOrderWorkflowOutput = ShippingOptionDTO & {
    /**
     * The shipping option's price.
     */
    calculated_price: {
        /**
         * The shipping option's price based on its type and provided context.
         */
        calculated_amount: BigNumber;
        /**
         * Whether the amount includes taxes.
         */
        is_calculated_price_tax_inclusive: boolean;
    };
};
export declare const fetchShippingOptionsForOrderWorkflowId = "fetch-shipping-option";
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
export declare const fetchShippingOptionForOrderWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<AdditionalData & {
    /**
     * The ID of the shipping option to fetch.
     */
    shipping_option_id: string;
    /**
     * The custom amount of the shipping option.
     * If not provided, the shipping option's amount is used.
     */
    custom_amount?: BigNumberInput | null;
    /**
     * The currency code of the order.
     */
    currency_code: string;
    /**
     * The ID of the order.
     */
    order_id: string;
    /**
     * The context of the RMA flow, which can be useful for retrieving the shipping option's price.
     */
    context: CalculatedRMAShippingContext;
}, ShippingOptionDTO & {
    /**
     * The shipping option's price.
     */
    calculated_price: {
        /**
         * The shipping option's price based on its type and provided context.
         */
        calculated_amount: BigNumber;
        /**
         * Whether the amount includes taxes.
         */
        is_calculated_price_tax_inclusive: boolean;
    };
}, [import("@medusajs/framework/workflows-sdk").Hook<"setPricingContext", FetchShippingOptionForOrderWorkflowInput, Record<string, any> | undefined>]>;
//# sourceMappingURL=fetch-shipping-option.d.ts.map