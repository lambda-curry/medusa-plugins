export declare const cancelDraftOrderEditWorkflowId = "cancel-draft-order-edit";
/**
 * The details of the draft order edit to cancel.
 */
export interface CancelDraftOrderEditWorkflowInput {
    /**
     * The ID of the draft order to cancel the edit for.
     */
    order_id: string;
}
/**
 * This workflow cancels a draft order edit. It's used by the
 * [Cancel Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_deletedraftordersidedit).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * cancelling a draft order edit.
 *
 * @example
 * const { result } = await cancelDraftOrderEditWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Cancel a draft order edit.
 */
export declare const cancelDraftOrderEditWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CancelDraftOrderEditWorkflowInput, unknown, any[]>;
//# sourceMappingURL=cancel-draft-order-edit.d.ts.map