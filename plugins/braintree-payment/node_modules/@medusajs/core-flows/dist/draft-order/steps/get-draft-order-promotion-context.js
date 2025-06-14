"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDraftOrderPromotionContextStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
/**
 * This step gets the promotion context for a draft order.
 *
 * :::note
 *
 * You can retrieve a draft order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = getDraftOrderPromotionContextStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   }
 * })
 */
exports.getDraftOrderPromotionContextStep = (0, workflows_sdk_1.createStep)("get-draft-order-promotion-context", async ({ order }, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const preview = await service.previewOrderChange(order.id);
    const orderWithPreviewItemsAndAShipping = {
        ...order,
        items: preview.items,
        shipping_methods: preview.shipping_methods,
    };
    return new workflows_sdk_1.StepResponse(orderWithPreviewItemsAndAShipping);
});
//# sourceMappingURL=get-draft-order-promotion-context.js.map