import { AdditionalData, OrderChangeDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
import { WorkflowData } from "@medusajs/framework/workflows-sdk";
/**
 * The data to validate that an order edit's shipping method can be updated.
 */
export type UpdateOrderEditShippingMethodValidationStepInput = {
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The details of the shipping method to be updated.
     */
    input: Pick<OrderWorkflow.UpdateOrderEditShippingMethodWorkflowInput, "order_id" | "action_id">;
};
/**
 * This step validates that an order edit's shipping method can be updated.
 * If the order change is not active, the shipping method isn't in the order edit,
 * or the action is not adding a shipping method, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = updateOrderEditShippingMethodValidationStep({
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   input: {
 *     order_id: "order_123",
 *     action_id: "orchac_123",
 *     data: {
 *       custom_amount: 10,
 *     }
 *   }
 * })
 */
export declare const updateOrderEditShippingMethodValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateOrderEditShippingMethodValidationStepInput, unknown>;
export declare const updateOrderEditShippingMethodWorkflowId = "update-order-edit-shipping-method";
/**
 * This workflow updates an order edit's shipping method. It's used by the
 * [Update Shipping Method Admin API Route](https://docs.medusajs.com/api/admin#order-edits_postordereditsidshippingmethodaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update an order edit's shipping method
 * in your custom flow.
 *
 * @example
 * const { result } = await updateOrderEditShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "orchac_123",
 *     data: {
 *       custom_amount: 10,
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update a shipping method of an order edit.
 *
 * @property hooks.setPricingContext - This hook is executed before the shipping method's option is retrieved. You can consume this hook to return any custom context useful for the prices retrieval of shipping method's option.
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
 * import { updateOrderEditShippingMethodWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 *
 * updateOrderEditShippingMethodWorkflow.hooks.setPricingContext((
 *   { order, order_change, additional_data }, { container }
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
export declare const updateOrderEditShippingMethodWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.UpdateOrderEditShippingMethodWorkflowInput & AdditionalData, OrderPreviewDTO, [import("@medusajs/framework/workflows-sdk").Hook<"setPricingContext", {
    order: OrderDTO;
    order_change: OrderChangeDTO;
    additional_data: ((Record<string, unknown> | WorkflowData<Record<string, unknown> | undefined>) & Record<string, unknown>) | undefined;
}, Record<string, any> | undefined>]>;
//# sourceMappingURL=update-order-edit-shipping-method.d.ts.map