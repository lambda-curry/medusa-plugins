export declare const requestDraftOrderEditId = "request-draft-order-edit";
/**
 * The data to request a draft order edit.
 */
export type RequestDraftOrderEditWorkflowInput = {
    /**
     * The ID of the draft order to request the edit for.
     */
    order_id: string;
    /**
     * The ID of the user requesting the edit.
     */
    requested_by?: string;
};
/**
 * This workflow requests a draft order edit. It's used by the
 * [Request Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersideditrequest).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * requesting a draft order edit.
 *
 * @example
 * const { result } = await requestDraftOrderEditWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     requested_by: "user_123",
 *   }
 * })
 *
 * @summary
 *
 * Request a draft order edit.
 */
export declare const requestDraftOrderEditWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<RequestDraftOrderEditWorkflowInput, import("@medusajs/types").OrderPreviewDTO, []>;
//# sourceMappingURL=request-draft-order-edit.d.ts.map