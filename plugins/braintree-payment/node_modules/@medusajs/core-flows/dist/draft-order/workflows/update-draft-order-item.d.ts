import { OrderPreviewDTO, OrderWorkflow } from "@medusajs/types";
export declare const updateDraftOrderItemWorkflowId = "update-draft-order-item";
/**
 * This workflow updates an item in a draft order edit. It's used by the
 * [Update Item in Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersidedititemsitemitem_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating an item in a draft order edit.
 *
 * @example
 * const { result } = await updateDraftOrderItemWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     items: [{ id: "orli_123", quantity: 2 }],
 *   }
 * })
 *
 * @summary
 *
 * Update an item in a draft order edit.
 */
export declare const updateDraftOrderItemWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.OrderEditUpdateItemQuantityWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=update-draft-order-item.d.ts.map