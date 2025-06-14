import { OrderDTO } from "@medusajs/types";
/**
 * The details of the draft order to get the promotion context for.
 */
export interface GetDraftOrderPromotionContextStepInput {
    /**
     * The draft order to get the promotion context for.
     */
    order: OrderDTO;
}
/**
 * This step gets the promotion context for a draft order.
 *
 * :::note
 *
 * You can retrieve a draft order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = getDraftOrderPromotionContextStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   }
 * })
 */
export declare const getDraftOrderPromotionContextStep: import("@medusajs/framework/workflows-sdk").StepFunction<GetDraftOrderPromotionContextStepInput, OrderDTO>;
//# sourceMappingURL=get-draft-order-promotion-context.d.ts.map