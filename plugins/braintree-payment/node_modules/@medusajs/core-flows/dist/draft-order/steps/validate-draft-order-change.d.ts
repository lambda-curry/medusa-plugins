import { OrderChangeDTO, OrderDTO } from "@medusajs/types";
/**
 * The details of the draft order and its change to validate.
 */
export interface ValidateDraftOrderChangeStepInput {
    /**
     * The draft order to validate.
     */
    order: OrderDTO;
    /**
     * The order change to validate.
     */
    orderChange: OrderChangeDTO;
}
export declare const validateDraftOrderChangeStepId = "validate-draft-order-change";
/**
 * This step validates that a draft order and its change are valid. It throws an error if the
 * order is not a draft order or the order change is not active.
 *
 * :::note
 *
 * You can retrieve a draft order and its change's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = validateDraftOrderChangeStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   }
 * })
 */
export declare const validateDraftOrderChangeStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateDraftOrderChangeStepInput, unknown>;
//# sourceMappingURL=validate-draft-order-change.d.ts.map