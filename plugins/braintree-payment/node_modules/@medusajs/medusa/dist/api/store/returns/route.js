"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
/**
 * @version 2.8.0
 */
const POST = async (req, res) => {
    const input = req.validatedBody;
    const workflow = (0, core_flows_1.createAndCompleteReturnOrderWorkflow)(req.scope);
    const { result } = await workflow.run({
        input,
    });
    res.status(200).json({ return: result });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map