export declare const removeDraftOrderShippingMethodAdjustmentsStepId = "remove-draft-order-shipping-method-adjustments";
/**
 * The details of the shipping method adjustments to remove.
 */
export interface RemoveDraftOrderShippingMethodAdjustmentsStepInput {
    /**
     * The IDs of the shipping method adjustments to remove.
     */
    shippingMethodAdjustmentIdsToRemove: string[];
}
/**
 * This step removes shipping method adjustments from a draft order.
 *
 * @example
 * const data = removeDraftOrderShippingMethodAdjustmentsStep({
 *   shippingMethodAdjustmentIdsToRemove: ["adj_123", "adj_456"],
 * })
 */
export declare const removeDraftOrderShippingMethodAdjustmentsStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemoveDraftOrderShippingMethodAdjustmentsStepInput, undefined>;
//# sourceMappingURL=remove-draft-order-shipping-method-adjustments.d.ts.map