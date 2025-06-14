import { PromotionActions } from "@medusajs/framework/utils";
export declare const updateDraftOrderPromotionsStepId = "update-draft-order-promotions";
/**
 * The details of the promotions to update in a draft order.
 */
export interface UpdateDraftOrderPromotionsStepInput {
    /**
     * The ID of the draft order.
     */
    id: string;
    /**
     * The promo codes to add, replace, or remove from the draft order.
     */
    promo_codes: string[];
    /**
     * The action to perform on the promotions. You can either:
     *
     * - Add the promotions to the draft order.
     * - Replace the existing promotions with the new ones.
     * - Remove the promotions from the draft order.
     */
    action?: PromotionActions;
}
/**
 * This step updates the promotions of a draft order.
 *
 * @example
 * const data = updateDraftOrderPromotionsStep({
 *   id: "order_123",
 *   promo_codes: ["PROMO_123", "PROMO_456"],
 *   // Import from "@medusajs/framework/utils"
 *   action: PromotionActions.ADD,
 * })
 */
export declare const updateDraftOrderPromotionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateDraftOrderPromotionsStepInput, null>;
//# sourceMappingURL=update-draft-order-promotions.d.ts.map