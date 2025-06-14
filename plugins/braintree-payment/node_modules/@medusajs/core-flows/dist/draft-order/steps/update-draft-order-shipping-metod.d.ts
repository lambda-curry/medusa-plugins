import { BigNumberInput } from "@medusajs/types";
export declare const updateDraftOrderShippingMethodStepId = "update-draft-order-shipping-method";
/**
 * The details of the shipping method to update in a draft order.
 */
export interface UpdateDraftOrderShippingMethodStepInput {
    /**
     * The ID of the draft order.
     */
    order_id: string;
    /**
     * The ID of the shipping method to update.
     */
    shipping_method_id: string;
    /**
     * The ID of the shipping method's option.
     */
    shipping_option_id?: string;
    /**
     * The amount of the shipping method.
     */
    amount?: BigNumberInput;
    /**
     * The metadata of the shipping method.
     */
    metadata?: Record<string, unknown> | null;
}
/**
 * This step updates the shipping method of a draft order.
 *
 * @example
 * const data = updateDraftOrderShippingMethodStep({
 *   order_id: "order_123",
 *   shipping_method_id: "sm_123",
 *   amount: 10,
 * })
 */
export declare const updateDraftOrderShippingMethodStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateDraftOrderShippingMethodStepInput, {
    before: import("@medusajs/types").OrderShippingMethodDTO;
    after: import("@medusajs/types").OrderShippingMethodDTO;
}>;
//# sourceMappingURL=update-draft-order-shipping-metod.d.ts.map