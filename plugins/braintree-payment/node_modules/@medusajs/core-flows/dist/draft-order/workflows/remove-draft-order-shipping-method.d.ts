export declare const removeDraftOrderShippingMethodWorkflowId = "remove-draft-order-shipping-method";
/**
 * The details of the shipping method to remove from a draft order.
 */
export interface RemoveDraftOrderShippingMethodWorkflowInput {
    /**
     * The ID of the draft order to remove the shipping method from.
     */
    order_id: string;
    /**
     * The ID of the shipping method to remove.
     */
    shipping_method_id: string;
}
/**
 * This workflow removes an existing shipping method from a draft order edit. It's used by the
 * [Remove Shipping Method from Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_deletedraftordersideditshippingmethodsmethodmethod_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * removing a shipping method from a draft order edit.
 *
 * @example
 * const { result } = await removeDraftOrderShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     shipping_method_id: "sm_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove an existing shipping method from a draft order edit.
 */
export declare const removeDraftOrderShippingMethodWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<RemoveDraftOrderShippingMethodWorkflowInput, import("@medusajs/types").OrderPreviewDTO, []>;
//# sourceMappingURL=remove-draft-order-shipping-method.d.ts.map