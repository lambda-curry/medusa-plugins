import { CreateLineItemAdjustmentDTO } from "@medusajs/types";
export declare const createDraftOrderLineItemAdjustmentsStepId = "create-draft-order-line-item-adjustments";
/**
 * The details of the line item adjustments to create.
 */
export interface CreateDraftOrderLineItemAdjustmentsStepInput {
    /**
     * The ID of the draft order to create the line item adjustments for.
     */
    order_id: string;
    /**
     * The line item adjustments to create.
     */
    lineItemAdjustmentsToCreate: CreateLineItemAdjustmentDTO[];
}
/**
 * This step creates line item adjustments for a draft order.
 *
 * @example
 * const data = createDraftOrderLineItemAdjustmentsStep({
 *   order_id: "order_123",
 *   lineItemAdjustmentsToCreate: [
 *     {
 *       item_id: "orli_123",
 *       code: "PROMO_123",
 *       amount: 10,
 *     }
 *   ]
 * })
 */
export declare const createDraftOrderLineItemAdjustmentsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateDraftOrderLineItemAdjustmentsStepInput, string[] | undefined>;
//# sourceMappingURL=create-draft-order-line-item-adjustments.d.ts.map