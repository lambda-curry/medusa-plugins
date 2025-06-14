import { AdditionalData, BigNumberInput, OrderChangeDTO, OrderDTO, OrderPreviewDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a shipping method can be created for an order edit.
 */
export type CreateOrderEditShippingMethodValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
};
/**
 * This step validates that a shipping method can be created for an order edit.
 * If the order is canceled or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = createOrderEditShippingMethodValidationStep({
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
export declare const createOrderEditShippingMethodValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateOrderEditShippingMethodValidationStepInput, unknown>;
/**
 * The data to create a shipping method for an order edit.
 */
export type CreateOrderEditShippingMethodWorkflowInput = {
    /**
     * The ID of the order to create the shipping method for.
     */
    order_id: string;
    /**
     * The ID of the shipping option to create the shipping method from.
     */
    shipping_option_id: string;
    /**
     * The custom amount to create the shipping method with.
     * If not provided, the shipping option's amount is used.
     */
    custom_amount?: BigNumberInput | null;
};
export declare const createOrderEditShippingMethodWorkflowId = "create-order-edit-shipping-method";
/**
 * This workflow creates a shipping method for an order edit. It's used by the
 * [Add Shipping Method API Route](https://docs.medusajs.com/api/admin#order-edits_postordereditsidshippingmethod).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to create a shipping method
 * for an order edit in your in your own custom flows.
 *
 * @example
 * const { result } = await createOrderEditShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     shipping_option_id: "so_123",
 *   }
 * })
 *
 * @summary
 *
 * Create a shipping method for an order edit.
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
 * import { createOrderEditShippingMethodWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 *
 * createOrderEditShippingMethodWorkflow.hooks.setPricingContext((
 *   { order, shipping_option_id, additional_data }, { container }
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
export declare const createOrderEditShippingMethodWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateOrderEditShippingMethodWorkflowInput & AdditionalData, OrderPreviewDTO, [import("@medusajs/framework/workflows-sdk").Hook<"setPricingContext", {
    order: OrderDTO;
    shipping_option_id: string;
    additional_data: Record<string, unknown> | undefined;
}, Record<string, any> | undefined>]>;
//# sourceMappingURL=create-order-edit-shipping-method.d.ts.map