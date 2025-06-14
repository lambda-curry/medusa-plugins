"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.medusaIntegrationTestRunner = medusaIntegrationTestRunner;
const utils_1 = require("@medusajs/framework/utils");
const awilix_1 = require("awilix");
const logger_1 = require("@medusajs/framework/logger");
const database_1 = require("./database");
const medusa_test_runner_utils_1 = require("./medusa-test-runner-utils");
class MedusaTestRunner {
    constructor(config) {
        this.globalContainer = null;
        this.apiUtils = null;
        this.loadedApplication = null;
        this.shutdown = async () => void 0;
        this.isFirstTime = true;
        const tempName = parseInt(process.env.JEST_WORKER_ID || "1");
        const moduleName = config.moduleName ?? Math.random().toString(36).substring(7);
        this.dbName =
            config.dbName ??
                `medusa-${moduleName.toLowerCase()}-integration-${tempName}`;
        this.schema = config.schema ?? "public";
        this.cwd = config.medusaConfigFile ?? process.cwd();
        this.env = config.env ?? {};
        this.debug = config.debug ?? false;
        this.inApp = config.inApp ?? false;
        this.dbUtils = (0, database_1.dbTestUtilFactory)();
        this.dbConfig = {
            dbName: this.dbName,
            clientUrl: (0, database_1.getDatabaseURL)(this.dbName),
            schema: this.schema,
            debug: this.debug,
        };
        this.setupProcessHandlers();
    }
    setupProcessHandlers() {
        process.on("SIGTERM", async () => {
            await this.cleanup();
            process.exit(0);
        });
        process.on("SIGINT", async () => {
            await this.cleanup();
            process.exit(0);
        });
    }
    createApiProxy() {
        return new Proxy({}, {
            get: (target, prop) => {
                return this.apiUtils?.[prop];
            },
        });
    }
    createDbConnectionProxy() {
        return new Proxy({}, {
            get: (target, prop) => {
                return this.dbUtils.pgConnection_?.[prop];
            },
        });
    }
    async initializeDatabase() {
        try {
            logger_1.logger.info(`Creating database ${this.dbName}`);
            await this.dbUtils.create(this.dbName);
            this.dbUtils.pgConnection_ = await (0, medusa_test_runner_utils_1.initDb)();
        }
        catch (error) {
            logger_1.logger.error(`Error initializing database: ${error?.message}`);
            await this.cleanup();
            throw error;
        }
    }
    async setupApplication() {
        const { container, MedusaAppLoader } = await import("@medusajs/framework");
        const appLoader = new MedusaAppLoader();
        container.register({
            [utils_1.ContainerRegistrationKeys.LOGGER]: (0, awilix_1.asValue)(logger_1.logger),
        });
        await this.initializeDatabase();
        logger_1.logger.info(`Migrating database with core migrations and links ${this.dbName}`);
        await (0, medusa_test_runner_utils_1.migrateDatabase)(appLoader);
        await (0, medusa_test_runner_utils_1.syncLinks)(appLoader, this.cwd, container, logger_1.logger);
        await (0, medusa_test_runner_utils_1.clearInstances)();
        this.loadedApplication = await appLoader.load();
        try {
            const { shutdown, container: appContainer, port, } = await (0, medusa_test_runner_utils_1.startApp)({
                cwd: this.cwd,
                env: this.env,
            });
            this.globalContainer = appContainer;
            this.shutdown = async () => {
                await shutdown();
                if (this.apiUtils?.cancelToken?.source) {
                    this.apiUtils.cancelToken.source.cancel("Request canceled by shutdown");
                }
            };
            const { default: axios } = (await import("axios"));
            const cancelTokenSource = axios.CancelToken.source();
            this.apiUtils = axios.create({
                baseURL: `http://localhost:${port}`,
                cancelToken: cancelTokenSource.token,
            });
            this.apiUtils.cancelToken = { source: cancelTokenSource };
        }
        catch (error) {
            logger_1.logger.error(`Error starting the app: ${error?.message}`);
            await this.cleanup();
            throw error;
        }
    }
    async cleanup() {
        try {
            process.removeAllListeners("SIGTERM");
            process.removeAllListeners("SIGINT");
            await this.dbUtils.shutdown(this.dbName);
            await this.shutdown();
            await (0, medusa_test_runner_utils_1.clearInstances)();
            if (this.apiUtils?.cancelToken?.source) {
                this.apiUtils.cancelToken.source.cancel("Cleanup");
            }
            if (this.globalContainer?.dispose) {
                await this.globalContainer.dispose();
            }
            this.apiUtils = null;
            this.loadedApplication = null;
            this.globalContainer = null;
            if (global.gc) {
                global.gc();
            }
        }
        catch (error) {
            logger_1.logger.error("Error during cleanup:", error?.message);
        }
    }
    async beforeAll() {
        try {
            this.setupProcessHandlers();
            await (0, medusa_test_runner_utils_1.configLoaderOverride)(this.cwd, this.dbConfig);
            (0, medusa_test_runner_utils_1.applyEnvVarsToProcess)(this.env);
            await this.setupApplication();
        }
        catch (error) {
            await this.cleanup();
            throw error;
        }
    }
    async beforeEach() {
        if (this.isFirstTime) {
            this.isFirstTime = false;
            return;
        }
        await this.afterEach();
        const container = this.globalContainer;
        const copiedContainer = (0, utils_1.createMedusaContainer)({}, container);
        try {
            const { MedusaAppLoader } = await import("@medusajs/framework");
            const medusaAppLoader = new MedusaAppLoader({
                container: copiedContainer,
            });
            await medusaAppLoader.runModulesLoader();
        }
        catch (error) {
            await copiedContainer.dispose?.();
            logger_1.logger.error("Error running modules loaders:", error?.message);
            throw error;
        }
    }
    async afterEach() {
        try {
            await this.dbUtils.teardown({ schema: this.schema });
        }
        catch (error) {
            logger_1.logger.error("Error tearing down database:", error?.message);
            throw error;
        }
    }
    getOptions() {
        return {
            api: this.createApiProxy(),
            dbConnection: this.createDbConnectionProxy(),
            getMedusaApp: () => this.loadedApplication,
            getContainer: () => this.globalContainer,
            dbConfig: {
                dbName: this.dbName,
                schema: this.schema,
                clientUrl: this.dbConfig.clientUrl,
            },
            dbUtils: this.dbUtils,
        };
    }
}
function medusaIntegrationTestRunner({ moduleName, dbName, medusaConfigFile, schema = "public", env = {}, debug = false, inApp = false, testSuite, }) {
    const runner = new MedusaTestRunner({
        moduleName,
        dbName,
        medusaConfigFile,
        schema,
        env,
        debug,
        inApp,
    });
    return describe("", () => {
        let testOptions;
        beforeAll(async () => {
            await runner.beforeAll();
            testOptions = runner.getOptions();
        });
        beforeEach(async () => {
            await runner.beforeEach();
        });
        afterEach(async () => {
            await runner.afterEach();
        });
        afterAll(async () => {
            // Run main cleanup
            await runner.cleanup();
            // Clean references to the test options
            for (const key in testOptions) {
                if (typeof testOptions[key] === "function") {
                    testOptions[key] = null;
                }
                else if (typeof testOptions[key] === "object" &&
                    testOptions[key] !== null) {
                    Object.keys(testOptions[key]).forEach((k) => {
                        testOptions[key][k] = null;
                    });
                    testOptions[key] = null;
                }
            }
            // Encourage garbage collection
            // @ts-ignore
            testOptions = null;
            if (global.gc) {
                global.gc();
            }
        });
        // Run test suite with options
        testSuite(runner.getOptions());
    });
}
//# sourceMappingURL=medusa-test-runner.js.map