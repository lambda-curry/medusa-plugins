"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDraftOrderChangeStep = exports.validateDraftOrderChangeStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const order_validation_1 = require("../../order/utils/order-validation");
const validation_1 = require("../utils/validation");
exports.validateDraftOrderChangeStepId = "validate-draft-order-change";
/**
 * This step validates that a draft order and its change are valid. It throws an error if the
 * order is not a draft order or the order change is not active.
 *
 * :::note
 *
 * You can retrieve a draft order and its change's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = validateDraftOrderChangeStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   }
 * })
 */
exports.validateDraftOrderChangeStep = (0, workflows_sdk_1.createStep)(exports.validateDraftOrderChangeStepId, async function ({ order, orderChange }) {
    (0, validation_1.throwIfNotDraftOrder)({ order });
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
});
//# sourceMappingURL=validate-draft-order-change.js.map