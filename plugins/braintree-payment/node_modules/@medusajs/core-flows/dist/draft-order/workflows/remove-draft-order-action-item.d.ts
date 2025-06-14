import { OrderPreviewDTO, OrderWorkflow } from "@medusajs/types";
export declare const removeDraftOrderActionItemWorkflowId = "remove-draft-order-action-item";
/**
 * This workflow removes an item that was added or updated in a draft order edit. It's used by the
 * [Remove Item from Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_deletedraftordersidedititemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * removing an item from a draft order edit.
 *
 * @example
 * const { result } = await removeDraftOrderActionItemWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "action_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove an item from a draft order edit.
 */
export declare const removeDraftOrderActionItemWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.DeleteOrderEditItemActionWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=remove-draft-order-action-item.d.ts.map