"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDraftOrderStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
/**
 * This step validates that an order is a draft order. It throws an error otherwise.
 *
 * :::note
 *
 * You can retrieve a draft order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = validateDraftOrderStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   }
 * })
 */
exports.validateDraftOrderStep = (0, workflows_sdk_1.createStep)("validate-draft-order", async function ({ order }) {
    if (order.status !== utils_1.OrderStatus.DRAFT && !order.is_draft_order) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Order ${order.id} is not a draft order`);
    }
});
//# sourceMappingURL=validate-draft-order.js.map