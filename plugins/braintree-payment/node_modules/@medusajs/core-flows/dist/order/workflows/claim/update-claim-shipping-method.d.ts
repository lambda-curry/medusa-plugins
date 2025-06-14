import { AdditionalData, OrderChangeDTO, OrderClaimDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
import { WorkflowData } from "@medusajs/framework/workflows-sdk";
/**
 * The data to validate that a claim's shipping method can be updated.
 */
export type UpdateClaimShippingMethodValidationStepInput = {
    /**
     * The order claim's details.
     */
    orderClaim: OrderClaimDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The details of updating the shipping method.
     */
    input: Pick<OrderWorkflow.UpdateClaimShippingMethodWorkflowInput, "claim_id" | "action_id">;
};
/**
 * This step validates that a claim's shipping method can be updated.
 * If the claim is canceled, the order change is not active, the shipping method isn't added to the claim,
 * or the action is not adding a shipping method, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order claim and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = updateClaimShippingMethodValidationStep({
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderClaim: {
 *     id: "claim_123",
 *     // other order claim details...
 *   },
 *   input: {
 *     claim_id: "claim_123",
 *     action_id: "orchact_123",
 *   }
 * })
 */
export declare const updateClaimShippingMethodValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateClaimShippingMethodValidationStepInput, unknown>;
export declare const updateClaimShippingMethodWorkflowId = "update-claim-shipping-method";
/**
 * This workflow updates a claim's inbound (return) or outbound (delivery of new items) shipping method.
 * It's used by the [Update Inbound Shipping Admin API Route](https://docs.medusajs.com/api/admin#claims_postclaimsidinboundshippingmethodaction_id),
 * and the [Update Outbound Shipping Admin API Route](https://docs.medusajs.com/api/admin#claims_postclaimsidoutboundshippingmethodaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update a claim's shipping method
 * in your own custom flows.
 *
 * @example
 * const { result } = await updateClaimShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *     action_id: "orchact_123",
 *     data: {
 *       custom_amount: 10,
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update an inbound or outbound shipping method of a claim.
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
 * import { updateClaimShippingMethodWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 *
 * updateClaimShippingMethodWorkflow.hooks.setPricingContext((
 *   { order_claim, order_change, additional_data }, { container }
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
export declare const updateClaimShippingMethodWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.UpdateClaimShippingMethodWorkflowInput & AdditionalData, OrderPreviewDTO, [import("@medusajs/framework/workflows-sdk").Hook<"setPricingContext", {
    order_claim: OrderClaimDTO;
    order_change: OrderChangeDTO;
    additional_data: ((Record<string, unknown> | WorkflowData<Record<string, unknown> | undefined>) & Record<string, unknown>) | undefined;
}, Record<string, any> | undefined>]>;
//# sourceMappingURL=update-claim-shipping-method.d.ts.map