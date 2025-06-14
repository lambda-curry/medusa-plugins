"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDraftOrderShippingMethodAdjustmentsStep = exports.createDraftOrderShippingMethodAdjustmentsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createDraftOrderShippingMethodAdjustmentsStepId = "create-draft-order-shipping-method-adjustments";
/**
 * This step creates shipping method adjustments for a draft order.
 *
 * @example
 * const data = createDraftOrderShippingMethodAdjustmentsStep({
 *   shippingMethodAdjustmentsToCreate: [
 *     {
 *       shipping_method_id: "sm_123",
 *       code: "PROMO_123",
 *       amount: 10,
 *     }
 *   ]
 * })
 */
exports.createDraftOrderShippingMethodAdjustmentsStep = (0, workflows_sdk_1.createStep)(exports.createDraftOrderShippingMethodAdjustmentsStepId, async function (data, { container }) {
    const { shippingMethodAdjustmentsToCreate = [] } = data;
    if (!shippingMethodAdjustmentsToCreate?.length) {
        return new workflows_sdk_1.StepResponse(void 0, []);
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    const shippingMethodAdjustments = await service.createOrderShippingMethodAdjustments(shippingMethodAdjustmentsToCreate);
    const createdShippingMethodAdjustments = shippingMethodAdjustments.map((adjustment) => adjustment.id);
    return new workflows_sdk_1.StepResponse(createdShippingMethodAdjustments, createdShippingMethodAdjustments);
}, async function (createdShippingMethodAdjustments, { container }) {
    const service = container.resolve(utils_1.Modules.ORDER);
    if (!createdShippingMethodAdjustments?.length) {
        return;
    }
    await service.deleteOrderShippingMethodAdjustments(createdShippingMethodAdjustments);
});
//# sourceMappingURL=create-draft-order-shipping-method-adjustments.js.map