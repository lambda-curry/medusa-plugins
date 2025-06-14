import { PromotionActions } from "@medusajs/framework/utils";
import { OrderDTO } from "@medusajs/types";
export declare const refreshDraftOrderAdjustmentsWorkflowId = "refresh-draft-order-adjustments";
/**
 * The details of the draft order to refresh the adjustments for.
 */
export interface RefreshDraftOrderAdjustmentsWorkflowInput {
    /**
     * The draft order to refresh the adjustments for.
     */
    order: OrderDTO;
    /**
     * The promo codes to add or remove from the draft order.
     */
    promo_codes: string[];
    /**
     * The action to apply with the promo codes. You can
     * either:
     *
     * - Add the promo codes to the draft order.
     * - Remove the promo codes from the draft order.
     * - Replace the existing promo codes with the new ones.
     */
    action: PromotionActions;
}
/**
 * This workflow refreshes the adjustments or promotions for a draft order. It's used by other workflows
 * like {@link addDraftOrderItemsWorkflow} to refresh the promotions whenever changes
 * are made to the draft order.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * refreshing the adjustments or promotions for a draft order.
 *
 * @example
 * const { result } = await refreshDraftOrderAdjustmentsWorkflow(container)
 * .run({
 *   input: {
 *     order: order,
 *     promo_codes: ["PROMO_CODE_1", "PROMO_CODE_2"],
 *     // imported from "@medusajs/framework/utils"
 *     action: PromotionActions.ADD,
 *   }
 * })
 *
 * @summary
 *
 * Refresh the promotions in a draft order.
 */
export declare const refreshDraftOrderAdjustmentsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<RefreshDraftOrderAdjustmentsWorkflowInput, undefined, []>;
//# sourceMappingURL=refresh-draft-order-adjustments.d.ts.map