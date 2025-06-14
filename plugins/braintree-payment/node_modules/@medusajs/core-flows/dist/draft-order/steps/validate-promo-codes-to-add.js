"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePromoCodesToAddStep = exports.validatePromoCodesToAddId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const validation_1 = require("../utils/validation");
exports.validatePromoCodesToAddId = "validate-promo-codes-to-add";
/**
 * This step validates that the promo codes to add to a draft order are valid. It throws an error if the
 * promo codes don't exist or are inactive.
 *
 * :::note
 *
 * You can retrieve a promotion's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = validatePromoCodesToAddStep({
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
exports.validatePromoCodesToAddStep = (0, workflows_sdk_1.createStep)(exports.validatePromoCodesToAddId, async function (input) {
    const { promo_codes, promotions } = input;
    (0, validation_1.throwIfCodesAreMissing)(promo_codes, promotions);
    (0, validation_1.throwIfCodesAreInactive)(promo_codes, promotions);
});
//# sourceMappingURL=validate-promo-codes-to-add.js.map