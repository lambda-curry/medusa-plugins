export declare const removeDraftOrderPromotionsWorkflowId = "remove-draft-order-promotions";
/**
 * The details of the promotions to remove from a draft order.
 */
export interface RemoveDraftOrderPromotionsWorkflowInput {
    /**
     * The ID of the draft order to remove the promotions from.
     */
    order_id: string;
    /**
     * The codes of the promotions to remove from the draft order.
     */
    promo_codes: string[];
}
/**
 * This workflow removes promotions from a draft order edit. It's used by the
 * [Remove Promotions from Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_deletedraftordersideditpromotions).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * removing promotions from a draft order edit.
 *
 * @example
 * const { result } = await removeDraftOrderPromotionsWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     promo_codes: ["PROMO_CODE_1", "PROMO_CODE_2"],
 *   }
 * })
 *
 * @summary
 *
 * Remove promotions from a draft order edit.
 */
export declare const removeDraftOrderPromotionsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<RemoveDraftOrderPromotionsWorkflowInput, import("@medusajs/types").OrderPreviewDTO, []>;
//# sourceMappingURL=remove-draft-order-promotions.d.ts.map