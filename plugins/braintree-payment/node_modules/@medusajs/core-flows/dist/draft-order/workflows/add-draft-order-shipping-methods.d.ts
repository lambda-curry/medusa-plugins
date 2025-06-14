import { BigNumberInput } from "@medusajs/types";
export declare const addDraftOrderShippingMethodsWorkflowId = "add-draft-order-shipping-methods";
/**
 * The details of the shipping methods to add to a draft order.
 */
export interface AddDraftOrderShippingMethodsWorkflowInput {
    /**
     * The ID of the draft order to add the shipping methods to.
     */
    order_id: string;
    /**
     * The ID of the shipping option to add as a shipping method.
     */
    shipping_option_id: string;
    /**
     * The custom amount to add the shipping method with.
     * If not specified, the shipping option's fixed or calculated price will be used.
     */
    custom_amount?: BigNumberInput | null;
}
/**
 * This workflow adds shipping methods to a draft order. It's used by the
 * [Add Shipping Method to Draft Order Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersideditshippingmethods).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around adding shipping methods to
 * a draft order.
 *
 * @example
 * const { result } = await addDraftOrderShippingMethodsWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     shipping_option_id: "so_123",
 *     custom_amount: 10
 *   }
 * })
 *
 * @summary
 *
 * Add shipping methods to a draft order.
 */
export declare const addDraftOrderShippingMethodsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<AddDraftOrderShippingMethodsWorkflowInput, import("@medusajs/types").OrderPreviewDTO, []>;
//# sourceMappingURL=add-draft-order-shipping-methods.d.ts.map