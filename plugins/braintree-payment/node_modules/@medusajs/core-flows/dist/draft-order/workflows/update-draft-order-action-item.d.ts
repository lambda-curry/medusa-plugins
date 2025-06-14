import { OrderWorkflow } from "@medusajs/types";
export declare const updateDraftOrderActionItemId = "update-draft-order-action-item";
/**
 * This workflow updates a new item that was added to a draft order edit. It's used by the
 * [Update New Item in Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersidedititemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating a new item in a draft order edit.
 *
 * @example
 * const { result } = await updateDraftOrderActionItemWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "action_123",
 *     data: {
 *       quantity: 2,
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update a new item in a draft order edit.
 */
export declare const updateDraftOrderActionItemWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.UpdateOrderEditAddNewItemWorkflowInput, import("@medusajs/types").OrderPreviewDTO, []>;
//# sourceMappingURL=update-draft-order-action-item.d.ts.map