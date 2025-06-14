import { OrderPreviewDTO, OrderWorkflow } from "@medusajs/types";
export declare const removeDraftOrderActionShippingMethodWorkflowId = "remove-draft-order-action-shipping-method";
/**
 * This workflow removes a shipping method that was added to an edited draft order. It's used by the
 * [Remove Shipping Method from Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_deletedraftordersideditshippingmethodsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * removing a shipping method from an edited draft order.
 *
 * @example
 * const { result } = await removeDraftOrderActionShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "action_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove a shipping method from an edited draft order.
 */
export declare const removeDraftOrderActionShippingMethodWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.DeleteOrderEditShippingMethodWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=remove-draft-order-action-shipping-method.d.ts.map