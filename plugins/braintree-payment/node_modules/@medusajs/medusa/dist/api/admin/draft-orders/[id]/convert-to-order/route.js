"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    await (0, core_flows_1.convertDraftOrderWorkflow)(req.scope).run({
        input: {
            id: req.params.id,
        },
    });
    const result = await query.graph({
        entity: "orders",
        filters: { id: req.params.id },
        fields: req.queryConfig.fields,
    });
    res.status(200).json({ order: result.data[0] });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map