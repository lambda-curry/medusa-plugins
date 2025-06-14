"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStoresWorkflow = exports.deleteStoresWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const remove_remote_links_1 = require("../../common/steps/remove-remote-links");
const steps_1 = require("../steps");
exports.deleteStoresWorkflowId = "delete-stores";
/**
 * This workflow deletes one or more stores.
 *
 * :::note
 *
 * By default, Medusa uses a single store. This is useful
 * if you're building a multi-tenant application or a marketplace where each tenant has its own store.
 * If you delete the only store in your application, the Medusa application will re-create it on application start-up.
 *
 * :::
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete stores within your custom flows.
 *
 * @example
 * const { result } = await deleteStoresWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["store_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more stores.
 */
exports.deleteStoresWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteStoresWorkflowId, (input) => {
    const deletedStores = (0, steps_1.deleteStoresStep)(input.ids);
    (0, remove_remote_links_1.removeRemoteLinkStep)({
        [utils_1.Modules.STORE]: {
            store_id: input.ids,
        },
    });
    return deletedStores;
});
//# sourceMappingURL=delete-stores.js.map