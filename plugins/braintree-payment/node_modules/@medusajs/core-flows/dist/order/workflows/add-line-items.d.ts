import { AdditionalData, OrderLineItemDTO, OrderWorkflow } from "@medusajs/framework/types";
import { WorkflowData } from "@medusajs/framework/workflows-sdk";
/**
 * The created order line items.
 */
export type OrderAddLineItemWorkflowOutput = OrderLineItemDTO[];
export declare const addOrderLineItemsWorkflowId = "order-add-line-items";
/**
 * This workflow adds line items to an order. This is useful when making edits to
 * an order. It's used by other workflows, such as {@link orderEditAddNewItemWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around adding items to
 * an order.
 *
 * @example
 * const { result } = await addOrderLineItemsWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     items: [
 *       {
 *         variant_id: "variant_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Add line items to an order.
 *
 * @property hooks.setPricingContext - This hook is executed after the order is retrieved and before the line items are created. You can consume this hook to return any custom context useful for the prices retrieval of the variants to be added to the order.
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
 * import { addOrderLineItemsWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 *
 * addOrderLineItemsWorkflow.hooks.setPricingContext((
 *   { order, variantIds, region, customerData, additional_data }, { container }
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
export declare const addOrderLineItemsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.OrderAddLineItemWorkflowInput & AdditionalData, OrderLineItemDTO[], [import("@medusajs/framework/workflows-sdk").Hook<"setPricingContext", {
    order: any;
    variantIds: WorkflowData<string[]>;
    region: {
        id: string | WorkflowData<string>;
        name: string | WorkflowData<string>;
        currency_code: string | WorkflowData<string>;
        automatic_taxes: boolean | WorkflowData<boolean>;
        countries: import("@medusajs/framework/types").RegionCountryDTO[] | WorkflowData<import("@medusajs/framework/types").RegionCountryDTO[]>;
        payment_providers: import("@medusajs/framework/types").PaymentProviderDTO[] | WorkflowData<import("@medusajs/framework/types").PaymentProviderDTO[]>;
        metadata?: Record<string, any> | WorkflowData<Record<string, any> | undefined> | undefined;
        created_at: string | WorkflowData<string>;
        updated_at: string | WorkflowData<string>;
    } & import("@medusajs/framework/types").RegionDTO & import("@medusajs/framework/workflows-sdk").WorkflowDataProperties<import("@medusajs/framework/types").RegionDTO | null> & {
        config(config: {
            name?: string;
        } & Omit<import("@medusajs/orchestration").TransactionStepsDefinition, "next" | "uuid" | "action">): WorkflowData<import("@medusajs/framework/types").RegionDTO | null>;
    } & import("@medusajs/framework/workflows-sdk").StepFunctionReturnConfig<import("@medusajs/framework/types").RegionDTO | null>;
    customerData: {
        customer?: import("@medusajs/framework/types").CustomerDTO | WorkflowData<import("@medusajs/framework/types").CustomerDTO | null | undefined> | null | undefined;
        email?: string | WorkflowData<string | null | undefined> | null | undefined;
    } & import("../../cart/steps/find-or-create-customer").FindOrCreateCustomerOutputStepOutput & import("@medusajs/framework/workflows-sdk").WorkflowDataProperties<import("../../cart/steps/find-or-create-customer").FindOrCreateCustomerOutputStepOutput> & {
        config(config: {
            name?: string;
        } & Omit<import("@medusajs/orchestration").TransactionStepsDefinition, "next" | "uuid" | "action">): WorkflowData<import("../../cart/steps/find-or-create-customer").FindOrCreateCustomerOutputStepOutput>;
    } & import("@medusajs/framework/workflows-sdk").StepFunctionReturnConfig<import("../../cart/steps/find-or-create-customer").FindOrCreateCustomerOutputStepOutput>;
    additional_data: ((Record<string, unknown> | WorkflowData<Record<string, unknown> | undefined>) & Record<string, unknown>) | undefined;
}, Record<string, any> | undefined>]>;
//# sourceMappingURL=add-line-items.d.ts.map