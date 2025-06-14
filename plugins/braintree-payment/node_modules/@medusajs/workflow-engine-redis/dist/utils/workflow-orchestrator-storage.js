"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _RedisDistributedTransactionStorage_instances, _RedisDistributedTransactionStorage_isWorkerMode, _RedisDistributedTransactionStorage_preventRaceConditionExecutionIfNecessary;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisDistributedTransactionStorage = void 0;
const orchestration_1 = require("@medusajs/framework/orchestration");
const utils_1 = require("@medusajs/framework/utils");
const bullmq_1 = require("bullmq");
var JobType;
(function (JobType) {
    JobType["SCHEDULE"] = "schedule";
    JobType["RETRY"] = "retry";
    JobType["STEP_TIMEOUT"] = "step_timeout";
    JobType["TRANSACTION_TIMEOUT"] = "transaction_timeout";
})(JobType || (JobType = {}));
class RedisDistributedTransactionStorage {
    constructor({ workflowExecutionService, redisConnection, redisWorkerConnection, redisQueueName, redisJobQueueName, logger, isWorkerMode, }) {
        _RedisDistributedTransactionStorage_instances.add(this);
        _RedisDistributedTransactionStorage_isWorkerMode.set(this, false);
        this.workflowExecutionService_ = workflowExecutionService;
        this.logger_ = logger;
        this.redisClient = redisConnection;
        this.redisWorkerConnection = redisWorkerConnection;
        this.queueName = redisQueueName;
        this.jobQueueName = redisJobQueueName;
        this.queue = new bullmq_1.Queue(redisQueueName, { connection: this.redisClient });
        this.jobQueue = isWorkerMode
            ? new bullmq_1.Queue(redisJobQueueName, {
                connection: this.redisClient,
            })
            : undefined;
        __classPrivateFieldSet(this, _RedisDistributedTransactionStorage_isWorkerMode, isWorkerMode, "f");
    }
    async onApplicationPrepareShutdown() {
        // Close worker gracefully, i.e. wait for the current jobs to finish
        await this.worker?.close();
        await this.jobWorker?.close();
    }
    async onApplicationShutdown() {
        await this.queue?.close();
        await this.jobQueue?.close();
    }
    async onApplicationStart() {
        const allowedJobs = [
            JobType.RETRY,
            JobType.STEP_TIMEOUT,
            JobType.TRANSACTION_TIMEOUT,
        ];
        const workerOptions = {
            connection: this.redisWorkerConnection,
        };
        // TODO: Remove this once we have released to all clients (Added: v2.6+)
        // Remove all repeatable jobs from the old queue since now we have a queue dedicated to scheduled jobs
        await this.removeAllRepeatableJobs(this.queue);
        this.worker = new bullmq_1.Worker(this.queueName, async (job) => {
            this.logger_.debug(`executing job ${job.name} from queue ${this.queueName} with the following data: ${JSON.stringify(job.data)}`);
            if (allowedJobs.includes(job.name)) {
                await this.executeTransaction(job.data.workflowId, job.data.transactionId, job.data.transactionMetadata);
            }
            if (job.name === JobType.SCHEDULE) {
                // Remove repeatable job from the old queue since now we have a queue dedicated to scheduled jobs
                await this.remove(job.data.jobId);
            }
        }, workerOptions);
        if (__classPrivateFieldGet(this, _RedisDistributedTransactionStorage_isWorkerMode, "f")) {
            this.jobWorker = new bullmq_1.Worker(this.jobQueueName, async (job) => {
                this.logger_.debug(`executing scheduled job ${job.data.jobId} from queue ${this.jobQueueName} with the following options: ${JSON.stringify(job.data.schedulerOptions)}`);
                return await this.executeScheduledJob(job.data.jobId, job.data.schedulerOptions);
            }, workerOptions);
        }
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
    async executeTransaction(workflowId, transactionId, transactionMetadata = {}) {
        return await this.workflowOrchestratorService_.run(workflowId, {
            transactionId,
            logOnError: true,
            throwOnError: false,
            context: {
                eventGroupId: transactionMetadata.eventGroupId,
                parentStepIdempotencyKey: transactionMetadata.parentStepIdempotencyKey,
                preventReleaseEvents: transactionMetadata.preventReleaseEvents,
            },
        });
    }
    async executeScheduledJob(jobId, schedulerOptions) {
        try {
            // TODO: In the case of concurrency being forbidden, we want to generate a predictable transaction ID and rely on the idempotency
            // of the transaction to ensure that the transaction is only executed once.
            await this.workflowOrchestratorService_.run(jobId, {
                logOnError: true,
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
    async get(key, options) {
        const data = await this.redisClient.get(key);
        if (data) {
            const parsedData = JSON.parse(data);
            return parsedData;
        }
        // Not in Redis either - check database if needed
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
        // Replace Redis KEYS with SCAN to avoid blocking the server
        const transactions = [];
        let cursor = "0";
        do {
            // Use SCAN instead of KEYS to avoid blocking Redis
            const [nextCursor, keys] = await this.redisClient.scan(cursor, "MATCH", orchestration_1.DistributedTransaction.keyPrefix + ":*", "COUNT", 100 // Fetch in reasonable batches
            );
            cursor = nextCursor;
            if (keys.length) {
                // Use mget to batch retrieve multiple keys at once
                const values = await this.redisClient.mget(keys);
                for (const value of values) {
                    if (value) {
                        transactions.push(JSON.parse(value));
                    }
                }
            }
        } while (cursor !== "0");
        return transactions;
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
        await __classPrivateFieldGet(this, _RedisDistributedTransactionStorage_instances, "m", _RedisDistributedTransactionStorage_preventRaceConditionExecutionIfNecessary).call(this, {
            data,
            key,
            options,
        });
        if (hasFinished && retentionTime) {
            Object.assign(data, {
                retention_time: retentionTime,
            });
        }
        const isNotStarted = data.flow.state === utils_1.TransactionState.NOT_STARTED;
        const isManualTransactionId = !data.flow.transactionId.startsWith("auto-");
        // Only set if not exists
        const shouldSetNX = isNotStarted && isManualTransactionId;
        // Prepare operations to be executed in batch or pipeline
        const stringifiedData = JSON.stringify(data);
        const pipeline = this.redisClient.pipeline();
        // Execute Redis operations
        if (!hasFinished) {
            if (ttl) {
                if (shouldSetNX) {
                    pipeline.set(key, stringifiedData, "EX", ttl, "NX");
                }
                else {
                    pipeline.set(key, stringifiedData, "EX", ttl);
                }
            }
            else {
                if (shouldSetNX) {
                    pipeline.set(key, stringifiedData, "NX");
                }
                else {
                    pipeline.set(key, stringifiedData);
                }
            }
        }
        else {
            pipeline.unlink(key);
        }
        const pipelinePromise = pipeline.exec().then((result) => {
            if (!shouldSetNX) {
                return result;
            }
            const actionResult = result?.pop();
            const isOk = !!actionResult?.pop();
            if (!isOk) {
                throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_ARGUMENT, "Transaction already started for transactionId: " +
                    data.flow.transactionId);
            }
            return result;
        });
        // Database operations
        if (hasFinished && !retentionTime && !idempotent) {
            await (0, utils_1.promiseAll)([pipelinePromise, this.deleteFromDb(data)]);
        }
        else {
            await (0, utils_1.promiseAll)([pipelinePromise, this.saveToDb(data, retentionTime)]);
        }
    }
    async scheduleRetry(transaction, step, timestamp, interval) {
        await this.queue.add(JobType.RETRY, {
            workflowId: transaction.modelId,
            transactionId: transaction.transactionId,
            transactionMetadata: transaction.getFlow().metadata,
            stepId: step.id,
        }, {
            delay: interval > 0 ? interval * 1000 : undefined,
            jobId: this.getJobId(JobType.RETRY, transaction, step),
            removeOnComplete: true,
        });
    }
    async clearRetry(transaction, step) {
        await this.removeJob(JobType.RETRY, transaction, step);
    }
    async scheduleTransactionTimeout(transaction, _, interval) {
        await this.queue.add(JobType.TRANSACTION_TIMEOUT, {
            workflowId: transaction.modelId,
            transactionId: transaction.transactionId,
            transactionMetadata: transaction.getFlow().metadata,
        }, {
            delay: interval * 1000,
            jobId: this.getJobId(JobType.TRANSACTION_TIMEOUT, transaction),
            removeOnComplete: true,
        });
    }
    async clearTransactionTimeout(transaction) {
        await this.removeJob(JobType.TRANSACTION_TIMEOUT, transaction);
    }
    async scheduleStepTimeout(transaction, step, timestamp, interval) {
        await this.queue.add(JobType.STEP_TIMEOUT, {
            workflowId: transaction.modelId,
            transactionId: transaction.transactionId,
            transactionMetadata: transaction.getFlow().metadata,
            stepId: step.id,
        }, {
            delay: interval * 1000,
            jobId: this.getJobId(JobType.STEP_TIMEOUT, transaction, step),
            removeOnComplete: true,
        });
    }
    async clearStepTimeout(transaction, step) {
        await this.removeJob(JobType.STEP_TIMEOUT, transaction, step);
    }
    getJobId(type, transaction, step) {
        const key = [type, transaction.modelId, transaction.transactionId];
        if (step) {
            key.push(step.id, step.attempts + "");
            if (step.isCompensating()) {
                key.push("compensate");
            }
        }
        return key.join(":");
    }
    async removeJob(type, transaction, step) {
        const jobId = this.getJobId(type, transaction, step);
        if (type === JobType.SCHEDULE) {
            const job = await this.jobQueue?.getJob(jobId);
            if (job) {
                await job.remove();
            }
        }
        else {
            const job = await this.queue.getJob(jobId);
            if (job && job.attemptsStarted === 0) {
                await job.remove();
            }
        }
    }
    /* Scheduler storage methods */
    async schedule(jobDefinition, schedulerOptions) {
        const jobId = typeof jobDefinition === "string" ? jobDefinition : jobDefinition.jobId;
        if ("cron" in schedulerOptions && "interval" in schedulerOptions) {
            throw new Error(`Unable to register a job with both scheduler options interval and cron.`);
        }
        const repeatOptions = {
            limit: schedulerOptions.numberOfExecutions,
            key: `${JobType.SCHEDULE}_${jobId}`,
        };
        if ("cron" in schedulerOptions) {
            repeatOptions.pattern = schedulerOptions.cron;
        }
        else {
            repeatOptions.every = schedulerOptions.interval;
        }
        // If it is the same key (eg. the same workflow name), the old one will get overridden.
        await this.jobQueue?.add(JobType.SCHEDULE, {
            jobId,
            schedulerOptions,
        }, {
            repeat: repeatOptions,
            removeOnComplete: {
                age: 86400,
                count: 1000,
            },
            removeOnFail: {
                age: 604800,
                count: 5000,
            },
        });
    }
    async remove(jobId) {
        await this.jobQueue?.removeRepeatableByKey(`${JobType.SCHEDULE}_${jobId}`);
    }
    async removeAll() {
        return await this.removeAllRepeatableJobs(this.jobQueue);
    }
    async removeAllRepeatableJobs(queue) {
        const repeatableJobs = (await queue.getRepeatableJobs()) ?? [];
        await (0, utils_1.promiseAll)(repeatableJobs.map((job) => queue.removeRepeatableByKey(job.key)));
    }
}
exports.RedisDistributedTransactionStorage = RedisDistributedTransactionStorage;
_RedisDistributedTransactionStorage_isWorkerMode = new WeakMap(), _RedisDistributedTransactionStorage_instances = new WeakSet(), _RedisDistributedTransactionStorage_preventRaceConditionExecutionIfNecessary = async function _RedisDistributedTransactionStorage_preventRaceConditionExecutionIfNecessary({ data, key, options, }) {
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
        ? -1
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