"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePriceListsWorkflow = exports.deletePriceListsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const remove_remote_links_1 = require("../../common/steps/remove-remote-links");
const steps_1 = require("../steps");
exports.deletePriceListsWorkflowId = "delete-price-lists";
/**
 * This workflow deletes one or more price lists. It's used by the
 * [Delete Price List Admin API Route](https://docs.medusajs.com/api/admin#price-lists_deletepricelistsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete price lists in your custom flows.
 *
 * @example
 * const { result } = await deletePriceListsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["plist_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more price lists.
 */
exports.deletePriceListsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deletePriceListsWorkflowId, (input) => {
    const deletedPriceLists = (0, steps_1.deletePriceListsStep)(input.ids);
    (0, remove_remote_links_1.removeRemoteLinkStep)({
        [utils_1.Modules.PRICING]: {
            price_list_id: input.ids,
        },
    });
    return deletedPriceLists;
});
//# sourceMappingURL=delete-price-lists.js.map