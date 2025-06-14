"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
/**
 * @version 2.8.0
 */
const GET = async (req, res) => {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const result = await query.graph({
        entity: "tax_providers",
        filters: req.filterableFields,
        pagination: req.queryConfig.pagination,
        fields: req.queryConfig.fields,
    });
    res.status(200).json({
        tax_providers: result.data,
        count: result.metadata?.count ?? 0,
        offset: result.metadata?.skip ?? 0,
        limit: result.metadata?.take ?? 0,
    });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map