"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowsModuleService = void 0;
const types_1 = require("@medusajs/framework/types");
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("../models");
class WorkflowsModuleService extends utils_1.ModulesSdkUtils.MedusaService({ WorkflowExecution: _models_1.WorkflowExecution }) {
    constructor({ manager, baseRepository, workflowExecutionService, workflowOrchestratorService, redisDisconnectHandler, }, moduleDeclaration) {
        // @ts-ignore
        super(...arguments);
        this.moduleDeclaration = moduleDeclaration;
        this.__hooks = {
            onApplicationStart: async () => {
                await this.workflowOrchestratorService_.onApplicationStart();
                await this.clearExpiredExecutions();
                this.clearTimeout_ = setInterval(async () => {
                    try {
                        await this.clearExpiredExecutions();
                    }
                    catch { }
                }, 1000 * 60 * 60);
            },
            onApplicationPrepareShutdown: async () => {
                await this.workflowOrchestratorService_.onApplicationPrepareShutdown();
            },
            onApplicationShutdown: async () => {
                await this.workflowOrchestratorService_.onApplicationShutdown();
                await this.redisDisconnectHandler_();
                clearInterval(this.clearTimeout_);
            },
        };
        this.manager_ = manager;
        this.baseRepository_ = baseRepository;
        this.workflowExecutionService_ = workflowExecutionService;
        this.workflowOrchestratorService_ = workflowOrchestratorService;
        this.redisDisconnectHandler_ = redisDisconnectHandler;
    }
    static prepareFilters(filters) {
        const filters_ = { ...filters }; // shallow copy
        if (filters_?.q) {
            const q = filters_.q;
            delete filters_.q;
            const textSearch = { $ilike: `%${q}%` };
            const textSearchFilters = {
                $or: [
                    {
                        transaction_id: textSearch,
                    },
                    {
                        workflow_id: textSearch,
                    },
                    {
                        state: textSearch,
                    },
                    {
                        execution: {
                            runId: textSearch,
                        },
                    },
                ],
            };
            if (!Object.keys(filters_).length) {
                return textSearchFilters;
            }
            else {
                return { $and: [filters, textSearchFilters] };
            }
        }
        return filters;
    }
    // @ts-expect-error
    async listWorkflowExecutions(filters = {}, config, sharedContext) {
        const filters_ = WorkflowsModuleService.prepareFilters(filters);
        return await super.listWorkflowExecutions(filters_, config, sharedContext);
    }
    // @ts-expect-error
    async listAndCountWorkflowExecutions(filters = {}, config, sharedContext) {
        const filters_ = WorkflowsModuleService.prepareFilters(filters);
        return await super.listAndCountWorkflowExecutions(filters_, config, sharedContext);
    }
    async run(workflowIdOrWorkflow, options = {}, context = {}) {
        const options_ = JSON.parse(JSON.stringify(options ?? {}));
        const { manager, transactionManager, preventReleaseEvents, transactionId, parentStepIdempotencyKey, ...restContext } = context;
        let localPreventReleaseEvents = false;
        if ((0, utils_1.isDefined)(options_.context?.preventReleaseEvents)) {
            localPreventReleaseEvents = options_.context.preventReleaseEvents;
        }
        else {
            if ((0, utils_1.isDefined)(context.eventGroupId) &&
                (0, utils_1.isDefined)(options_.context?.eventGroupId) &&
                context.eventGroupId === options_.context?.eventGroupId) {
                localPreventReleaseEvents = true;
            }
        }
        let eventGroupId;
        if (options_.context?.eventGroupId) {
            eventGroupId = options_.context.eventGroupId;
        }
        else if (localPreventReleaseEvents && context.eventGroupId) {
            eventGroupId = context.eventGroupId;
        }
        options_.context = {
            ...(restContext ?? {}),
            ...(options_.context ?? {}),
            eventGroupId,
            preventReleaseEvents: localPreventReleaseEvents,
        };
        const ret = await this.workflowOrchestratorService_.run(workflowIdOrWorkflow, options_);
        return ret;
    }
    async getRunningTransaction(workflowId, transactionId, context = {}) {
        return await this.workflowOrchestratorService_.getRunningTransaction(workflowId, transactionId, context);
    }
    async setStepSuccess({ idempotencyKey, stepResponse, options, }, context = {}) {
        const options_ = JSON.parse(JSON.stringify(options ?? {}));
        const { manager, transactionManager, ...restContext } = context;
        options_.context ??= restContext;
        return await this.workflowOrchestratorService_.setStepSuccess({
            idempotencyKey,
            stepResponse,
            options: options_,
        });
    }
    async setStepFailure({ idempotencyKey, stepResponse, options, }, context = {}) {
        const options_ = JSON.parse(JSON.stringify(options ?? {}));
        const { manager, transactionManager, ...restContext } = context;
        options_.context ??= restContext;
        return await this.workflowOrchestratorService_.setStepFailure({
            idempotencyKey,
            stepResponse,
            options: options_,
        });
    }
    async subscribe(args, context = {}) {
        return this.workflowOrchestratorService_.subscribe(args);
    }
    async unsubscribe(args, context = {}) {
        return this.workflowOrchestratorService_.unsubscribe(args);
    }
    async clearExpiredExecutions() {
        return this.manager_.execute(`
      DELETE FROM workflow_execution
      WHERE retention_time IS NOT NULL AND
      updated_at <= (CURRENT_TIMESTAMP - INTERVAL '1 second' * retention_time);
    `);
    }
    async cancel(workflowId, options, context = {}) {
        return await this.workflowOrchestratorService_.cancel(workflowId, options);
    }
}
exports.WorkflowsModuleService = WorkflowsModuleService;
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsModuleService.prototype, "listWorkflowExecutions", null);
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsModuleService.prototype, "listAndCountWorkflowExecutions", null);
__decorate([
    (0, utils_1.InjectSharedContext)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof TWorkflow !== "undefined" && TWorkflow) === "function" ? _a : Object, Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsModuleService.prototype, "run", null);
__decorate([
    (0, utils_1.InjectSharedContext)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsModuleService.prototype, "getRunningTransaction", null);
__decorate([
    (0, utils_1.InjectSharedContext)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsModuleService.prototype, "setStepSuccess", null);
__decorate([
    (0, utils_1.InjectSharedContext)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsModuleService.prototype, "setStepFailure", null);
__decorate([
    (0, utils_1.InjectSharedContext)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsModuleService.prototype, "subscribe", null);
__decorate([
    (0, utils_1.InjectSharedContext)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsModuleService.prototype, "unsubscribe", null);
__decorate([
    (0, utils_1.InjectSharedContext)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsModuleService.prototype, "cancel", null);
//# sourceMappingURL=workflows-module.js.map