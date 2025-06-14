import { BigNumberInput } from "@medusajs/types";
export declare const updateDraftOrderShippingMethodWorkflowId = "update-draft-order-shipping-method";
/**
 * The details of the shipping method to update in the order edit.
 */
export interface UpdateDraftOrderShippingMethodWorkflowInput {
    /**
     * The ID of the order to update the shipping method in its edit.
     */
    order_id: string;
    data: {
        /**
         * The ID of the shipping method to update.
         */
        shipping_method_id: string;
        /**
         * The ID of the shipping method's option.
         */
        shipping_option_id?: string;
        /**
         * Set a custom amount for the shipping method.
         */
        custom_amount?: BigNumberInput;
        /**
         * A note viewed by admins only related to the shipping method.
         */
        internal_note?: string | null;
    };
}
/**
 * This workflow updates an existing shipping method in a draft order edit. It's used by the
 * [Update Shipping Method in Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersideditshippingmethodsmethodmethod_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating an existing shipping method in a draft order edit.
 *
 * @example
 * const { result } = await updateDraftOrderShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     data: {
 *       shipping_method_id: "sm_123",
 *       custom_amount: 10,
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update an existing shipping method in a draft order edit.
 */
export declare const updateDraftOrderShippingMethodWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpdateDraftOrderShippingMethodWorkflowInput, import("@medusajs/types").OrderPreviewDTO, []>;
//# sourceMappingURL=update-draft-order-shipping-method.d.ts.map