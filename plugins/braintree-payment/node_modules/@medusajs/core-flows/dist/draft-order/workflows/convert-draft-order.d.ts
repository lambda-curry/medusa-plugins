import { OrderDTO } from "@medusajs/types";
export declare const convertDraftOrderWorkflowId = "convert-draft-order";
/**
 * The details of the draft order to convert to an order.
 */
export interface ConvertDraftOrderWorkflowInput {
    /**
     * The ID of the draft order to convert to an order.
     */
    id: string;
}
/**
 * The details of the draft order to convert to an order.
 */
export interface ConvertDraftOrderStepInput {
    /**
     * The ID of the draft order to convert to an order.
     */
    id: string;
}
/**
 * This step converts a draft order to a pending order.
 */
export declare const convertDraftOrderStep: import("@medusajs/framework/workflows-sdk").StepFunction<ConvertDraftOrderStepInput, OrderDTO>;
/**
 * This workflow converts a draft order to a pending order. It's used by the
 * [Convert Draft Order to Order Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersidconverttoorder).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * converting a draft order to a pending order.
 *
 * @example
 * const { result } = await convertDraftOrderWorkflow(container)
 * .run({
 *   input: {
 *     id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Convert a draft order to a pending order.
 */
export declare const convertDraftOrderWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<ConvertDraftOrderWorkflowInput, OrderDTO, []>;
//# sourceMappingURL=convert-draft-order.d.ts.map