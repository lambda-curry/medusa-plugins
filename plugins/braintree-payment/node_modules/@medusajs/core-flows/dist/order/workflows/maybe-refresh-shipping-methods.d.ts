import { CalculatedRMAShippingContext } from "@medusajs/framework/types";
/**
 * The data to create a shipping method for an order edit.
 */
export type MaybeRefreshShippingMethodsWorkflowInput = {
    /**
     * The ID of the shipping method to refresh.
     */
    shipping_method_id: string;
    /**
     * The ID of the order.
     */
    order_id: string;
    /**
     * The ID of the ADD SHIPPING action to update.
     */
    action_id: string;
    /**
     * Data to pass for the shipping calculation.
     */
    context: CalculatedRMAShippingContext;
};
export declare const maybeRefreshShippingMethodsWorkflowId = "maybe-refresh-shipping-methods";
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
export declare const maybeRefreshShippingMethodsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<MaybeRefreshShippingMethodsWorkflowInput, void, []>;
//# sourceMappingURL=maybe-refresh-shipping-methods.d.ts.map