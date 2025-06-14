import { AdditionalData, UpdateLineItemInCartWorkflowInputDTO } from "@medusajs/framework/types";
import { WorkflowData } from "@medusajs/framework/workflows-sdk";
export declare const updateLineItemInCartWorkflowId = "update-line-item-in-cart";
/**
 * This workflow updates a line item's details in a cart. You can update the line item's quantity, unit price, and more. This workflow is executed
 * by the [Update Line Item Store API Route](https://docs.medusajs.com/api/store#carts_postcartsidlineitemsline_id).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to update a line item's details in your custom flows.
 *
 * @example
 * const { result } = await updateLineItemInCartWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     item_id: "item_123",
 *     update: {
 *       quantity: 2
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update a cart's line item.
 *
 * @property hooks.validate - This hook is executed before all operations. You can consume this hook to perform any custom validation. If validation fails, you can throw an error to stop the workflow execution.
 * @property hooks.setPricingContext - This hook is executed before the cart is updated. You can consume this hook to return any custom context useful for the prices retrieval of the line item's variant.
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
 * The variant's prices will now be retrieved using the context you return.
 *
 * :::note
 *
 * Learn more about prices calculation context in the [Prices Calculation](https://docs.medusajs.com/resources/commerce-modules/pricing/price-calculation) documentation.
 *
 * :::
 */
export declare const updateLineItemInCartWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpdateLineItemInCartWorkflowInputDTO & AdditionalData, undefined, [import("@medusajs/framework/workflows-sdk").Hook<"validate", {
    input: WorkflowData<UpdateLineItemInCartWorkflowInputDTO & AdditionalData>;
    cart: any;
}, unknown>, import("@medusajs/framework/workflows-sdk").Hook<"setPricingContext", {
    cart: any;
    item: any;
    variantIds: WorkflowData<any[]>;
    additional_data: ((Record<string, unknown> | WorkflowData<Record<string, unknown> | undefined>) & Record<string, unknown>) | undefined;
}, Record<string, any> | undefined>]>;
//# sourceMappingURL=update-line-item-in-cart.d.ts.map