"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDraftOrderRemoveActionItemStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
/**
 * This step validates that an item change can be removed from a draft order edit. It throws an error if the
 * item change is not in the draft order edit, or if the item change is not adding or updating an item.
 *
 * :::note
 *
 * You can retrieve a draft order change's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = validateDraftOrderRemoveActionItemStep({
 *   input: {
 *     action_id: "action_123",
 *     order_id: "order_123",
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   }
 * })
 */
exports.validateDraftOrderRemoveActionItemStep = (0, workflows_sdk_1.createStep)("validate-draft-order-remove-action-item", async function ({ input, orderChange, }) {
    const associatedAction = (orderChange.actions ?? []).find((a) => a.id === input.action_id);
    if (!associatedAction) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `No item found for order ${input.order_id} in order change ${orderChange.id}`);
    }
    if (![utils_1.ChangeActionType.ITEM_ADD, utils_1.ChangeActionType.ITEM_UPDATE].includes(associatedAction.action)) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Action ${associatedAction.id} is not adding or updating an item`);
    }
});
//# sourceMappingURL=validate-draft-order-remove-action-item.js.map