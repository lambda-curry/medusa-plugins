"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePromoCodesToRemoveStep = exports.validatePromoCodesToRemoveId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const validation_1 = require("../utils/validation");
exports.validatePromoCodesToRemoveId = "validate-promo-codes-to-remove";
/**
 * This step validates that the promo codes can be removed from a draft order. It throws an error if the promo
 * codes don't exist.
 *
 * :::note
 *
 * You can retrieve a promotion's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = validatePromoCodesToRemoveStep({
 *   promo_codes: ["PROMO_123", "PROMO_456"],
 *   promotions: [{
 *     id: "promo_123",
 *     code: "PROMO_123"
 *   }, {
 *     id: "promo_456",
 *     code: "PROMO_456"
 *   }],
 * })
 */
exports.validatePromoCodesToRemoveStep = (0, workflows_sdk_1.createStep)(exports.validatePromoCodesToRemoveId, async function (input) {
    const { promo_codes, promotions } = input;
    (0, validation_1.throwIfCodesAreMissing)(promo_codes, promotions);
});
//# sourceMappingURL=validate-promo-codes-to-remove.js.map