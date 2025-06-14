"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReturnReasonsWorkflow = exports.deleteReturnReasonsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const steps_1 = require("../steps");
exports.deleteReturnReasonsWorkflowId = "delete-return-reasons";
/**
 * This workflow deletes one or more return reasons. It's used by the
 * [Delete Return Reasons Admin API Route](https://docs.medusajs.com/api/admin#return-reasons_deletereturnreasonsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete return reasons within your custom flows.
 *
 * @example
 * const { result } = await deleteReturnReasonsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["rr_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete return reasons.
 */
exports.deleteReturnReasonsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteReturnReasonsWorkflowId, (input) => {
    const deletedReturnReasons = (0, steps_1.deleteReturnReasonStep)(input.ids);
    (0, common_1.removeRemoteLinkStep)({
        [utils_1.Modules.ORDER]: {
            return_reason_id: input.ids,
        },
    });
    return deletedReturnReasons;
});
//# sourceMappingURL=delete-return-reasons.js.map