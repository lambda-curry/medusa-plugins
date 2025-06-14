"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApp = startApp;
const express_1 = __importDefault(require("express"));
const get_port_1 = __importDefault(require("get-port"));
const path_1 = require("path");
const utils_1 = require("./utils");
const utils_2 = require("@medusajs/framework/utils");
const logger_1 = require("@medusajs/framework/logger");
async function bootstrapApp({ cwd, env = {}, } = {}) {
    const app = (0, express_1.default)();
    (0, utils_1.applyEnvVarsToProcess)(env);
    const loaders = require("@medusajs/medusa/loaders/index").default;
    try {
        const { container, shutdown } = await loaders({
            directory: (0, path_1.resolve)(cwd || process.cwd()),
            expressApp: app,
        });
        const PORT = process.env.PORT ? parseInt(process.env.PORT) : await (0, get_port_1.default)();
        return {
            shutdown,
            container,
            app,
            port: PORT,
        };
    }
    catch (error) {
        logger_1.logger.error("Error bootstrapping app:", error);
        throw error;
    }
}
async function startApp({ cwd, env = {}, } = {}) {
    let expressServer;
    let medusaShutdown = async () => void 0;
    let container;
    try {
        const { app, port, container: appContainer, shutdown: appShutdown, } = await bootstrapApp({
            cwd,
            env,
        });
        container = appContainer;
        medusaShutdown = appShutdown;
        const shutdown = async () => {
            try {
                const shutdownPromise = (0, utils_2.promiseAll)([
                    expressServer?.shutdown(),
                    medusaShutdown(),
                ]);
                await (0, utils_1.execOrTimeout)(shutdownPromise);
                if (typeof global !== "undefined" && global?.gc) {
                    global.gc();
                }
            }
            catch (error) {
                logger_1.logger.error("Error during shutdown:", error);
                try {
                    await expressServer?.shutdown();
                    await medusaShutdown();
                }
                catch (cleanupError) {
                    logger_1.logger.error("Error during forced cleanup:", cleanupError);
                }
                throw error;
            }
        };
        return await new Promise((resolve, reject) => {
            const server = app
                .listen(port)
                .on("error", async (err) => {
                logger_1.logger.error("Error starting server:", err);
                await shutdown();
                return reject(err);
            })
                .on("listening", () => {
                process.send?.(port);
                resolve({
                    shutdown,
                    container,
                    port,
                });
            });
            expressServer = utils_2.GracefulShutdownServer.create(server);
        });
    }
    catch (error) {
        logger_1.logger.error("Error in startApp:", error);
        if (expressServer) {
            try {
                await expressServer.shutdown();
            }
            catch (cleanupError) {
                logger_1.logger.error("Error cleaning up express server:", cleanupError);
            }
        }
        if (medusaShutdown) {
            try {
                await medusaShutdown();
            }
            catch (cleanupError) {
                logger_1.logger.error("Error cleaning up medusa:", cleanupError);
            }
        }
        throw error;
    }
}
//# sourceMappingURL=bootstrap-app.js.map