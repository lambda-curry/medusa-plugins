import { AdditionalData, CreateCartWorkflowInputDTO } from "@medusajs/framework/types";
import { WorkflowData } from "@medusajs/framework/workflows-sdk";
/**
 * The data to create the cart, along with custom data that's passed to the workflow's hooks.
 */
export type CreateCartWorkflowInput = CreateCartWorkflowInputDTO & AdditionalData;
export declare const createCartWorkflowId = "create-cart";
/**
 * This workflow creates and returns a cart. You can set the cart's items, region, customer, and other details. This workflow is executed by the
 * [Create Cart Store API Route](https://docs.medusajs.com/api/store#carts_postcarts).
 *
 * This workflow has a hook that allows you to perform custom actions on the created cart. You can see an example in [this guide](https://docs.medusajs.com/resources/commerce-modules/cart/extend#step-4-consume-cartcreated-workflow-hook).
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around cart creation.
 *
 * @example
 * const { result } = await createCartWorkflow(container)
 *   .run({
 *     input: {
 *       region_id: "reg_123",
 *       items: [
 *         {
 *           variant_id: "var_123",
 *           quantity: 1,
 *         }
 *       ],
 *       customer_id: "cus_123",
 *       additional_data: {
 *         external_id: "123"
 *       }
 *     }
 *   })
 *
 * @summary
 *
 * Create a cart specifying region, items, and more.
 *
 * @property hooks.validate - This hook is executed before all operations. You can consume this hook to perform any custom validation. If validation fails, you can throw an error to stop the workflow execution.
 * @property hooks.cartCreated - This hook is executed after a cart is created. You can consume this hook to perform custom actions on the created cart.
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
 * import { createCartWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 *
 * createCartWorkflow.hooks.setPricingContext((
 *   { region, variantIds, salesChannel, customerData, additional_data }, { container }
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
export declare const createCartWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateCartWorkflowInput, import("@medusajs/framework/types").CartDTO, [import("@medusajs/framework/workflows-sdk").Hook<"validate", {
    input: WorkflowData<{
        currency_code: string;
        region_id: string;
        customer_id?: string;
        sales_channel_id?: string;
        email?: string;
        shipping_address_id?: string;
        billing_address_id?: string;
        shipping_address?: import("@medusajs/framework/types").CreateCartAddressDTO | string;
        billing_address?: import("@medusajs/framework/types").CreateCartAddressDTO | string;
        metadata?: Record<string, unknown>;
        items?: import("@medusajs/framework/types").CreateCartCreateLineItemDTO[];
        promo_codes?: string[];
        additional_data?: Record<string, unknown>;
    }>;
    cart: WorkflowData<{
        items: any[];
        currency_code: string;
        region_id: string;
        customer_id?: string;
        sales_channel_id?: string;
        email?: string;
        shipping_address_id?: string;
        billing_address_id?: string;
        shipping_address?: import("@medusajs/framework/types").CreateCartAddressDTO | string;
        billing_address?: import("@medusajs/framework/types").CreateCartAddressDTO | string;
        metadata?: Record<string, unknown>;
        promo_codes?: string[];
        additional_data?: Record<string, unknown>;
    }>;
}, unknown>, import("@medusajs/framework/workflows-sdk").Hook<"cartCreated", {
    cart: WorkflowData<import("@medusajs/framework/types").CartDTO>;
    additional_data: ((Record<string, unknown> | WorkflowData<Record<string, unknown> | undefined>) & Record<string, unknown>) | undefined;
}, unknown>, import("@medusajs/framework/workflows-sdk").Hook<"setPricingContext", {
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
    variantIds: WorkflowData<(string | undefined)[]>;
    salesChannel: {
        id: string | WorkflowData<string>;
        name: string | WorkflowData<string>;
        description: string | WorkflowData<string | null> | null;
        is_disabled: boolean | WorkflowData<boolean>;
        metadata: Record<string, unknown> | WorkflowData<Record<string, unknown> | null> | null;
        locations?: import("@medusajs/framework/types").SalesChannelLocationDTO[] | WorkflowData<import("@medusajs/framework/types").SalesChannelLocationDTO[] | undefined> | undefined;
    } & import("@medusajs/framework/types").SalesChannelDTO & import("@medusajs/framework/workflows-sdk").WorkflowDataProperties<import("@medusajs/framework/types").SalesChannelDTO | null> & {
        config(config: {
            name?: string;
        } & Omit<import("@medusajs/orchestration").TransactionStepsDefinition, "next" | "uuid" | "action">): WorkflowData<import("@medusajs/framework/types").SalesChannelDTO | null>;
    } & import("@medusajs/framework/workflows-sdk").StepFunctionReturnConfig<import("@medusajs/framework/types").SalesChannelDTO | null>;
    customerData: {
        customer?: import("@medusajs/framework/types").CustomerDTO | WorkflowData<import("@medusajs/framework/types").CustomerDTO | null | undefined> | null | undefined;
        email?: string | WorkflowData<string | null | undefined> | null | undefined;
    } & import("../steps").FindOrCreateCustomerOutputStepOutput & import("@medusajs/framework/workflows-sdk").WorkflowDataProperties<import("../steps").FindOrCreateCustomerOutputStepOutput> & {
        config(config: {
            name?: string;
        } & Omit<import("@medusajs/orchestration").TransactionStepsDefinition, "next" | "uuid" | "action">): WorkflowData<import("../steps").FindOrCreateCustomerOutputStepOutput>;
    } & import("@medusajs/framework/workflows-sdk").StepFunctionReturnConfig<import("../steps").FindOrCreateCustomerOutputStepOutput>;
    additional_data: ((Record<string, unknown> | WorkflowData<Record<string, unknown> | undefined>) & Record<string, unknown>) | undefined;
}, Record<string, any> | undefined>]>;
//# sourceMappingURL=create-carts.d.ts.map