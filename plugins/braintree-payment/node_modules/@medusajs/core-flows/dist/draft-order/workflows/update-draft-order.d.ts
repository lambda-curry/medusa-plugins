import { OrderDTO, UpdateOrderDTO, UpsertOrderAddressDTO } from "@medusajs/types";
export declare const updateDraftOrderWorkflowId = "update-draft-order";
/**
 * The details of the draft order to update.
 */
export interface UpdateDraftOrderWorkflowInput {
    /**
     * The ID of the draft order to update.
     */
    id: string;
    /**
     * The ID of the user updating the draft order.
     */
    user_id: string;
    /**
     * Create or update the shipping address of the draft order.
     */
    shipping_address?: UpsertOrderAddressDTO;
    /**
     * Create or update the billing address of the draft order.
     */
    billing_address?: UpsertOrderAddressDTO;
    /**
     * The ID of the customer to associate the draft order with.
     */
    customer_id?: string;
    /**
     * The new email of the draft order.
     */
    email?: string;
    /**
     * The ID of the sales channel to associate the draft order with.
     */
    sales_channel_id?: string;
    /**
     * The new metadata of the draft order.
     */
    metadata?: Record<string, unknown> | null;
}
/**
 * The input for the update draft order step.
 */
export interface UpdateDraftOrderStepInput {
    /**
     * The draft order to update.
     */
    order: OrderDTO;
    /**
     * The details to update in the draft order.
     */
    input: UpdateOrderDTO;
}
/**
 * This step updates a draft order's details.
 *
 * :::note
 *
 * You can retrieve a draft order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = updateDraftOrderStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   input: {
 *     // details to update...
 *   }
 * })
 */
export declare const updateDraftOrderStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateDraftOrderStepInput, OrderDTO>;
/**
 * This workflow updates a draft order's details. It's used by the
 * [Update Draft Order Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersid).
 *
 * This workflow doesn't update the draft order's items, shipping methods, or promotions. Instead, you have to
 * create a draft order edit using {@link beginDraftOrderEditWorkflow} and make updates in the draft order edit.
 * Then, you can confirm the draft order edit using {@link confirmDraftOrderEditWorkflow} or request a draft order edit
 * using {@link requestDraftOrderEditWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating a draft order.
 *
 * @example
 * const { result } = await updateDraftOrderWorkflow(container)
 * .run({
 *   input: {
 *     id: "order_123",
 *     user_id: "user_123",
 *     customer_id: "cus_123",
 *   }
 * })
 *
 * @summary
 *
 * Update a draft order's details.
 */
export declare const updateDraftOrderWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpdateDraftOrderWorkflowInput, import("@medusajs/types").OrderPreviewDTO, []>;
//# sourceMappingURL=update-draft-order.d.ts.map