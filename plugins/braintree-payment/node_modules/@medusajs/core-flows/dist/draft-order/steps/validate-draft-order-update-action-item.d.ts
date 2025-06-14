import { OrderChangeDTO, OrderWorkflow } from "@medusajs/types";
/**
 * The details of the draft order and its change to validate.
 */
export interface ValidateDraftOrderUpdateActionItemStepInput {
    /**
     * The details of updating a new item in a draft order edit.
     */
    input: OrderWorkflow.UpdateOrderEditAddNewItemWorkflowInput;
    /**
     * The order change to validate.
     */
    orderChange: OrderChangeDTO;
}
/**
 * This step validates that a new item can be updated in a draft order edit. It throws an error if the
 * item change is not in the draft order edit, or if the item change is not adding an item.
 *
 * :::note
 *
 * You can retrieve a draft order change's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = validateDraftOrderUpdateActionItemStep({
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
export declare const validateDraftOrderUpdateActionItemStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateDraftOrderUpdateActionItemStepInput, unknown>;
//# sourceMappingURL=validate-draft-order-update-action-item.d.ts.map