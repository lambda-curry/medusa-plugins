"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const lodash_1 = require("lodash");
const GET = async (req, res) => {
    const configModule = req.scope.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
    const configPlugins = configModule.plugins ?? [];
    const plugins = configPlugins.map((plugin) => ({
        name: (0, lodash_1.isString)(plugin) ? plugin : plugin.resolve,
    }));
    res.json({
        plugins,
    });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map