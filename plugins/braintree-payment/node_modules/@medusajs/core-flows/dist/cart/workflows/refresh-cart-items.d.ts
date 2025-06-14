import { WorkflowData } from "@medusajs/framework/workflows-sdk";
import { AdditionalData } from "@medusajs/types";
/**
 * The details of the cart to refresh.
 */
export type RefreshCartItemsWorkflowInput = {
    /**
     * The cart's ID.
     */
    cart_id: string;
    /**
     * The promotion codes applied on the cart.
     * These promotion codes will replace previously applied codes.
     */
    promo_codes?: string[];
    /**
     * Force refresh the cart items
     */
    force_refresh?: boolean;
    /**
     * The items to refresh.
     */
    items?: any[];
    /**
     * The shipping methods to refresh.
     */
    shipping_methods?: any[];
    /**
     * Whether to force re-calculating tax amounts, which
     * may include sending requests to a third-part tax provider, depending
     * on the configurations of the cart's tax region.
     */
    force_tax_calculation?: boolean;
};
export declare const refreshCartItemsWorkflowId = "refresh-cart-items";
/**
 * This workflow refreshes a cart to ensure its prices, promotion codes, taxes, and other details are applied correctly. It's useful
 * after making a chnge to a cart, such as after adding an item to the cart or adding a promotion code.
 *
 * This workflow is used by other cart-related workflows, such as the {@link addToCartWorkflow} after an item
 * is added to the cart.
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to refresh the cart after making updates to it in your
 * custom flows.
 *
 * @example
 * const { result } = await refreshCartItemsWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *   }
 * })
 *
 * @summary
 *
 * Refresh a cart's details after an update.
 *
 * @property hooks.setPricingContext - This hook is executed before the cart is refreshed. You can consume this hook to return any custom context useful for the prices retrieval of the variants in the cart.
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
 * import { refreshCartItemsWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 *
 * refreshCartItemsWorkflow.hooks.setPricingContext((
 *   { cart, items, additional_data }, { container }
 * ) => {
 *   return new StepResponse({
 *     location_id: "sloc_123", // Special price for in-store purchases
 *   });
 * });
 * ```
 *
 * The variants' prices will now be retrieved using the context you return.
 *
 * :::note
 *
 * Learn more about prices calculation context in the [Prices Calculation](https://docs.medusajs.com/resources/commerce-modules/pricing/price-calculation) documentation.
 *
 * :::
 *
 */
export declare const refreshCartItemsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<RefreshCartItemsWorkflowInput & AdditionalData, any, [import("@medusajs/framework/workflows-sdk").Hook<"setPricingContext", {
    cart_id: (string | WorkflowData<string>) & string;
    items: ((any[] | WorkflowData<any[] | undefined>) & any[]) | undefined;
    additional_data: ((Record<string, unknown> | WorkflowData<Record<string, unknown> | undefined>) & Record<string, unknown>) | undefined;
}, Record<string, any> | undefined>, import("@medusajs/framework/workflows-sdk").Hook<"beforeRefreshingPaymentCollection", {
    input: WorkflowData<RefreshCartItemsWorkflowInput & AdditionalData>;
}, unknown>]>;
//# sourceMappingURL=refresh-cart-items.d.ts.map