import { CreateShippingMethodAdjustmentDTO } from "@medusajs/types";
export declare const createDraftOrderShippingMethodAdjustmentsStepId = "create-draft-order-shipping-method-adjustments";
/**
 * The details of the shipping method adjustments to create.
 */
export interface CreateDraftOrderShippingMethodAdjustmentsStepInput {
    /**
     * The shipping method adjustments to create.
     */
    shippingMethodAdjustmentsToCreate: CreateShippingMethodAdjustmentDTO[];
}
/**
 * This step creates shipping method adjustments for a draft order.
 *
 * @example
 * const data = createDraftOrderShippingMethodAdjustmentsStep({
 *   shippingMethodAdjustmentsToCreate: [
 *     {
 *       shipping_method_id: "sm_123",
 *       code: "PROMO_123",
 *       amount: 10,
 *     }
 *   ]
 * })
 */
export declare const createDraftOrderShippingMethodAdjustmentsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateDraftOrderShippingMethodAdjustmentsStepInput, string[] | undefined>;
//# sourceMappingURL=create-draft-order-shipping-method-adjustments.d.ts.map