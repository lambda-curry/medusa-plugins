import { AdditionalData, OrderChangeDTO, OrderExchangeDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
import { WorkflowData } from "@medusajs/framework/workflows-sdk";
/**
 * The data to validate that an exchange's shipping method can be updated.
 */
export type UpdateExchangeShippingMethodValidationStepInput = {
    /**
     * The order exchange's details.
     */
    orderExchange: OrderExchangeDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The details of the shipping method update.
     */
    input: Pick<OrderWorkflow.UpdateExchangeShippingMethodWorkflowInput, "exchange_id" | "action_id">;
};
/**
 * This step validates that an exchange's shipping method can be updated.
 * If the exchange is canceled, the order change is not active, the shipping method
 * doesn't exist in the exchange, or the action isn't adding a shipping method,
 * the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order exchange and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = updateExchangeShippingMethodValidationStep({
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderExchange: {
 *     id: "exchange_123",
 *     // other order exchange details...
 *   },
 *   input: {
 *     exchange_id: "exchange_123",
 *     action_id: "orchact_123",
 *     data: {
 *       custom_amount: 10,
 *     }
 *   }
 * })
 */
export declare const updateExchangeShippingMethodValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateExchangeShippingMethodValidationStepInput, unknown>;
export declare const updateExchangeShippingMethodWorkflowId = "update-exchange-shipping-method";
/**
 * This workflow updates an exchange's inbound or outbound shipping method. It's used by the
 * [Update Inbound Shipping Admin API Route](https://docs.medusajs.com/api/admin#exchanges_postexchangesidinboundshippingmethodaction_id)
 * or the [Outbound Inbound Shipping Admin API Route](https://docs.medusajs.com/api/admin#exchanges_postexchangesidoutboundshippingmethodaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update an exchange's
 * inbound or outbound shipping method in your custom flow.
 *
 * @example
 * const { result } = await updateExchangeShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     exchange_id: "exchange_123",
 *     action_id: "orchact_123",
 *     data: {
 *       custom_amount: 10,
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update an exchange's inbound or outbound shipping method.
 *
 * @property hooks.setPricingContext - This hook is executed before the shipping method is updated. You can consume this hook to return any custom context useful for the prices retrieval of the shipping method's option.
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
 * import { updateExchangeShippingMethodWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 *
 * updateExchangeShippingMethodWorkflow.hooks.setPricingContext((
 *   { order_exchange, order_change, additional_data }, { container }
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
export declare const updateExchangeShippingMethodWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.UpdateExchangeShippingMethodWorkflowInput & AdditionalData, OrderPreviewDTO, [import("@medusajs/framework/workflows-sdk").Hook<"setPricingContext", {
    order_exchange: OrderExchangeDTO;
    order_change: OrderChangeDTO;
    additional_data: ((Record<string, unknown> | WorkflowData<Record<string, unknown> | undefined>) & Record<string, unknown>) | undefined;
}, Record<string, any> | undefined>]>;
//# sourceMappingURL=update-exchange-shipping-method.d.ts.map