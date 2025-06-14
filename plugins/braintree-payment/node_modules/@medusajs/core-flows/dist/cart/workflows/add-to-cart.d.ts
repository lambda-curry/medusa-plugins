import { AdditionalData, AddToCartWorkflowInputDTO } from "@medusajs/framework/types";
import { WorkflowData } from "@medusajs/framework/workflows-sdk";
export declare const addToCartWorkflowId = "add-to-cart";
/**
 * This workflow adds a product variant to a cart as a line item. It's executed by the
 * [Add Line Item Store API Route](https://docs.medusajs.com/api/store#carts_postcartsidlineitems).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to wrap custom logic around adding an item to the cart.
 * For example, you can use this workflow to add a line item to the cart with a custom price.
 *
 * @example
 * const { result } = await addToCartWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     items: [
 *       {
 *         variant_id: "variant_123",
 *         quantity: 1,
 *       },
 *       {
 *         variant_id: "variant_456",
 *         quantity: 1,
 *         unit_price: 20
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Add a line item to a cart.
 *
 * @property hooks.validate - This hook is executed before all operations. You can consume this hook to perform any custom validation. If validation fails, you can throw an error to stop the workflow execution.
 * @property hooks.setPricingContext - This hook is executed after the cart is retrieved and before the line items are created. You can consume this hook to return any custom context useful for the prices retrieval of the variants to be added to the cart.
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
 * import { addToCartWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 *
 * addToCartWorkflow.hooks.setPricingContext((
 *   { cart, variantIds, items, additional_data }, { container }
 * ) => {
 *   return new StepResponse({
 *     location_id: "sloc_123", // Special price for in-store purchases
 *   });
 * });
 * ```
 *
 * The variants' prices will now be retrieved using the context you return.
 *
 * :::note
 *
 * Learn more about prices calculation context in the [Prices Calculation](https://docs.medusajs.com/resources/commerce-modules/pricing/price-calculation) documentation.
 *
 * :::
 */
export declare const addToCartWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<AddToCartWorkflowInputDTO & AdditionalData, undefined, [import("@medusajs/framework/workflows-sdk").Hook<"validate", {
    input: WorkflowData<AddToCartWorkflowInputDTO & AdditionalData>;
    cart: any;
}, unknown>, import("@medusajs/framework/workflows-sdk").Hook<"setPricingContext", {
    cart: any;
    variantIds: WorkflowData<(string | undefined)[]>;
    items: (import("@medusajs/framework/types").CreateCartCreateLineItemDTO[] | WorkflowData<import("@medusajs/framework/types").CreateCartCreateLineItemDTO[]>) & import("@medusajs/framework/types").CreateCartCreateLineItemDTO[];
    additional_data: ((Record<string, unknown> | WorkflowData<Record<string, unknown> | undefined>) & Record<string, unknown>) | undefined;
}, Record<string, any> | undefined>]>;
//# sourceMappingURL=add-to-cart.d.ts.map