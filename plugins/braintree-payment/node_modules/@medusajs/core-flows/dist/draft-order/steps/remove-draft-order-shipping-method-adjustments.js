"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDraftOrderShippingMethodAdjustmentsStep = exports.removeDraftOrderShippingMethodAdjustmentsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.removeDraftOrderShippingMethodAdjustmentsStepId = "remove-draft-order-shipping-method-adjustments";
/**
 * This step removes shipping method adjustments from a draft order.
 *
 * @example
 * const data = removeDraftOrderShippingMethodAdjustmentsStep({
 *   shippingMethodAdjustmentIdsToRemove: ["adj_123", "adj_456"],
 * })
 */
exports.removeDraftOrderShippingMethodAdjustmentsStep = (0, workflows_sdk_1.createStep)(exports.removeDraftOrderShippingMethodAdjustmentsStepId, async function (data, { container }) {
    const { shippingMethodAdjustmentIdsToRemove = [] } = data;
    if (!shippingMethodAdjustmentIdsToRemove?.length) {
        return new workflows_sdk_1.StepResponse(void 0, []);
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.deleteOrderShippingMethodAdjustments(shippingMethodAdjustmentIdsToRemove);
    return new workflows_sdk_1.StepResponse(void 0, shippingMethodAdjustmentIdsToRemove);
}, async function (shippingMethodAdjustmentIdsToRemove, { container }) {
    const service = container.resolve(utils_1.Modules.ORDER);
    if (!shippingMethodAdjustmentIdsToRemove?.length) {
        return;
    }
    await service.restoreOrderShippingMethodAdjustments(shippingMethodAdjustmentIdsToRemove);
});
//# sourceMappingURL=remove-draft-order-shipping-method-adjustments.js.map