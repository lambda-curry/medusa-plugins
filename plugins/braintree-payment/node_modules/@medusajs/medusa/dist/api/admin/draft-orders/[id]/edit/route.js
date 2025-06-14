"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const POST = async (req, res) => {
    const { id } = req.params;
    const { result } = await (0, core_flows_1.beginDraftOrderEditWorkflow)(req.scope).run({
        input: {
            order_id: id,
        },
    });
    res.json({
        draft_order_preview: result,
    });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const { id } = req.params;
    await (0, core_flows_1.cancelDraftOrderEditWorkflow)(req.scope).run({
        input: {
            order_id: id,
        },
    });
    res.status(200).json({
        id,
        object: "draft-order-edit",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map