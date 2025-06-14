import { OrderWorkflow } from "@medusajs/types";
export declare const addDraftOrderItemsWorkflowId = "add-draft-order-items";
/**
 * This workflow adds items to a draft order. It's used by the
 * [Add Item to Draft Order Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersidedititems).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around adding items to
 * a draft order.
 *
 * @example
 * const { result } = await addDraftOrderItemsWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     items: [{
 *       variant_id: "variant_123",
 *       quantity: 1
 *     }]
 *   }
 * })
 *
 * @summary
 *
 * Add items to a draft order.
 */
export declare const addDraftOrderItemsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.OrderEditAddNewItemWorkflowInput, import("@medusajs/types").OrderPreviewDTO, []>;
//# sourceMappingURL=add-draft-order-items.d.ts.map