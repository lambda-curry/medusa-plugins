"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineMiddlewares = defineMiddlewares;
/**
 * A helper function to configure the routes by defining custom middleware,
 * bodyparser config and validators to be merged with the pre-existing
 * route validators.
 */
function defineMiddlewares(config) {
    const routes = Array.isArray(config) ? config : config.routes || [];
    const errorHandler = Array.isArray(config) ? undefined : config.errorHandler;
    return {
        errorHandler,
        routes: routes.map((route) => {
            let { middlewares, method, methods, ...rest } = route;
            if (!methods) {
                methods = Array.isArray(method) ? method : method ? [method] : method;
            }
            return {
                ...rest,
                methods,
                middlewares: [...(middlewares ?? [])],
            };
        }),
    };
}
//# sourceMappingURL=define-middlewares.js.map