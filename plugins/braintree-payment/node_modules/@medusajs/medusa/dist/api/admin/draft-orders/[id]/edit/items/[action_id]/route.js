"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const POST = async (req, res) => {
    const { id, action_id } = req.params;
    const { result } = await (0, core_flows_1.updateDraftOrderActionItemWorkflow)(req.scope).run({
        input: {
            data: req.validatedBody,
            order_id: id,
            action_id,
        },
    });
    res.json({
        draft_order_preview: result,
    });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const { id, action_id } = req.params;
    const { result } = await (0, core_flows_1.removeDraftOrderActionItemWorkflow)(req.scope).run({
        input: {
            order_id: id,
            action_id,
        },
    });
    res.json({
        draft_order_preview: result,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map