"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreDraftOrderShippingMethodsStep = exports.restoreDraftOrderShippingMethodsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.restoreDraftOrderShippingMethodsStepId = "restore-draft-order-shipping-methods";
/**
 * This step restores the shipping methods of a draft order.
 * It's useful when you need to revert changes made by a canceled draft order edit.
 *
 * @example
 * const data = restoreDraftOrderShippingMethodsStep({
 *   shippingMethods: [
 *     {
 *       id: "shipping_method_123",
 *       before: {
 *         shipping_option_id: "shipping_option_123",
 *         amount: 10
 *       },
 *       after: {
 *         shipping_option_id: "shipping_option_123",
 *         amount: 10
 *       }
 *     },
 *   ],
 * })
 */
exports.restoreDraftOrderShippingMethodsStep = (0, workflows_sdk_1.createStep)(exports.restoreDraftOrderShippingMethodsStepId, async function (input, { container }) {
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.updateOrderShippingMethods(input.shippingMethods.map(({ id, before }) => ({
        id,
        shipping_option_id: before.shipping_option_id,
        amount: before.amount,
    })));
    return new workflows_sdk_1.StepResponse(void 0, input.shippingMethods);
}, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    if (!input) {
        return;
    }
    await service.updateOrderShippingMethods(input.map(({ id, after }) => ({
        id,
        shipping_option_id: after.shipping_option_id,
        amount: after.amount,
    })));
});
//# sourceMappingURL=restore-draft-order-shipping-methods.js.map