import { WorkflowData } from "@medusajs/framework/workflows-sdk";
import { AdditionalData, ListShippingOptionsForCartWorkflowInput } from "@medusajs/types";
export declare const listShippingOptionsForCartWorkflowId = "list-shipping-options-for-cart";
/**
 * This workflow lists the shipping options of a cart. It's executed by the
 * [List Shipping Options Store API Route](https://docs.medusajs.com/api/store#shipping-options_getshippingoptions).
 *
 * :::note
 *
 * This workflow doesn't retrieve the calculated prices of the shipping options. If you need to retrieve the prices of the shipping options,
 * use the {@link listShippingOptionsForCartWithPricingWorkflow} workflow.
 *
 * :::
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to wrap custom logic around to retrieve the shipping options of a cart
 * in your custom flows.
 *
 * @example
 * const { result } = await listShippingOptionsForCartWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     option_ids: ["so_123"]
 *   }
 * })
 *
 * @summary
 *
 * List a cart's shipping options.
 *
 * @property hooks.setPricingContext - This hook is executed before the shipping options are retrieved. You can consume this hook to return any custom context useful for the prices retrieval of shipping options.
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
 * import { listShippingOptionsForCartWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 *
 * listShippingOptionsForCartWorkflow.hooks.setPricingContext((
 *   { cart, fulfillmentSetIds, additional_data }, { container }
 * ) => {
 *   return new StepResponse({
 *     location_id: "sloc_123", // Special price for in-store purchases
 *   });
 * });
 * ```
 *
 * The shipping options' prices will now be retrieved using the context you return.
 *
 * :::note
 *
 * Learn more about prices calculation context in the [Prices Calculation](https://docs.medusajs.com/resources/commerce-modules/pricing/price-calculation) documentation.
 *
 * :::
 */
export declare const listShippingOptionsForCartWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<ListShippingOptionsForCartWorkflowInput & AdditionalData, any, [import("@medusajs/framework/workflows-sdk").Hook<"setPricingContext", {
    cart: any;
    fulfillmentSetIds: (string[] | WorkflowData<string[]>) & string[];
    additional_data: ((Record<string, unknown> | WorkflowData<Record<string, unknown> | undefined>) & Record<string, unknown>) | undefined;
}, Record<string, any> | undefined>]>;
//# sourceMappingURL=list-shipping-options-for-cart.d.ts.map