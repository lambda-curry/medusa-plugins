"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaults = void 0;
exports.defaults = ["id", "is_enabled"];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaults,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map