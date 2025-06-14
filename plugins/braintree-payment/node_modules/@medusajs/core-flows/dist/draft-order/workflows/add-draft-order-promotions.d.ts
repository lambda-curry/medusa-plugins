export declare const addDraftOrderPromotionWorkflowId = "add-draft-order-promotion";
/**
 * The details of the promotions to add to a draft order.
 */
export interface AddDraftOrderPromotionWorkflowInput {
    /**
     * The ID of the draft order to add the promotions to.
     */
    order_id: string;
    /**
     * The codes of the promotions to add to the draft order.
     */
    promo_codes: string[];
}
/**
 * This workflow adds promotions to a draft order. It's used by the
 * [Add Promotion to Draft Order Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersideditpromotions).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around adding promotions to
 * a draft order.
 *
 * @example
 * const { result } = await addDraftOrderPromotionWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     promo_codes: ["PROMO_CODE_1", "PROMO_CODE_2"]
 *   }
 * })
 *
 * @summary
 *
 * Add promotions to a draft order.
 */
export declare const addDraftOrderPromotionWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<AddDraftOrderPromotionWorkflowInput, import("@medusajs/types").OrderPreviewDTO, []>;
//# sourceMappingURL=add-draft-order-promotions.d.ts.map