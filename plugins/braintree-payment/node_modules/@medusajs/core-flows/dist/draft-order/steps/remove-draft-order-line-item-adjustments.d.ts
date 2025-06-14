export declare const removeDraftOrderLineItemAdjustmentsStepId = "remove-draft-order-line-item-adjustments";
/**
 * The details of the line item adjustments to remove.
 */
export interface RemoveDraftOrderLineItemAdjustmentsStepInput {
    /**
     * The IDs of the line item adjustments to remove.
     */
    lineItemAdjustmentIdsToRemove: string[];
}
/**
 * This step removes line item adjustments from a draft order.
 *
 * @example
 * const data = removeDraftOrderLineItemAdjustmentsStep({
 *   lineItemAdjustmentIdsToRemove: ["adj_123", "adj_456"],
 * })
 */
export declare const removeDraftOrderLineItemAdjustmentsStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemoveDraftOrderLineItemAdjustmentsStepInput, undefined>;
//# sourceMappingURL=remove-draft-order-line-item-adjustments.d.ts.map