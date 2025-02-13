"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobSchedulerQueue = void 0;
const api_1 = require("@bull-board/api");
const express_1 = require("@bull-board/express");
const body_parser_1 = __importDefault(require("body-parser"));
const express_2 = require("express");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
const medusa_1 = require("@medusajs/medusa");
const eventBusQueue = (eventBusOptions) => {
    var _a, _b, _c;
    if (!eventBusOptions) {
        return undefined;
    }
    const connection = new ioredis_1.default(eventBusOptions.redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
        ...((_a = eventBusOptions === null || eventBusOptions === void 0 ? void 0 : eventBusOptions.redisOptions) !== null && _a !== void 0 ? _a : {}),
    });
    const queueConfig = {
        prefix: 'RedisEventBusService',
        ...((_b = eventBusOptions.queueOptions) !== null && _b !== void 0 ? _b : {}),
        connection,
    };
    const queue = new bullmq_1.Queue((_c = eventBusOptions.queueName) !== null && _c !== void 0 ? _c : `events-queue`, queueConfig);
    return queue;
};
const jobSchedulerQueue = (jobSchedulerOptions) => {
    var _a, _b, _c;
    if (!jobSchedulerOptions) {
        return undefined;
    }
    const connection = new ioredis_1.default(jobSchedulerOptions.redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
        ...((_a = jobSchedulerOptions === null || jobSchedulerOptions === void 0 ? void 0 : jobSchedulerOptions.redisOptions) !== null && _a !== void 0 ? _a : {}),
    });
    const queueConfig = {
        prefix: 'JobSchedulerService',
        ...((_b = jobSchedulerOptions.queueOptions) !== null && _b !== void 0 ? _b : {}),
        connection,
    };
    const queue = new bullmq_1.Queue((_c = jobSchedulerOptions.queueName) !== null && _c !== void 0 ? _c : `scheduled-jobs:queue`, queueConfig);
    return queue;
};
exports.jobSchedulerQueue = jobSchedulerQueue;
function default_1(rootDirectory, options) {
    var _a, _b;
    const router = (0, express_2.Router)();
    router.use(body_parser_1.default.json());
    const reverseProxyPrefix = ((_a = options.reverseProxyPrefix) === null || _a === void 0 ? void 0 : _a.replace(/\/$/, '')) || '';
    const basePath = (_b = options.basePath) !== null && _b !== void 0 ? _b : '/queue-ui';
    const serverAdapter = new express_1.ExpressAdapter();
    serverAdapter.setBasePath(`${reverseProxyPrefix}${basePath}`);
    const queues = [
        eventBusQueue(options.eventBusRedisOptions),
        (0, exports.jobSchedulerQueue)(options.jobSchedulerOptions),
    ]
        .filter(q => !!q)
        .map(q => new bullMQAdapter_1.BullMQAdapter(q));
    (0, api_1.createBullBoard)({
        queues,
        serverAdapter,
        options: {
            uiConfig: {
                boardTitle: 'BullMQ Dashboard',
                boardLogo: {
                    path: 'https://user-images.githubusercontent.com/7554214/153162406-bf8fd16f-aa98-4604-b87b-e13ab4baf604.png',
                    width: 'auto',
                    height: 'auto',
                },
            },
        },
    });
    router.use(basePath, (0, medusa_1.authenticate)());
    router.use(basePath, serverAdapter.getRouter());
    return router;
}
exports.default = default_1;
//# sourceMappingURL=index.js.map