import { OrderDTO, ReturnDTO, OrderWorkflow, AdditionalData } from "@medusajs/framework/types";
import { WorkflowData } from "@medusajs/framework/workflows-sdk";
/**
 * The data to validate that a return can be created and completed.
 */
export type CreateCompleteReturnValidationStepInput = {
    /**
     * The order's details.
     */
    order: any;
    /**
     * The data to create a return.
     */
    input: OrderWorkflow.CreateOrderReturnWorkflowInput;
};
/**
 * This step validates that a return can be created and completed for an order.
 * If the order is canceled, the items do not exist in the order,
 * the return reasons are invalid, or the refund amount is greater than the order total,
 * the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = createCompleteReturnValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   input: {
 *     order_id: "order_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 */
export declare const createCompleteReturnValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateCompleteReturnValidationStepInput, unknown>;
export declare const createAndCompleteReturnOrderWorkflowId = "create-complete-return-order";
/**
 * This workflow creates and completes a return from the storefront. The admin would receive the return and
 * process it from the dashboard. This workflow is used by the
 * [Create Return Store API Route](https://docs.medusajs.com/api/store#return_postreturn).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to create a return
 * for an order in your custom flow.
 *
 * @example
 * const { result } = await createAndCompleteReturnOrderWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create and complete a return for an order.
 *
 * @property hooks.setPricingContext - This hook is executed before the return's shipping method is created. You can consume this hook to return any custom context useful for the prices retrieval of the shipping method's option.
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
 * import { createAndCompleteReturnOrderWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 *
 * createAndCompleteReturnOrderWorkflow.hooks.setPricingContext((
 *   { order, additional_data }, { container }
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
export declare const createAndCompleteReturnOrderWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.CreateOrderReturnWorkflowInput & AdditionalData, ReturnDTO, [import("@medusajs/framework/workflows-sdk").Hook<"setPricingContext", {
    order: OrderDTO;
    additional_data: ((Record<string, unknown> | WorkflowData<Record<string, unknown> | undefined>) & Record<string, unknown>) | undefined;
}, Record<string, any> | undefined>]>;
//# sourceMappingURL=create-complete-return.d.ts.map