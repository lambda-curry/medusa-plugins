"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLineItemInCartWorkflow = exports.updateLineItemInCartWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const emit_event_1 = require("../../common/steps/emit-event");
const use_remote_query_1 = require("../../common/steps/use-remote-query");
const steps_1 = require("../../line-item/steps");
const validate_cart_1 = require("../steps/validate-cart");
const validate_variant_prices_1 = require("../steps/validate-variant-prices");
const fields_1 = require("../utils/fields");
const confirm_variant_inventory_1 = require("./confirm-variant-inventory");
const refresh_cart_items_1 = require("./refresh-cart-items");
const schemas_1 = require("../utils/schemas");
const cartFields = fields_1.cartFieldsForPricingContext.concat(["items.*"]);
exports.updateLineItemInCartWorkflowId = "update-line-item-in-cart";
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
exports.updateLineItemInCartWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateLineItemInCartWorkflowId, (input) => {
    const cartQuery = (0, common_1.useQueryGraphStep)({
        entity: "cart",
        filters: { id: input.cart_id },
        fields: cartFields,
        options: { throwIfKeyNotFound: true },
    }).config({ name: "get-cart" });
    const cart = (0, workflows_sdk_1.transform)({ cartQuery }, ({ cartQuery }) => cartQuery.data[0]);
    const item = (0, workflows_sdk_1.transform)({ cart, input }, ({ cart, input }) => {
        return cart.items.find((i) => i.id === input.item_id);
    });
    (0, validate_cart_1.validateCartStep)({ cart });
    const validate = (0, workflows_sdk_1.createHook)("validate", {
        input,
        cart,
    });
    const variantIds = (0, workflows_sdk_1.transform)({ item }, ({ item }) => {
        return [item.variant_id].filter(Boolean);
    });
    const setPricingContext = (0, workflows_sdk_1.createHook)("setPricingContext", {
        cart,
        item,
        variantIds,
        additional_data: input.additional_data,
    }, {
        resultValidator: schemas_1.pricingContextResult,
    });
    const setPricingContextResult = setPricingContext.getResult();
    const pricingContext = (0, workflows_sdk_1.transform)({ cart, setPricingContextResult }, (data) => {
        return {
            ...data.cart,
            ...(data.setPricingContextResult ? data.setPricingContextResult : {}),
            currency_code: data.cart.currency_code,
            region_id: data.cart.region_id,
            region: data.cart.region,
            customer_id: data.cart.customer_id,
            customer: data.cart.customer,
        };
    });
    const variants = (0, workflows_sdk_1.when)({ variantIds }, ({ variantIds }) => {
        return !!variantIds.length;
    }).then(() => {
        return (0, use_remote_query_1.useRemoteQueryStep)({
            entry_point: "variants",
            fields: fields_1.productVariantsFields,
            variables: {
                id: variantIds,
                calculated_price: {
                    context: pricingContext,
                },
            },
        }).config({ name: "fetch-variants" });
    });
    (0, validate_variant_prices_1.validateVariantPricesStep)({ variants });
    const items = (0, workflows_sdk_1.transform)({ input, item }, (data) => {
        return [
            Object.assign(data.item, { quantity: data.input.update.quantity }),
        ];
    });
    confirm_variant_inventory_1.confirmVariantInventoryWorkflow.runAsStep({
        input: {
            sales_channel_id: pricingContext.sales_channel_id,
            variants,
            items,
        },
    });
    const lineItemUpdate = (0, workflows_sdk_1.transform)({ input, variants, item }, (data) => {
        const variant = data.variants?.[0] ?? undefined;
        const item = data.item;
        const updateData = {
            ...data.input.update,
            unit_price: (0, utils_1.isDefined)(data.input.update.unit_price)
                ? data.input.update.unit_price
                : item.unit_price,
            is_custom_price: (0, utils_1.isDefined)(data.input.update.unit_price)
                ? true
                : item.is_custom_price,
            is_tax_inclusive: item.is_tax_inclusive ||
                variant?.calculated_price?.is_calculated_price_tax_inclusive,
        };
        if (variant && !updateData.is_custom_price) {
            updateData.unit_price = variant.calculated_price.calculated_amount;
        }
        if (!(0, utils_1.isDefined)(updateData.unit_price)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Line item ${item.title} has no unit price`);
        }
        return {
            data: updateData,
            selector: {
                id: data.input.item_id,
            },
        };
    });
    (0, steps_1.updateLineItemsStepWithSelector)(lineItemUpdate);
    refresh_cart_items_1.refreshCartItemsWorkflow.runAsStep({
        input: { cart_id: input.cart_id },
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.CartWorkflowEvents.UPDATED,
        data: { id: input.cart_id },
    });
    return new workflows_sdk_1.WorkflowResponse(void 0, {
        hooks: [validate, setPricingContext],
    });
});
//# sourceMappingURL=update-line-item-in-cart.js.map