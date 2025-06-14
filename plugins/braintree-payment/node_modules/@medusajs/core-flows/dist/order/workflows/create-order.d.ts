import { AdditionalData, CreateOrderDTO } from "@medusajs/framework/types";
import { WorkflowData } from "@medusajs/framework/workflows-sdk";
/**
 * The data to create an order, along with custom data that's passed to the workflow's hooks.
 */
export type CreateOrderWorkflowInput = CreateOrderDTO & AdditionalData;
export declare const createOrdersWorkflowId = "create-orders";
/**
 * This workflow creates an order. It's used by the [Create Draft Order Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftorders), but
 * you can also use it to create any order.
 *
 * This workflow has a hook that allows you to perform custom actions on the created order. For example, you can pass under `additional_data` custom data that
 * allows you to create custom data models linked to the order.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around creating an order. For example,
 * you can create a workflow that imports orders from an external system, then uses this workflow to create the orders in Medusa.
 *
 * @example
 * const { result } = await createOrderWorkflow(container)
 * .run({
 *   input: {
 *     region_id: "reg_123",
 *     items: [
 *       {
 *         variant_id: "variant_123",
 *         quantity: 1,
 *         title: "Shirt",
 *         unit_price: 10
 *       }
 *     ],
 *     sales_channel_id: "sc_123",
 *     status: "pending",
 *     shipping_address: {
 *       first_name: "John",
 *       last_name: "Doe",
 *       address_1: "123 Main St",
 *       city: "Los Angeles",
 *       country_code: "us",
 *       postal_code: "90001"
 *     },
 *     additional_data: {
 *       sync_oms: true
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create an order.
 *
 * @property hooks.orderCreated - This hook is executed after the order is created. You can consume this hook to perform custom actions on the created order.
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
 * import { createOrderWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 *
 * createOrderWorkflow.hooks.setPricingContext((
 *   { variantIds, region, customerData, additional_data }, { container }
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
export declare const createOrderWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateOrderWorkflowInput, import("@medusajs/framework/types").OrderDTO, [import("@medusajs/framework/workflows-sdk").Hook<"orderCreated", {
    order: WorkflowData<import("@medusajs/framework/types").OrderDTO>;
    additional_data: ((Record<string, unknown> | WorkflowData<Record<string, unknown> | undefined>) & Record<string, unknown>) | undefined;
}, unknown>, import("@medusajs/framework/workflows-sdk").Hook<"setPricingContext", {
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
/**
 * @deprecated Instead use the singular name `createOrderWorkflow`.
 */
export declare const createOrdersWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateOrderWorkflowInput, import("@medusajs/framework/types").OrderDTO, [import("@medusajs/framework/workflows-sdk").Hook<"orderCreated", {
    order: WorkflowData<import("@medusajs/framework/types").OrderDTO>;
    additional_data: ((Record<string, unknown> | WorkflowData<Record<string, unknown> | undefined>) & Record<string, unknown>) | undefined;
}, unknown>, import("@medusajs/framework/workflows-sdk").Hook<"setPricingContext", {
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
//# sourceMappingURL=create-order.d.ts.map