"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDraftOrderShippingMethodStep = exports.updateDraftOrderShippingMethodStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateDraftOrderShippingMethodStepId = "update-draft-order-shipping-method";
/**
 * This step updates the shipping method of a draft order.
 *
 * @example
 * const data = updateDraftOrderShippingMethodStep({
 *   order_id: "order_123",
 *   shipping_method_id: "sm_123",
 *   amount: 10,
 * })
 */
exports.updateDraftOrderShippingMethodStep = (0, workflows_sdk_1.createStep)(exports.updateDraftOrderShippingMethodStepId, async function (input, { container }) {
    const service = container.resolve(utils_1.Modules.ORDER);
    const [beforeUpdate] = await service.listOrderShippingMethods({
        id: input.shipping_method_id,
    }, {
        take: 1,
        select: ["id", "shipping_option_id", "amount"],
    });
    if (!beforeUpdate) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `A shipping method with id ${input.shipping_method_id} was not found`);
    }
    const [updatedMethod] = await service.updateOrderShippingMethods([
        {
            id: input.shipping_method_id,
            shipping_option_id: input.shipping_option_id,
            amount: input.amount,
        },
    ]);
    return new workflows_sdk_1.StepResponse({
        before: beforeUpdate,
        after: updatedMethod,
    }, beforeUpdate);
}, (input, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    if (!input) {
        return;
    }
    service.updateOrderShippingMethods([input]);
});
//# sourceMappingURL=update-draft-order-shipping-metod.js.map