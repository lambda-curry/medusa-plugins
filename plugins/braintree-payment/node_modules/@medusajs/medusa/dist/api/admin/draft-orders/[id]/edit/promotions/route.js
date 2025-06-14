"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const POST = async (req, res) => {
    const { id } = req.params;
    const { result } = await (0, core_flows_1.addDraftOrderPromotionWorkflow)(req.scope).run({
        input: {
            ...req.validatedBody,
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
    const { result } = await (0, core_flows_1.removeDraftOrderPromotionsWorkflow)(req.scope).run({
        input: {
            ...req.validatedBody,
            order_id: id,
        },
    });
    res.json({
        draft_order_preview: result,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map