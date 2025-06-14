"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDraftOrderLineItemAdjustmentsStep = exports.removeDraftOrderLineItemAdjustmentsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.removeDraftOrderLineItemAdjustmentsStepId = "remove-draft-order-line-item-adjustments";
/**
 * This step removes line item adjustments from a draft order.
 *
 * @example
 * const data = removeDraftOrderLineItemAdjustmentsStep({
 *   lineItemAdjustmentIdsToRemove: ["adj_123", "adj_456"],
 * })
 */
exports.removeDraftOrderLineItemAdjustmentsStep = (0, workflows_sdk_1.createStep)(exports.removeDraftOrderLineItemAdjustmentsStepId, async function (data, { container }) {
    const { lineItemAdjustmentIdsToRemove = [] } = data;
    if (!lineItemAdjustmentIdsToRemove?.length) {
        return new workflows_sdk_1.StepResponse(void 0, []);
    }
    const draftOrderModuleService = container.resolve(utils_1.Modules.ORDER);
    await draftOrderModuleService.deleteOrderLineItemAdjustments(lineItemAdjustmentIdsToRemove);
    return new workflows_sdk_1.StepResponse(void 0, lineItemAdjustmentIdsToRemove);
}, async function (lineItemAdjustmentIdsToRemove, { container }) {
    const draftOrderModuleService = container.resolve(utils_1.Modules.ORDER);
    if (!lineItemAdjustmentIdsToRemove?.length) {
        return;
    }
    await draftOrderModuleService.restoreOrderLineItemAdjustments(lineItemAdjustmentIdsToRemove);
});
//# sourceMappingURL=remove-draft-order-line-item-adjustments.js.map