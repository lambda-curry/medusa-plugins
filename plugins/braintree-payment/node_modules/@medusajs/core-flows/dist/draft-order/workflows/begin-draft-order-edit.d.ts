import { OrderWorkflow } from "@medusajs/types";
export declare const beginDraftOrderEditWorkflowId = "begin-draft-order-edit";
/**
 * This workflow begins a draft order edit. It's used by the
 * [Create Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersidedit).
 *
 * The draft order edit can later be requested using {@link requestDraftOrderEditWorkflow} or confirmed using {@link confirmDraftOrderEditWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * creating a draft order edit request.
 *
 * @example
 * const { result } = await beginDraftOrderEditWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Create a draft order edit request.
 */
export declare const beginDraftOrderEditWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.BeginorderEditWorkflowInput, import("@medusajs/types").OrderPreviewDTO, []>;
//# sourceMappingURL=begin-draft-order-edit.d.ts.map