import { OrderChangeDTO, OrderWorkflow } from "@medusajs/types";
/**
 * The details of the draft order and its change to validate.
 */
export interface ValidateDraftOrderShippingMethodActionStepInput {
    /**
     * The details of the shipping method removal action.
     */
    input: OrderWorkflow.DeleteOrderEditShippingMethodWorkflowInput;
    /**
     * The order change to validate.
     */
    orderChange: OrderChangeDTO;
}
/**
 * This step validates that a shipping method change can be removed from a draft order edit. It throws an error if the
 * shipping method change is not in the draft order edit, or if the shipping method change is not adding a shipping method.
 *
 * :::note
 *
 * You can retrieve a draft order change's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = validateDraftOrderShippingMethodActionStep({
 *   input: {
 *     action_id: "action_123",
 *     order_id: "order_123",
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   }
 * })
 */
export declare const validateDraftOrderShippingMethodActionStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateDraftOrderShippingMethodActionStepInput, unknown>;
//# sourceMappingURL=validate-draft-order-shipping-method-action.d.ts.map