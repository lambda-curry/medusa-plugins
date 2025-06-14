import { OrderPreviewDTO, OrderWorkflow } from "@medusajs/types";
export declare const updateDraftOrderActionShippingMethodWorkflowId = "update-draft-order-action-shipping-method";
/**
 * This workflow updates a new shipping method that was added to a draft order edit. It's used by the
 * [Update New Shipping Method in Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersideditshippingmethodsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating a new shipping method in a draft order edit.
 *
 * @example
 * const { result } = await updateDraftOrderActionShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "action_123",
 *     data: {
 *       custom_amount: 10,
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update a new shipping method in a draft order edit.
 */
export declare const updateDraftOrderActionShippingMethodWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.UpdateOrderEditShippingMethodWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=update-draft-order-action-shipping-method.d.ts.map