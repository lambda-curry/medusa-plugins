"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePricePreferencesWorkflow = exports.deletePricePreferencesWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const remove_remote_links_1 = require("../../common/steps/remove-remote-links");
const steps_1 = require("../steps");
exports.deletePricePreferencesWorkflowId = "delete-price-preferences";
/**
 * This workflow deletes one or more price preferences. It's used by the
 * [Delete Price Preferences Admin API Route](https://docs.medusajs.com/api/admin#price-preferences_deletepricepreferencesid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete price preferences in your custom flows.
 *
 * @example
 * const { result } = await deletePricePreferencesWorkflow(container)
 * .run({
 *   input: ["pp_123"]
 * })
 *
 * @summary
 *
 * Delete one or more price preferences.
 */
exports.deletePricePreferencesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deletePricePreferencesWorkflowId, (input) => {
    const deletedPricePreferences = (0, steps_1.deletePricePreferencesStep)(input);
    (0, remove_remote_links_1.removeRemoteLinkStep)({
        [utils_1.Modules.PRICING]: {
            price_preference_id: input,
        },
    });
    return deletedPricePreferences;
});
//# sourceMappingURL=delete-price-preferences.js.map