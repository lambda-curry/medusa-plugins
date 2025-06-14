"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = initDb;
exports.migrateDatabase = migrateDatabase;
exports.syncLinks = syncLinks;
const logger_1 = require("@medusajs/framework/logger");
const utils_1 = require("@medusajs/framework/utils");
const path_1 = require("path");
/**
 * Initiates the database connection
 */
async function initDb() {
    const { pgConnectionLoader, featureFlagsLoader } = await import("@medusajs/framework");
    const pgConnection = pgConnectionLoader();
    await featureFlagsLoader();
    return pgConnection;
}
/**
 * Migrates the database
 */
async function migrateDatabase(appLoader) {
    try {
        await appLoader.runModulesMigrations();
    }
    catch (err) {
        logger_1.logger.error("Something went wrong while running the migrations");
        throw err;
    }
}
/**
 * Syncs links with the databse
 */
async function syncLinks(appLoader, directory, container, logger) {
    try {
        await loadCustomLinks(directory, container);
        const planner = await appLoader.getLinksExecutionPlanner();
        const actionPlan = await planner.createPlan();
        actionPlan.forEach((action) => {
            logger.info(`Sync links: "${action.action}" ${action.tableName}`);
        });
        await planner.executePlan(actionPlan);
    }
    catch (err) {
        logger.error("Something went wrong while syncing links");
        throw err;
    }
}
async function loadCustomLinks(directory, container) {
    const configModule = container.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
    const plugins = await (0, utils_1.getResolvedPlugins)(directory, configModule, true);
    const linksSourcePaths = plugins.map((plugin) => (0, path_1.join)(plugin.resolve, "links"));
    const { LinkLoader } = await import("@medusajs/framework");
    await new LinkLoader(linksSourcePaths).load();
}
//# sourceMappingURL=use-db.js.map