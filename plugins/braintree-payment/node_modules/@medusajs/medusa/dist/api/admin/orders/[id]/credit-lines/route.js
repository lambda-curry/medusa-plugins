"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { id } = req.params;
    await (0, core_flows_1.createOrderCreditLinesWorkflow)(req.scope).run({
        input: { credit_lines: [req.validatedBody], id },
    });
    const { data: [order], } = await query.graph({
        entity: "orders",
        fields: req.queryConfig.fields,
        filters: { id },
    }, { throwIfKeyNotFound: true });
    res.status(200).json({ order });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map