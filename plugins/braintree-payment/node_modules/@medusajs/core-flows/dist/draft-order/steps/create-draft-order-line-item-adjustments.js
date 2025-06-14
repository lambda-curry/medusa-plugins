"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDraftOrderLineItemAdjustmentsStep = exports.createDraftOrderLineItemAdjustmentsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createDraftOrderLineItemAdjustmentsStepId = "create-draft-order-line-item-adjustments";
/**
 * This step creates line item adjustments for a draft order.
 *
 * @example
 * const data = createDraftOrderLineItemAdjustmentsStep({
 *   order_id: "order_123",
 *   lineItemAdjustmentsToCreate: [
 *     {
 *       item_id: "orli_123",
 *       code: "PROMO_123",
 *       amount: 10,
 *     }
 *   ]
 * })
 */
exports.createDraftOrderLineItemAdjustmentsStep = (0, workflows_sdk_1.createStep)(exports.createDraftOrderLineItemAdjustmentsStepId, async function (data, { container }) {
    const { lineItemAdjustmentsToCreate = [], order_id } = data;
    if (!lineItemAdjustmentsToCreate?.length) {
        return new workflows_sdk_1.StepResponse(void 0, []);
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    /**
     * If an items quantity has been changed to 0, it will result in an undefined amount.
     * In this case, we don't want to create an adjustment, as the item will be removed,
     * and trying to create an adjustment will throw an error.
     */
    const filteredAdjustments = lineItemAdjustmentsToCreate.filter((adjustment) => {
        return !!adjustment.amount;
    });
    const lineItemAdjustments = await service.createOrderLineItemAdjustments(filteredAdjustments.map((adjustment) => ({
        ...adjustment,
        order_id,
    })));
    const createdLineItemAdjustments = lineItemAdjustments.map((adjustment) => adjustment.id);
    return new workflows_sdk_1.StepResponse(createdLineItemAdjustments, createdLineItemAdjustments);
}, async function (createdLineItemAdjustments, { container }) {
    const service = container.resolve(utils_1.Modules.ORDER);
    if (!createdLineItemAdjustments?.length) {
        return;
    }
    await service.deleteOrderLineItemAdjustments(createdLineItemAdjustments);
});
//# sourceMappingURL=create-draft-order-line-item-adjustments.js.map