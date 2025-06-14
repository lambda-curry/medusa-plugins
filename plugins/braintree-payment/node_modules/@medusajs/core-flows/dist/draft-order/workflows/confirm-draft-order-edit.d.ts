export declare const confirmDraftOrderEditWorkflowId = "confirm-draft-order-edit";
export interface ConfirmDraftOrderEditWorkflowInput {
    /**
     * The ID of the draft order to confirm the edit for.
     */
    order_id: string;
    /**
     * The ID of the user confirming the edit.
     */
    confirmed_by: string;
}
/**
 * This workflow confirms a draft order edit. It's used by the
 * [Confirm Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersideditconfirm).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * confirming a draft order edit.
 *
 * @example
 * const { result } = await confirmDraftOrderEditWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     confirmed_by: "user_123",
 *   }
 * })
 *
 * @summary
 *
 * Confirm a draft order edit.
 */
export declare const confirmDraftOrderEditWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<ConfirmDraftOrderEditWorkflowInput, import("@medusajs/types").OrderPreviewDTO, []>;
//# sourceMappingURL=confirm-draft-order-edit.d.ts.map