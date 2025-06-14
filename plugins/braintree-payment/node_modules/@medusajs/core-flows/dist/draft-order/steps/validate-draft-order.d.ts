import { OrderDTO } from "@medusajs/types";
/**
 * The details of the draft order to validate.
 */
export interface ValidateDraftOrderStepInput {
    /**
     * The draft order to validate.
     */
    order: OrderDTO;
}
/**
 * This step validates that an order is a draft order. It throws an error otherwise.
 *
 * :::note
 *
 * You can retrieve a draft order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = validateDraftOrderStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   }
 * })
 */
export declare const validateDraftOrderStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateDraftOrderStepInput, unknown>;
//# sourceMappingURL=validate-draft-order.d.ts.map