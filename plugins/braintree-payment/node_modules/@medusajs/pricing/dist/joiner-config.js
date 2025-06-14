"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinerConfig = void 0;
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("./models");
exports.joinerConfig = (0, utils_1.defineJoinerConfig)(utils_1.Modules.PRICING, {
    models: [_models_1.PriceSet, _models_1.PriceList, _models_1.Price, _models_1.PricePreference],
});
//# sourceMappingURL=joiner-config.js.map