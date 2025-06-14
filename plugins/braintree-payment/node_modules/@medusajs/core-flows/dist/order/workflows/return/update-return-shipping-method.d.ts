import { AdditionalData, OrderChangeDTO, OrderPreviewDTO, OrderWorkflow, ReturnDTO } from "@medusajs/framework/types";
import { WorkflowData } from "@medusajs/framework/workflows-sdk";
/**
 * The data to validate that a return's shipping method can be updated.
 */
export type UpdateReturnShippingMethodValidationStepInput = {
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The return's details.
     */
    orderReturn: ReturnDTO;
    /**
     * The details of updating the shipping method.
     */
    input: Pick<OrderWorkflow.UpdateReturnShippingMethodWorkflowInput, "return_id" | "action_id">;
};
/**
 * This step validates that a return's shipping method can be updated.
 * If the return is canceled, the order change is not active,
 * the shipping method isn't in the return, or the action isn't adding a shipping method,
 * the step will throw an error.
 *
 * :::note
 *
 * You can retrieve a return and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = updateReturnShippingMethodValidationStep({
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderReturn: {
 *     id: "return_123",
 *     // other return details...
 *   },
 *   input: {
 *     return_id: "return_123",
 *     action_id: "orchac_123",
 *   }
 * })
 */
export declare const updateReturnShippingMethodValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateReturnShippingMethodValidationStepInput, unknown>;
export declare const updateReturnShippingMethodWorkflowId = "update-return-shipping-method";
/**
 * This workflow updates the shipping method of a return. It's used by the
 * [Update Shipping Method Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturnsidshippingmethodaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to update the shipping method of a return in your custom flows.
 *
 * @example
 * const { result } = await updateReturnShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *     action_id: "orchac_123",
 *     data: {
 *       custom_amount: 10,
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update the shipping method of a return.
 *
 * @property hooks.setPricingContext - This hook is executed before the shipping method is created. You can consume this hook to return any custom context useful for the prices retrieval of the shipping method's option.
 *
 * For example, assuming you have the following custom pricing rule:
 *
 * ```json
 * {
 *   "attribute": "location_id",
 *   "operator": "eq",
 *   "value": "sloc_123",
 * }
 * ```
 *
 * You can consume the `setPricingContext` hook to add the `location_id` context to the prices calculation:
 *
 * ```ts
 * import { updateReturnShippingMethodWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 *
 * updateReturnShippingMethodWorkflow.hooks.setPricingContext((
 *   { order_return, order_change, additional_data }, { container }
 * ) => {
 *   return new StepResponse({
 *     location_id: "sloc_123", // Special price for in-store purchases
 *   });
 * });
 * ```
 *
 * The price of the shipping method's option will now be retrieved using the context you return.
 *
 * :::note
 *
 * Learn more about prices calculation context in the [Prices Calculation](https://docs.medusajs.com/resources/commerce-modules/pricing/price-calculation) documentation.
 *
 * :::
 */
export declare const updateReturnShippingMethodWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.UpdateReturnShippingMethodWorkflowInput & AdditionalData, OrderPreviewDTO, [import("@medusajs/framework/workflows-sdk").Hook<"setPricingContext", {
    order_return: ReturnDTO;
    order_change: OrderChangeDTO;
    additional_data: ((Record<string, unknown> | WorkflowData<Record<string, unknown> | undefined>) & Record<string, unknown>) | undefined;
}, Record<string, any> | undefined>]>;
//# sourceMappingURL=update-return-shipping-method.d.ts.map