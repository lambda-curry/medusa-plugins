"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _InMemoryDistributedTransactionStorage_instances, _InMemoryDistributedTransactionStorage_preventRaceConditionExecutionIfNecessary;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryDistributedTransactionStorage = void 0;
const orchestration_1 = require("@medusajs/framework/orchestration");
const utils_1 = require("@medusajs/framework/utils");
const cron_parser_1 = require("cron-parser");
function parseNextExecution(optionsOrExpression) {
    if (typeof optionsOrExpression === "object") {
        if ("cron" in optionsOrExpression) {
            const expression = (0, cron_parser_1.parseExpression)(optionsOrExpression.cron);
            return expression.next().getTime() - Date.now();
        }
        if ("interval" in optionsOrExpression) {
            return optionsOrExpression.interval;
        }
        return optionsOrExpression.next().getTime() - Date.now();
    }
    const result = parseInt(`${optionsOrExpression}`);
    if (isNaN(result)) {
        const expression = (0, cron_parser_1.parseExpression)(`${optionsOrExpression}`);
        return expression.next().getTime() - Date.now();
    }
    return result;
}
class InMemoryDistributedTransactionStorage {
    constructor({ workflowExecutionService, logger, }) {
        _InMemoryDistributedTransactionStorage_instances.add(this);
        this.storage = new Map();
        this.scheduled = new Map();
        this.retries = new Map();
        this.timeouts = new Map();
        this.workflowExecutionService_ = workflowExecutionService;
        this.logger_ = logger;
    }
    setWorkflowOrchestratorService(workflowOrchestratorService) {
        this.workflowOrchestratorService_ = workflowOrchestratorService;
    }
    async saveToDb(data, retentionTime) {
        await this.workflowExecutionService_.upsert([
            {
                workflow_id: data.flow.modelId,
                transaction_id: data.flow.transactionId,
                run_id: data.flow.runId,
                execution: data.flow,
                context: {
                    data: data.context,
                    errors: data.errors,
                },
                state: data.flow.state,
                retention_time: retentionTime,
            },
        ]);
    }
    async deleteFromDb(data) {
        await this.workflowExecutionService_.delete([
            {
                workflow_id: data.flow.modelId,
                transaction_id: data.flow.transactionId,
                run_id: data.flow.runId,
            },
        ]);
    }
    async get(key, options) {
        const data = this.storage.get(key);
        if (data) {
            return data;
        }
        const { idempotent, store, retentionTime } = options ?? {};
        if (!idempotent && !(store && (0, utils_1.isDefined)(retentionTime))) {
            return;
        }
        const [_, workflowId, transactionId] = key.split(":");
        const trx = await this.workflowExecutionService_
            .list({
            workflow_id: workflowId,
            transaction_id: transactionId,
        }, {
            select: ["execution", "context"],
            order: {
                id: "desc",
            },
            take: 1,
        })
            .then((trx) => trx[0])
            .catch(() => undefined);
        if (trx) {
            const execution = trx.execution;
            if (!idempotent) {
                const isFailedOrReverted = [
                    utils_1.TransactionState.REVERTED,
                    utils_1.TransactionState.FAILED,
                ].includes(execution.state);
                const isDone = execution.state === utils_1.TransactionState.DONE;
                const isCancellingAndFailedOrReverted = options?.isCancelling && isFailedOrReverted;
                const isNotCancellingAndDoneOrFailedOrReverted = !options?.isCancelling && (isDone || isFailedOrReverted);
                if (isCancellingAndFailedOrReverted ||
                    isNotCancellingAndDoneOrFailedOrReverted) {
                    return;
                }
            }
            return {
                flow: trx.execution,
                context: trx.context?.data,
                errors: trx.context?.errors,
            };
        }
        return;
    }
    async list() {
        return Array.from(this.storage.values());
    }
    async save(key, data, ttl, options) {
        /**
         * Store the retention time only if the transaction is done, failed or reverted.
         * From that moment, this tuple can be later on archived or deleted after the retention time.
         */
        const hasFinished = [
            utils_1.TransactionState.DONE,
            utils_1.TransactionState.FAILED,
            utils_1.TransactionState.REVERTED,
        ].includes(data.flow.state);
        const { retentionTime, idempotent } = options ?? {};
        await __classPrivateFieldGet(this, _InMemoryDistributedTransactionStorage_instances, "m", _InMemoryDistributedTransactionStorage_preventRaceConditionExecutionIfNecessary).call(this, {
            data,
            key,
            options,
        });
        // Only store retention time if it's provided
        if (retentionTime) {
            Object.assign(data, {
                retention_time: retentionTime,
            });
        }
        // Store in memory
        const isNotStarted = data.flow.state === utils_1.TransactionState.NOT_STARTED;
        const isManualTransactionId = !data.flow.transactionId.startsWith("auto-");
        if (isNotStarted && isManualTransactionId) {
            const storedData = this.storage.get(key);
            if (storedData) {
                throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_ARGUMENT, "Transaction already started for transactionId: " +
                    data.flow.transactionId);
            }
        }
        this.storage.set(key, data);
        // Optimize DB operations - only perform when necessary
        if (hasFinished) {
            if (!retentionTime && !idempotent) {
                await this.deleteFromDb(data);
            }
            else {
                await this.saveToDb(data, retentionTime);
            }
            this.storage.delete(key);
        }
        else {
            await this.saveToDb(data, retentionTime);
        }
    }
    async scheduleRetry(transaction, step, timestamp, interval) {
        const { modelId: workflowId, transactionId } = transaction;
        const inter = setTimeout(async () => {
            const context = transaction.getFlow().metadata ?? {};
            await this.workflowOrchestratorService_.run(workflowId, {
                transactionId,
                logOnError: true,
                throwOnError: false,
                context: {
                    eventGroupId: context.eventGroupId,
                    parentStepIdempotencyKey: context.parentStepIdempotencyKey,
                    preventReleaseEvents: context.preventReleaseEvents,
                },
            });
        }, interval * 1e3);
        const key = `${workflowId}:${transactionId}:${step.id}`;
        this.retries.set(key, inter);
    }
    async clearRetry(transaction, step) {
        const { modelId: workflowId, transactionId } = transaction;
        const key = `${workflowId}:${transactionId}:${step.id}`;
        const inter = this.retries.get(key);
        if (inter) {
            clearTimeout(inter);
            this.retries.delete(key);
        }
    }
    async scheduleTransactionTimeout(transaction, timestamp, interval) {
        const { modelId: workflowId, transactionId } = transaction;
        const inter = setTimeout(async () => {
            const context = transaction.getFlow().metadata ?? {};
            await this.workflowOrchestratorService_.run(workflowId, {
                transactionId,
                logOnError: true,
                throwOnError: false,
                context: {
                    eventGroupId: context.eventGroupId,
                    parentStepIdempotencyKey: context.parentStepIdempotencyKey,
                    preventReleaseEvents: context.preventReleaseEvents,
                },
            });
        }, interval * 1e3);
        const key = `${workflowId}:${transactionId}`;
        this.timeouts.set(key, inter);
    }
    async clearTransactionTimeout(transaction) {
        const { modelId: workflowId, transactionId } = transaction;
        const key = `${workflowId}:${transactionId}`;
        const inter = this.timeouts.get(key);
        if (inter) {
            clearTimeout(inter);
            this.timeouts.delete(key);
        }
    }
    async scheduleStepTimeout(transaction, step, timestamp, interval) {
        const { modelId: workflowId, transactionId } = transaction;
        const inter = setTimeout(async () => {
            const context = transaction.getFlow().metadata ?? {};
            await this.workflowOrchestratorService_.run(workflowId, {
                transactionId,
                logOnError: true,
                throwOnError: false,
                context: {
                    eventGroupId: context.eventGroupId,
                    parentStepIdempotencyKey: context.parentStepIdempotencyKey,
                    preventReleaseEvents: context.preventReleaseEvents,
                },
            });
        }, interval * 1e3);
        const key = `${workflowId}:${transactionId}:${step.id}`;
        this.timeouts.set(key, inter);
    }
    async clearStepTimeout(transaction, step) {
        const { modelId: workflowId, transactionId } = transaction;
        const key = `${workflowId}:${transactionId}:${step.id}`;
        const inter = this.timeouts.get(key);
        if (inter) {
            clearTimeout(inter);
            this.timeouts.delete(key);
        }
    }
    /* Scheduler storage methods */
    async schedule(jobDefinition, schedulerOptions) {
        const jobId = typeof jobDefinition === "string" ? jobDefinition : jobDefinition.jobId;
        // In order to ensure that the schedule configuration is always up to date, we first cancel an existing job, if there was one
        await this.remove(jobId);
        let expression;
        let nextExecution = parseNextExecution(schedulerOptions);
        if ("cron" in schedulerOptions) {
            // Cache the parsed expression to avoid repeated parsing
            expression = (0, cron_parser_1.parseExpression)(schedulerOptions.cron);
        }
        else if ("interval" in schedulerOptions) {
            expression = schedulerOptions.interval;
        }
        else {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_ARGUMENT, "Schedule cron or interval definition is required for scheduled jobs.");
        }
        const timer = setTimeout(async () => {
            this.jobHandler(jobId);
        }, nextExecution);
        // Set the timer's unref to prevent it from keeping the process alive
        timer.unref();
        this.scheduled.set(jobId, {
            timer,
            expression,
            numberOfExecutions: 0,
            config: schedulerOptions,
        });
    }
    async remove(jobId) {
        const job = this.scheduled.get(jobId);
        if (!job) {
            return;
        }
        clearTimeout(job.timer);
        this.scheduled.delete(jobId);
    }
    async removeAll() {
        for (const [key] of this.scheduled) {
            await this.remove(key);
        }
    }
    async jobHandler(jobId) {
        const job = this.scheduled.get(jobId);
        if (!job) {
            return;
        }
        if (job.config?.numberOfExecutions !== undefined &&
            job.config.numberOfExecutions <= job.numberOfExecutions) {
            this.scheduled.delete(jobId);
            return;
        }
        const nextExecution = parseNextExecution(job.expression);
        try {
            await this.workflowOrchestratorService_.run(jobId, {
                logOnError: true,
                throwOnError: false,
            });
            // Only schedule the next job execution after the current one completes successfully
            const timer = setTimeout(async () => {
                setImmediate(() => {
                    this.jobHandler(jobId);
                });
            }, nextExecution);
            // Prevent timer from keeping the process alive
            timer.unref();
            this.scheduled.set(jobId, {
                timer,
                expression: job.expression,
                numberOfExecutions: (job.numberOfExecutions ?? 0) + 1,
                config: job.config,
            });
        }
        catch (e) {
            if (e instanceof utils_1.MedusaError && e.type === utils_1.MedusaError.Types.NOT_FOUND) {
                this.logger_?.warn(`Tried to execute a scheduled workflow with ID ${jobId} that does not exist, removing it from the scheduler.`);
                await this.remove(jobId);
                return;
            }
            throw e;
        }
    }
}
exports.InMemoryDistributedTransactionStorage = InMemoryDistributedTransactionStorage;
_InMemoryDistributedTransactionStorage_instances = new WeakSet(), _InMemoryDistributedTransactionStorage_preventRaceConditionExecutionIfNecessary = async function _InMemoryDistributedTransactionStorage_preventRaceConditionExecutionIfNecessary({ data, key, options, }) {
    const isInitialCheckpoint = [utils_1.TransactionState.NOT_STARTED].includes(data.flow.state);
    /**
     * In case many execution can succeed simultaneously, we need to ensure that the latest
     * execution does continue if a previous execution is considered finished
     */
    const currentFlow = data.flow;
    const getOptions = {
        ...options,
        isCancelling: !!data.flow.cancelledAt,
    };
    const { flow: latestUpdatedFlow } = (await this.get(key, getOptions)) ??
        { flow: {} };
    if (!isInitialCheckpoint && !(0, utils_1.isPresent)(latestUpdatedFlow)) {
        /**
         * the initial checkpoint expect no other checkpoint to have been stored.
         * In case it is not the initial one and another checkpoint is trying to
         * find if a concurrent execution has finished, we skip the execution.
         * The already finished execution would have deleted the checkpoint already.
         */
        throw new orchestration_1.SkipExecutionError("Already finished by another execution");
    }
    // First ensure that the latest execution was not cancelled, otherwise we skip the execution
    const latestTransactionCancelledAt = latestUpdatedFlow.cancelledAt;
    const currentTransactionCancelledAt = currentFlow.cancelledAt;
    if (!!latestTransactionCancelledAt &&
        currentTransactionCancelledAt == null) {
        throw new orchestration_1.SkipCancelledExecutionError("Workflow execution has been cancelled during the execution");
    }
    const currentFlowSteps = Object.values(currentFlow.steps || {});
    const latestUpdatedFlowSteps = latestUpdatedFlow.steps
        ? Object.values(latestUpdatedFlow.steps)
        : [];
    // Predefined states for quick lookup
    const invokingStates = [
        utils_1.TransactionStepState.INVOKING,
        utils_1.TransactionStepState.NOT_STARTED,
    ];
    const compensatingStates = [
        utils_1.TransactionStepState.COMPENSATING,
        utils_1.TransactionStepState.NOT_STARTED,
    ];
    const isInvokingState = (step) => invokingStates.includes(step.invoke?.state);
    const isCompensatingState = (step) => compensatingStates.includes(step.compensate?.state);
    const currentFlowLastInvokingStepIndex = currentFlowSteps.findIndex(isInvokingState);
    const latestUpdatedFlowLastInvokingStepIndex = !latestUpdatedFlow.steps
        ? 1 // There is no other execution, so the current execution is the latest
        : latestUpdatedFlowSteps.findIndex(isInvokingState);
    const reversedCurrentFlowSteps = [...currentFlowSteps].reverse();
    const currentFlowLastCompensatingStepIndex = reversedCurrentFlowSteps.findIndex(isCompensatingState);
    const reversedLatestUpdatedFlowSteps = [...latestUpdatedFlowSteps].reverse();
    const latestUpdatedFlowLastCompensatingStepIndex = !latestUpdatedFlow.steps
        ? -1 // There is no other execution, so the current execution is the latest
        : reversedLatestUpdatedFlowSteps.findIndex(isCompensatingState);
    const isLatestExecutionFinishedIndex = -1;
    const invokeShouldBeSkipped = (latestUpdatedFlowLastInvokingStepIndex ===
        isLatestExecutionFinishedIndex ||
        currentFlowLastInvokingStepIndex <
            latestUpdatedFlowLastInvokingStepIndex) &&
        currentFlowLastInvokingStepIndex !== isLatestExecutionFinishedIndex;
    const compensateShouldBeSkipped = currentFlowLastCompensatingStepIndex <
        latestUpdatedFlowLastCompensatingStepIndex &&
        currentFlowLastCompensatingStepIndex !== isLatestExecutionFinishedIndex &&
        latestUpdatedFlowLastCompensatingStepIndex !==
            isLatestExecutionFinishedIndex;
    const isCompensatingMismatch = latestUpdatedFlow.state === utils_1.TransactionState.COMPENSATING &&
        ![utils_1.TransactionState.REVERTED, utils_1.TransactionState.FAILED].includes(currentFlow.state) &&
        currentFlow.state !== latestUpdatedFlow.state;
    const isRevertedMismatch = latestUpdatedFlow.state === utils_1.TransactionState.REVERTED &&
        currentFlow.state !== utils_1.TransactionState.REVERTED;
    const isFailedMismatch = latestUpdatedFlow.state === utils_1.TransactionState.FAILED &&
        currentFlow.state !== utils_1.TransactionState.FAILED;
    if ((data.flow.state !== utils_1.TransactionState.COMPENSATING &&
        invokeShouldBeSkipped) ||
        (data.flow.state === utils_1.TransactionState.COMPENSATING &&
            compensateShouldBeSkipped) ||
        isCompensatingMismatch ||
        isRevertedMismatch ||
        isFailedMismatch) {
        throw new orchestration_1.SkipExecutionError("Already finished by another execution");
    }
};
//# sourceMappingURL=workflow-orchestrator-storage.js.map