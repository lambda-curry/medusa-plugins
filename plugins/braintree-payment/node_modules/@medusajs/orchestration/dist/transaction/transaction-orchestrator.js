"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionOrchestrator = void 0;
const ulid_1 = require("ulid");
const distributed_transaction_1 = require("./distributed-transaction");
const transaction_step_1 = require("./transaction-step");
const types_1 = require("./types");
const utils_1 = require("@medusajs/utils");
const events_1 = require("events");
const errors_1 = require("./errors");
/**
 * @class TransactionOrchestrator is responsible for managing and executing distributed transactions.
 * It is based on a single transaction definition, which is used to execute all the transaction steps
 */
class TransactionOrchestrator extends events_1.EventEmitter {
    static getWorkflowOptions(modelId) {
        return TransactionOrchestrator.workflowOptions[modelId];
    }
    constructor({ id, definition, options, isClone, }) {
        super();
        this.invokeSteps = [];
        this.compensateSteps = [];
        this.id = id;
        this.definition = definition;
        this.options = options;
        if (!isClone) {
            this.parseFlowOptions();
        }
    }
    static clone(orchestrator) {
        return new TransactionOrchestrator({
            id: orchestrator.id,
            definition: orchestrator.definition,
            options: orchestrator.options,
            isClone: true,
        });
    }
    static getKeyName(...params) {
        return params.join(this.SEPARATOR);
    }
    getPreviousStep(flow, step) {
        const id = step.id.split(".");
        id.pop();
        const parentId = id.join(".");
        return flow.steps[parentId];
    }
    getOptions() {
        return this.options ?? {};
    }
    getInvokeSteps(flow) {
        if (this.invokeSteps.length) {
            return this.invokeSteps;
        }
        const steps = Object.keys(flow.steps);
        steps.sort((a, b) => flow.steps[a].depth - flow.steps[b].depth);
        this.invokeSteps = steps;
        return steps;
    }
    getCompensationSteps(flow) {
        if (this.compensateSteps.length) {
            return this.compensateSteps;
        }
        const steps = Object.keys(flow.steps);
        steps.sort((a, b) => (flow.steps[b].depth || 0) - (flow.steps[a].depth || 0));
        this.compensateSteps = steps;
        return steps;
    }
    canMoveForward(flow, previousStep) {
        const states = [
            utils_1.TransactionStepState.DONE,
            utils_1.TransactionStepState.FAILED,
            utils_1.TransactionStepState.TIMEOUT,
            utils_1.TransactionStepState.SKIPPED,
            utils_1.TransactionStepState.SKIPPED_FAILURE,
        ];
        const siblings = this.getPreviousStep(flow, previousStep).next.map((sib) => flow.steps[sib]);
        return (!!previousStep.definition.noWait ||
            siblings.every((sib) => states.includes(sib.invoke.state)));
    }
    canMoveBackward(flow, step) {
        const states = [
            utils_1.TransactionStepState.DONE,
            utils_1.TransactionStepState.REVERTED,
            utils_1.TransactionStepState.FAILED,
            utils_1.TransactionStepState.DORMANT,
            utils_1.TransactionStepState.SKIPPED,
        ];
        const siblings = step.next.map((sib) => flow.steps[sib]);
        return (siblings.length === 0 ||
            siblings.every((sib) => states.includes(sib.compensate.state)));
    }
    canContinue(flow, step) {
        if (flow.state == types_1.TransactionState.COMPENSATING) {
            return this.canMoveBackward(flow, step);
        }
        else {
            const previous = this.getPreviousStep(flow, step);
            if (previous.id === TransactionOrchestrator.ROOT_STEP) {
                return true;
            }
            return this.canMoveForward(flow, previous);
        }
    }
    hasExpired({ transaction, step, }, dateNow) {
        const hasStepTimedOut = step &&
            step.hasTimeout() &&
            !step.isCompensating() &&
            dateNow > step.startedAt + step.getTimeout() * 1e3;
        const hasTransactionTimedOut = transaction &&
            transaction.hasTimeout() &&
            transaction.getFlow().state !== types_1.TransactionState.COMPENSATING &&
            dateNow >
                transaction.getFlow().startedAt + transaction.getTimeout() * 1e3;
        return !!hasStepTimedOut || !!hasTransactionTimedOut;
    }
    async checkTransactionTimeout(transaction, currentSteps) {
        const flow = transaction.getFlow();
        let hasTimedOut = false;
        if (!flow.timedOutAt && this.hasExpired({ transaction }, Date.now())) {
            flow.timedOutAt = Date.now();
            void transaction.clearTransactionTimeout();
            for (const step of currentSteps) {
                await TransactionOrchestrator.setStepTimeout(transaction, step, new errors_1.TransactionTimeoutError());
            }
            this.emit(types_1.DistributedTransactionEvent.TIMEOUT, { transaction });
            hasTimedOut = true;
        }
        return hasTimedOut;
    }
    async checkStepTimeout(transaction, step) {
        let hasTimedOut = false;
        if (!step.timedOutAt &&
            step.canCancel() &&
            this.hasExpired({ step }, Date.now())) {
            step.timedOutAt = Date.now();
            await TransactionOrchestrator.setStepTimeout(transaction, step, new errors_1.TransactionStepTimeoutError());
            hasTimedOut = true;
            this.emit(types_1.DistributedTransactionEvent.TIMEOUT, { transaction });
        }
        return hasTimedOut;
    }
    async checkAllSteps(transaction) {
        const flow = transaction.getFlow();
        const result = await this.computeCurrentTransactionState(transaction);
        // Handle state transitions and emit events
        if (flow.state === types_1.TransactionState.WAITING_TO_COMPENSATE &&
            result.next.length === 0 &&
            !flow.hasWaitingSteps) {
            flow.state = types_1.TransactionState.COMPENSATING;
            this.flagStepsToRevert(flow);
            this.emit(types_1.DistributedTransactionEvent.COMPENSATE_BEGIN, { transaction });
            return await this.checkAllSteps(transaction);
        }
        else if (result.completed === result.total) {
            if (result.hasSkippedOnFailure) {
                flow.hasSkippedOnFailureSteps = true;
            }
            if (result.hasSkipped) {
                flow.hasSkippedSteps = true;
            }
            if (result.hasIgnoredFailure) {
                flow.hasFailedSteps = true;
            }
            if (result.hasFailed) {
                flow.state = types_1.TransactionState.FAILED;
            }
            else {
                flow.state = result.hasReverted
                    ? types_1.TransactionState.REVERTED
                    : types_1.TransactionState.DONE;
            }
        }
        return {
            current: result.current,
            next: result.next,
            total: result.total,
            remaining: result.total - result.completed,
            completed: result.completed,
        };
    }
    async computeCurrentTransactionState(transaction) {
        let hasSkipped = false;
        let hasSkippedOnFailure = false;
        let hasIgnoredFailure = false;
        let hasFailed = false;
        let hasWaiting = false;
        let hasReverted = false;
        let completedSteps = 0;
        const flow = transaction.getFlow();
        const nextSteps = [];
        const currentSteps = [];
        const allSteps = flow.state === types_1.TransactionState.COMPENSATING
            ? this.getCompensationSteps(flow)
            : this.getInvokeSteps(flow);
        for (const step of allSteps) {
            if (step === TransactionOrchestrator.ROOT_STEP ||
                !this.canContinue(flow, flow.steps[step])) {
                continue;
            }
            const stepDef = flow.steps[step];
            const curState = stepDef.getStates();
            const hasTimedOut = await this.checkStepTimeout(transaction, stepDef);
            if (hasTimedOut) {
                continue;
            }
            if (curState.status === types_1.TransactionStepStatus.WAITING) {
                currentSteps.push(stepDef);
                hasWaiting = true;
                if (stepDef.hasAwaitingRetry()) {
                    if (stepDef.canRetryAwaiting()) {
                        stepDef.retryRescheduledAt = null;
                        nextSteps.push(stepDef);
                    }
                    else if (!stepDef.retryRescheduledAt) {
                        stepDef.hasScheduledRetry = true;
                        stepDef.retryRescheduledAt = Date.now();
                        await transaction.scheduleRetry(stepDef, stepDef.definition.retryIntervalAwaiting);
                    }
                }
                continue;
            }
            else if (curState.status === types_1.TransactionStepStatus.TEMPORARY_FAILURE) {
                currentSteps.push(stepDef);
                if (!stepDef.canRetry()) {
                    if (stepDef.hasRetryInterval() && !stepDef.retryRescheduledAt) {
                        stepDef.hasScheduledRetry = true;
                        stepDef.retryRescheduledAt = Date.now();
                        await transaction.scheduleRetry(stepDef, stepDef.definition.retryInterval);
                    }
                    continue;
                }
                stepDef.retryRescheduledAt = null;
            }
            if (stepDef.canInvoke(flow.state) || stepDef.canCompensate(flow.state)) {
                nextSteps.push(stepDef);
            }
            else {
                completedSteps++;
                if (curState.state === utils_1.TransactionStepState.SKIPPED_FAILURE) {
                    hasSkippedOnFailure = true;
                }
                else if (curState.state === utils_1.TransactionStepState.SKIPPED) {
                    hasSkipped = true;
                }
                else if (curState.state === utils_1.TransactionStepState.REVERTED) {
                    hasReverted = true;
                }
                else if (curState.state === utils_1.TransactionStepState.FAILED) {
                    if (stepDef.definition.continueOnPermanentFailure ||
                        stepDef.definition.skipOnPermanentFailure) {
                        hasIgnoredFailure = true;
                    }
                    else {
                        hasFailed = true;
                    }
                }
            }
        }
        flow.hasWaitingSteps = hasWaiting;
        flow.hasRevertedSteps = hasReverted;
        return {
            current: currentSteps,
            next: nextSteps,
            total: allSteps.length - 1,
            completed: completedSteps,
            hasSkipped,
            hasSkippedOnFailure,
            hasIgnoredFailure,
            hasFailed,
            hasWaiting,
            hasReverted,
        };
    }
    flagStepsToRevert(flow) {
        for (const step in flow.steps) {
            if (step === TransactionOrchestrator.ROOT_STEP) {
                continue;
            }
            const stepDef = flow.steps[step];
            const curState = stepDef.getStates();
            if ([utils_1.TransactionStepState.DONE, utils_1.TransactionStepState.TIMEOUT].includes(curState.state) ||
                curState.status === types_1.TransactionStepStatus.PERMANENT_FAILURE) {
                stepDef.beginCompensation();
                stepDef.changeState(utils_1.TransactionStepState.NOT_STARTED);
            }
        }
    }
    static async setStepSuccess(transaction, step, response) {
        const hasStepTimedOut = step.getStates().state === utils_1.TransactionStepState.TIMEOUT;
        if (step.saveResponse) {
            transaction.addResponse(step.definition.action, step.isCompensating()
                ? types_1.TransactionHandlerType.COMPENSATE
                : types_1.TransactionHandlerType.INVOKE, response);
        }
        if (!hasStepTimedOut) {
            step.changeStatus(types_1.TransactionStepStatus.OK);
        }
        if (step.isCompensating()) {
            step.changeState(utils_1.TransactionStepState.REVERTED);
        }
        else if (!hasStepTimedOut) {
            step.changeState(utils_1.TransactionStepState.DONE);
        }
        let shouldEmit = true;
        let transactionIsCancelling = false;
        try {
            await transaction.saveCheckpoint();
        }
        catch (error) {
            if (!errors_1.SkipCancelledExecutionError.isSkipCancelledExecutionError(error) &&
                !errors_1.SkipExecutionError.isSkipExecutionError(error)) {
                throw error;
            }
            transactionIsCancelling =
                errors_1.SkipCancelledExecutionError.isSkipCancelledExecutionError(error);
            shouldEmit = !errors_1.SkipExecutionError.isSkipExecutionError(error);
        }
        const cleaningUp = [];
        if (step.hasRetryScheduled()) {
            cleaningUp.push(transaction.clearRetry(step));
        }
        if (step.hasTimeout()) {
            cleaningUp.push(transaction.clearStepTimeout(step));
        }
        await (0, utils_1.promiseAll)(cleaningUp);
        if (shouldEmit) {
            const eventName = step.isCompensating()
                ? types_1.DistributedTransactionEvent.COMPENSATE_STEP_SUCCESS
                : types_1.DistributedTransactionEvent.STEP_SUCCESS;
            transaction.emit(eventName, { step, transaction });
        }
        return {
            stopExecution: !shouldEmit,
            transactionIsCancelling,
        };
    }
    static async skipStep({ transaction, step, }) {
        const hasStepTimedOut = step.getStates().state === utils_1.TransactionStepState.TIMEOUT;
        if (!hasStepTimedOut) {
            step.changeStatus(types_1.TransactionStepStatus.OK);
            step.changeState(utils_1.TransactionStepState.SKIPPED);
        }
        let shouldEmit = true;
        let transactionIsCancelling = false;
        try {
            await transaction.saveCheckpoint();
        }
        catch (error) {
            if (!errors_1.SkipCancelledExecutionError.isSkipCancelledExecutionError(error) &&
                !errors_1.SkipExecutionError.isSkipExecutionError(error)) {
                throw error;
            }
            transactionIsCancelling =
                errors_1.SkipCancelledExecutionError.isSkipCancelledExecutionError(error);
            if (errors_1.SkipExecutionError.isSkipExecutionError(error)) {
                shouldEmit = false;
            }
        }
        const cleaningUp = [];
        if (step.hasRetryScheduled()) {
            cleaningUp.push(transaction.clearRetry(step));
        }
        if (step.hasTimeout()) {
            cleaningUp.push(transaction.clearStepTimeout(step));
        }
        await (0, utils_1.promiseAll)(cleaningUp);
        if (shouldEmit) {
            const eventName = types_1.DistributedTransactionEvent.STEP_SKIPPED;
            transaction.emit(eventName, { step, transaction });
        }
        return {
            stopExecution: !shouldEmit,
            transactionIsCancelling,
        };
    }
    static async setStepTimeout(transaction, step, error) {
        if ([
            utils_1.TransactionStepState.TIMEOUT,
            utils_1.TransactionStepState.DONE,
            utils_1.TransactionStepState.REVERTED,
        ].includes(step.getStates().state)) {
            return;
        }
        step.changeState(utils_1.TransactionStepState.TIMEOUT);
        if (error?.stack) {
            const workflowId = transaction.modelId;
            const stepAction = step.definition.action;
            const sourcePath = transaction.getFlow().metadata?.sourcePath;
            const sourceStack = sourcePath
                ? `\n⮑ \sat ${sourcePath}: [${workflowId} -> ${stepAction} (${types_1.TransactionHandlerType.INVOKE})]`
                : `\n⮑ \sat [${workflowId} -> ${stepAction} (${types_1.TransactionHandlerType.INVOKE})]`;
            error.stack += sourceStack;
        }
        transaction.addError(step.definition.action, types_1.TransactionHandlerType.INVOKE, error);
        await TransactionOrchestrator.setStepFailure(transaction, step, undefined, 0, true, error);
        await transaction.clearStepTimeout(step);
    }
    static async setStepFailure(transaction, step, error, maxRetries = TransactionOrchestrator.DEFAULT_RETRIES, isTimeout = false, timeoutError) {
        if (errors_1.SkipExecutionError.isSkipExecutionError(error)) {
            return {
                stopExecution: false,
            };
        }
        step.failures++;
        if ((0, utils_1.isErrorLike)(error)) {
            error = (0, utils_1.serializeError)(error);
        }
        if (!isTimeout &&
            step.getStates().status !== types_1.TransactionStepStatus.PERMANENT_FAILURE) {
            step.changeStatus(types_1.TransactionStepStatus.TEMPORARY_FAILURE);
        }
        const flow = transaction.getFlow();
        const cleaningUp = [];
        const hasTimedOut = step.getStates().state === utils_1.TransactionStepState.TIMEOUT;
        if (step.failures > maxRetries || hasTimedOut) {
            if (!hasTimedOut) {
                step.changeState(utils_1.TransactionStepState.FAILED);
            }
            step.changeStatus(types_1.TransactionStepStatus.PERMANENT_FAILURE);
            if (!isTimeout) {
                const handlerType = step.isCompensating()
                    ? types_1.TransactionHandlerType.COMPENSATE
                    : types_1.TransactionHandlerType.INVOKE;
                if (error?.stack) {
                    const workflowId = transaction.modelId;
                    const stepAction = step.definition.action;
                    const sourcePath = transaction.getFlow().metadata?.sourcePath;
                    const sourceStack = sourcePath
                        ? `\n⮑ \sat ${sourcePath}: [${workflowId} -> ${stepAction} (${types_1.TransactionHandlerType.INVOKE})]`
                        : `\n⮑ \sat [${workflowId} -> ${stepAction} (${types_1.TransactionHandlerType.INVOKE})]`;
                    error.stack += sourceStack;
                }
                transaction.addError(step.definition.action, handlerType, error);
            }
            if (!step.isCompensating()) {
                if ((step.definition.continueOnPermanentFailure ||
                    step.definition.skipOnPermanentFailure) &&
                    !errors_1.TransactionTimeoutError.isTransactionTimeoutError(timeoutError)) {
                    if (step.definition.skipOnPermanentFailure) {
                        const until = (0, utils_1.isString)(step.definition.skipOnPermanentFailure)
                            ? step.definition.skipOnPermanentFailure
                            : undefined;
                        let stepsToSkip = [...step.next];
                        while (stepsToSkip.length > 0) {
                            const currentStep = flow.steps[stepsToSkip.shift()];
                            if (until && currentStep.definition.action === until) {
                                break;
                            }
                            currentStep.changeState(utils_1.TransactionStepState.SKIPPED_FAILURE);
                            if (currentStep.next?.length > 0) {
                                stepsToSkip = stepsToSkip.concat(currentStep.next);
                            }
                        }
                    }
                }
                else {
                    flow.state = types_1.TransactionState.WAITING_TO_COMPENSATE;
                }
            }
            if (step.hasTimeout()) {
                cleaningUp.push(transaction.clearStepTimeout(step));
            }
        }
        let transactionIsCancelling = false;
        let shouldEmit = true;
        try {
            await transaction.saveCheckpoint();
        }
        catch (error) {
            if (!errors_1.SkipCancelledExecutionError.isSkipCancelledExecutionError(error) &&
                !errors_1.SkipExecutionError.isSkipExecutionError(error)) {
                throw error;
            }
            transactionIsCancelling =
                errors_1.SkipCancelledExecutionError.isSkipCancelledExecutionError(error);
            if (errors_1.SkipExecutionError.isSkipExecutionError(error)) {
                shouldEmit = false;
            }
        }
        if (step.hasRetryScheduled()) {
            cleaningUp.push(transaction.clearRetry(step));
        }
        await (0, utils_1.promiseAll)(cleaningUp);
        if (shouldEmit) {
            const eventName = step.isCompensating()
                ? types_1.DistributedTransactionEvent.COMPENSATE_STEP_FAILURE
                : types_1.DistributedTransactionEvent.STEP_FAILURE;
            transaction.emit(eventName, { step, transaction });
        }
        return {
            stopExecution: !shouldEmit,
            transactionIsCancelling,
        };
    }
    async executeNext(transaction) {
        let continueExecution = true;
        while (continueExecution) {
            if (transaction.hasFinished()) {
                return;
            }
            const flow = transaction.getFlow();
            const nextSteps = await this.checkAllSteps(transaction);
            if (await this.checkTransactionTimeout(transaction, nextSteps.current)) {
                continue;
            }
            if (nextSteps.remaining === 0) {
                await this.finalizeTransaction(transaction);
                return;
            }
            const stepsShouldContinueExecution = nextSteps.next.map((step) => {
                const { shouldContinueExecution } = this.prepareStepForExecution(step, flow);
                return shouldContinueExecution;
            });
            await transaction.saveCheckpoint().catch((error) => {
                if (errors_1.SkipExecutionError.isSkipExecutionError(error)) {
                    continueExecution = false;
                    return;
                }
                throw error;
            });
            const execution = [];
            let i = 0;
            for (const step of nextSteps.next) {
                const stepIndex = i++;
                if (!stepsShouldContinueExecution[stepIndex]) {
                    continue;
                }
                if (step.hasTimeout() && !step.timedOutAt && step.attempts === 1) {
                    await transaction.scheduleStepTimeout(step, step.definition.timeout);
                }
                transaction.emit(types_1.DistributedTransactionEvent.STEP_BEGIN, {
                    step,
                    transaction,
                });
                const isAsync = step.isCompensating()
                    ? step.definition.compensateAsync
                    : step.definition.async;
                // Compute current transaction state
                await this.computeCurrentTransactionState(transaction);
                if (!continueExecution) {
                    break;
                }
                const promise = this.createStepExecutionPromise(transaction, step);
                if (!isAsync) {
                    execution.push(this.executeSyncStep(promise, transaction, step, nextSteps));
                }
                else {
                    // Execute async step in background and continue the execution of the transaction
                    this.executeAsyncStep(promise, transaction, step, nextSteps);
                }
            }
            await (0, utils_1.promiseAll)(execution);
            if (nextSteps.next.length === 0) {
                continueExecution = false;
            }
        }
    }
    /**
     * Finalize the transaction when all steps are complete
     */
    async finalizeTransaction(transaction) {
        if (transaction.hasTimeout()) {
            void transaction.clearTransactionTimeout();
        }
        await transaction.saveCheckpoint().catch((error) => {
            if (!errors_1.SkipExecutionError.isSkipExecutionError(error)) {
                throw error;
            }
        });
        this.emit(types_1.DistributedTransactionEvent.FINISH, { transaction });
    }
    /**
     * Prepare a step for execution by setting state and incrementing attempts
     */
    prepareStepForExecution(step, flow) {
        const curState = step.getStates();
        step.lastAttempt = Date.now();
        step.attempts++;
        if (curState.state === utils_1.TransactionStepState.NOT_STARTED) {
            if (!step.startedAt) {
                step.startedAt = Date.now();
            }
            if (step.isCompensating()) {
                step.changeState(utils_1.TransactionStepState.COMPENSATING);
                if (step.definition.noCompensation) {
                    step.changeState(utils_1.TransactionStepState.REVERTED);
                    return { shouldContinueExecution: false };
                }
            }
            else if (flow.state === types_1.TransactionState.INVOKING) {
                step.changeState(utils_1.TransactionStepState.INVOKING);
            }
        }
        step.changeStatus(types_1.TransactionStepStatus.WAITING);
        return { shouldContinueExecution: true };
    }
    /**
     * Create the payload for a step execution
     */
    createStepPayload(transaction, step, flow) {
        const type = step.isCompensating()
            ? types_1.TransactionHandlerType.COMPENSATE
            : types_1.TransactionHandlerType.INVOKE;
        return new distributed_transaction_1.TransactionPayload({
            model_id: flow.modelId,
            idempotency_key: TransactionOrchestrator.getKeyName(flow.modelId, flow.transactionId, step.definition.action, type),
            action: step.definition.action + "",
            action_type: type,
            attempt: step.attempts,
            timestamp: Date.now(),
        }, transaction.payload, transaction.getContext());
    }
    /**
     * Prepare handler arguments for step execution
     */
    prepareHandlerArgs(transaction, step, flow, payload) {
        const type = step.isCompensating()
            ? types_1.TransactionHandlerType.COMPENSATE
            : types_1.TransactionHandlerType.INVOKE;
        return [
            step.definition.action + "",
            type,
            payload,
            transaction,
            step,
            this,
        ];
    }
    /**
     * Create the step execution promise with optional tracing
     */
    createStepExecutionPromise(transaction, step) {
        const type = step.isCompensating()
            ? types_1.TransactionHandlerType.COMPENSATE
            : types_1.TransactionHandlerType.INVOKE;
        const handlerArgs = this.prepareHandlerArgs(transaction, step, transaction.getFlow(), this.createStepPayload(transaction, step, transaction.getFlow()));
        const traceData = {
            action: step.definition.action + "",
            type,
            step_id: step.id,
            step_uuid: step.uuid + "",
            attempts: step.attempts,
            failures: step.failures,
            async: !!(type === "invoke"
                ? step.definition.async
                : step.definition.compensateAsync),
            idempotency_key: handlerArgs[2].metadata.idempotency_key,
        };
        const stepHandler = async () => {
            return await transaction.handler(...handlerArgs);
        };
        // Return the appropriate promise based on tracing configuration
        if (TransactionOrchestrator.traceStep) {
            return () => TransactionOrchestrator.traceStep(stepHandler, traceData);
        }
        else {
            return stepHandler;
        }
    }
    /**
     * Execute a synchronous step and handle its result
     */
    executeSyncStep(promiseFn, transaction, step, nextSteps) {
        return promiseFn()
            .then(async (response) => {
            await this.handleStepExpiration(transaction, step, nextSteps);
            const output = response?.__type ? response.output : response;
            if (errors_1.SkipStepResponse.isSkipStepResponse(output)) {
                await TransactionOrchestrator.skipStep({
                    transaction,
                    step,
                });
                return;
            }
            await this.handleStepSuccess(transaction, step, response);
        })
            .catch(async (error) => {
            if (errors_1.SkipExecutionError.isSkipExecutionError(error)) {
                return;
            }
            const response = error?.getStepResponse?.();
            await this.handleStepExpiration(transaction, step, nextSteps);
            if (errors_1.PermanentStepFailureError.isPermanentStepFailureError(error)) {
                await this.handleStepFailure(transaction, step, error, true, response);
                return;
            }
            await this.handleStepFailure(transaction, step, error, false, response);
        });
    }
    /**
     * Execute an asynchronous step and handle its result
     */
    executeAsyncStep(promiseFn, transaction, step, nextSteps) {
        return promiseFn()
            .then(async (response) => {
            const output = response?.__type ? response.output : response;
            if (errors_1.SkipStepResponse.isSkipStepResponse(output)) {
                await TransactionOrchestrator.skipStep({
                    transaction,
                    step,
                });
                // Schedule to continue the execution of async steps because they are not awaited on purpose and can be handled by another machine
                await transaction.scheduleRetry(step, 0);
                return;
            }
            else {
                if (!step.definition.backgroundExecution || step.definition.nested) {
                    const eventName = types_1.DistributedTransactionEvent.STEP_AWAITING;
                    transaction.emit(eventName, { step, transaction });
                    return;
                }
                await this.handleStepExpiration(transaction, step, nextSteps);
                await this.handleStepSuccess(transaction, step, response);
            }
        })
            .catch(async (error) => {
            if (errors_1.SkipExecutionError.isSkipExecutionError(error)) {
                return;
            }
            const response = error?.getStepResponse?.();
            if (errors_1.PermanentStepFailureError.isPermanentStepFailureError(error)) {
                await this.handleStepFailure(transaction, step, error, true, response);
                return;
            }
            await this.handleStepFailure(transaction, step, error, false, response);
        });
    }
    /**
     * Check if step or transaction has expired and handle timeouts
     */
    async handleStepExpiration(transaction, step, nextSteps) {
        if (this.hasExpired({ transaction, step }, Date.now())) {
            await this.checkStepTimeout(transaction, step);
            await this.checkTransactionTimeout(transaction, nextSteps.next.includes(step) ? nextSteps.next : [step]);
        }
    }
    /**
     * Handle successful step completion
     */
    async handleStepSuccess(transaction, step, response) {
        const isAsync = step.isCompensating()
            ? step.definition.compensateAsync
            : step.definition.async;
        if ((0, utils_1.isDefined)(response) && step.saveResponse && !isAsync) {
            transaction.addResponse(step.definition.action, step.isCompensating()
                ? types_1.TransactionHandlerType.COMPENSATE
                : types_1.TransactionHandlerType.INVOKE, response);
        }
        const ret = await TransactionOrchestrator.setStepSuccess(transaction, step, response);
        if (ret.transactionIsCancelling) {
            return await this.cancelTransaction(transaction);
        }
        if (isAsync && !ret.stopExecution) {
            // Schedule to continue the execution of async steps because they are not awaited on purpose and can be handled by another machine
            await transaction.scheduleRetry(step, 0);
        }
    }
    /**
     * Handle step failure
     */
    async handleStepFailure(transaction, step, error, isPermanent, response) {
        if ((0, utils_1.isDefined)(response) && step.saveResponse) {
            transaction.addResponse(step.definition.action, step.isCompensating()
                ? types_1.TransactionHandlerType.COMPENSATE
                : types_1.TransactionHandlerType.INVOKE, response);
        }
        const ret = await TransactionOrchestrator.setStepFailure(transaction, step, error, isPermanent ? 0 : step.definition.maxRetries);
        if (ret.transactionIsCancelling) {
            return await this.cancelTransaction(transaction);
        }
    }
    /**
     * Start a new transaction or resume a transaction that has been previously started
     * @param transaction - The transaction to resume
     */
    async resume(transaction) {
        if (transaction.modelId !== this.id) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `TransactionModel "${transaction.modelId}" cannot be orchestrated by "${this.id}" model.`);
        }
        if (transaction.hasFinished()) {
            return;
        }
        const executeNext = async () => {
            const flow = transaction.getFlow();
            if (flow.state === types_1.TransactionState.NOT_STARTED) {
                flow.state = types_1.TransactionState.INVOKING;
                flow.startedAt = Date.now();
                await transaction.saveCheckpoint(flow.hasAsyncSteps ? 0 : TransactionOrchestrator.DEFAULT_TTL);
                if (transaction.hasTimeout()) {
                    await transaction.scheduleTransactionTimeout(transaction.getTimeout());
                }
                this.emit(types_1.DistributedTransactionEvent.BEGIN, { transaction });
            }
            else {
                this.emit(types_1.DistributedTransactionEvent.RESUME, { transaction });
            }
            return await this.executeNext(transaction);
        };
        if (TransactionOrchestrator.traceTransaction &&
            !transaction.getFlow().hasAsyncSteps) {
            await TransactionOrchestrator.traceTransaction(executeNext, {
                model_id: transaction.modelId,
                transaction_id: transaction.transactionId,
                flow_metadata: transaction.getFlow().metadata,
            });
            return;
        }
        await executeNext();
    }
    /**
     * Cancel and revert a transaction compensating all its executed steps. It can be an ongoing transaction or a completed one
     * @param transaction - The transaction to be reverted
     */
    async cancelTransaction(transaction) {
        if (transaction.modelId !== this.id) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `TransactionModel "${transaction.modelId}" cannot be orchestrated by "${this.id}" model.`);
        }
        const flow = transaction.getFlow();
        if (flow.state === types_1.TransactionState.FAILED) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `Cannot revert a permanent failed transaction.`);
        }
        flow.state = types_1.TransactionState.WAITING_TO_COMPENSATE;
        flow.cancelledAt = Date.now();
        await transaction.saveCheckpoint();
        await this.executeNext(transaction);
    }
    parseFlowOptions() {
        const [steps, features] = TransactionOrchestrator.buildSteps(this.definition);
        this.options ??= {};
        const hasAsyncSteps = features.hasAsyncSteps;
        const hasStepTimeouts = features.hasStepTimeouts;
        const hasRetriesTimeout = features.hasRetriesTimeout;
        const hasTransactionTimeout = !!this.options.timeout;
        const isIdempotent = !!this.options.idempotent;
        if (hasAsyncSteps) {
            this.options.store = true;
        }
        if (hasStepTimeouts ||
            hasRetriesTimeout ||
            hasTransactionTimeout ||
            isIdempotent ||
            this.options.retentionTime) {
            this.options.store = true;
        }
        const parsedOptions = {
            ...this.options,
            hasAsyncSteps,
            hasStepTimeouts,
            hasRetriesTimeout,
        };
        TransactionOrchestrator.workflowOptions[this.id] = parsedOptions;
        return [steps, features];
    }
    createTransactionFlow(transactionId, flowMetadata) {
        const [steps, features] = TransactionOrchestrator.buildSteps(this.definition);
        const flow = {
            modelId: this.id,
            options: this.options,
            transactionId: transactionId,
            runId: (0, ulid_1.ulid)(),
            metadata: flowMetadata,
            hasAsyncSteps: features.hasAsyncSteps,
            hasFailedSteps: false,
            hasSkippedOnFailureSteps: false,
            hasSkippedSteps: false,
            hasWaitingSteps: false,
            hasRevertedSteps: false,
            timedOutAt: null,
            state: types_1.TransactionState.NOT_STARTED,
            definition: this.definition,
            steps,
        };
        return flow;
    }
    static async loadTransactionById(modelId, transactionId, options) {
        const transaction = await distributed_transaction_1.DistributedTransaction.loadTransaction(modelId, transactionId, options);
        if (transaction !== null) {
            const flow = transaction.flow;
            const [steps] = TransactionOrchestrator.buildSteps(flow.definition, flow.steps);
            transaction.flow.steps = steps;
            return transaction;
        }
        return null;
    }
    static buildSteps(flow, existingSteps) {
        const states = {
            [TransactionOrchestrator.ROOT_STEP]: {
                id: TransactionOrchestrator.ROOT_STEP,
                next: [],
            },
        };
        const actionNames = new Set();
        const queue = [
            { obj: flow, level: [TransactionOrchestrator.ROOT_STEP] },
        ];
        const features = {
            hasAsyncSteps: false,
            hasStepTimeouts: false,
            hasRetriesTimeout: false,
            hasNestedTransactions: false,
        };
        while (queue.length > 0) {
            const { obj, level } = queue.shift();
            if (obj.action) {
                if (actionNames.has(obj.action)) {
                    throw new Error(`Step ${obj.action} is already defined in workflow.`);
                }
                actionNames.add(obj.action);
                level.push(obj.action);
                const id = level.join(".");
                const parent = level.slice(0, level.length - 1).join(".");
                if (!existingSteps || parent === TransactionOrchestrator.ROOT_STEP) {
                    states[parent].next?.push(id);
                }
                const definitionCopy = { ...obj };
                delete definitionCopy.next;
                if (definitionCopy.async) {
                    features.hasAsyncSteps = true;
                }
                if (definitionCopy.timeout) {
                    features.hasStepTimeouts = true;
                }
                if (definitionCopy.retryInterval ||
                    definitionCopy.retryIntervalAwaiting) {
                    features.hasRetriesTimeout = true;
                }
                if (definitionCopy.nested) {
                    features.hasNestedTransactions = true;
                }
                states[id] = Object.assign(new transaction_step_1.TransactionStep(), existingSteps?.[id] || {
                    id,
                    uuid: definitionCopy.uuid,
                    depth: level.length - 1,
                    definition: definitionCopy,
                    saveResponse: definitionCopy.saveResponse ?? true,
                    invoke: {
                        state: utils_1.TransactionStepState.NOT_STARTED,
                        status: types_1.TransactionStepStatus.IDLE,
                    },
                    compensate: {
                        state: utils_1.TransactionStepState.DORMANT,
                        status: types_1.TransactionStepStatus.IDLE,
                    },
                    attempts: 0,
                    failures: 0,
                    lastAttempt: null,
                    next: [],
                });
            }
            if (Array.isArray(obj.next)) {
                for (const next of obj.next) {
                    queue.push({ obj: next, level: [...level] });
                }
            }
            else if ((0, utils_1.isObject)(obj.next)) {
                queue.push({ obj: obj.next, level: [...level] });
            }
        }
        return [states, features];
    }
    /** Create a new transaction
     * @param transactionId - unique identifier of the transaction
     * @param handler - function to handle action of the transaction
     * @param payload - payload to be passed to all the transaction steps
     * @param flowMetadata - flow metadata which can include event group id for example
     */
    async beginTransaction({ transactionId, handler, payload, flowMetadata, onLoad, }) {
        const existingTransaction = await TransactionOrchestrator.loadTransactionById(this.id, transactionId);
        let newTransaction = false;
        let modelFlow;
        if (!existingTransaction) {
            modelFlow = this.createTransactionFlow(transactionId, flowMetadata);
            newTransaction = true;
        }
        else {
            modelFlow = existingTransaction.flow;
        }
        const transaction = new distributed_transaction_1.DistributedTransaction(modelFlow, handler, payload, existingTransaction?.errors, existingTransaction?.context);
        if (newTransaction && this.getOptions().store) {
            await transaction.saveCheckpoint(modelFlow.hasAsyncSteps ? 0 : TransactionOrchestrator.DEFAULT_TTL);
        }
        if (onLoad) {
            await onLoad(transaction);
        }
        return transaction;
    }
    /** Returns an existing transaction
     * @param transactionId - unique identifier of the transaction
     * @param handler - function to handle action of the transaction
     */
    async retrieveExistingTransaction(transactionId, handler, options) {
        const existingTransaction = await TransactionOrchestrator.loadTransactionById(this.id, transactionId, { isCancelling: options?.isCancelling });
        if (!existingTransaction) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Transaction ${transactionId} could not be found.`);
        }
        const transaction = new distributed_transaction_1.DistributedTransaction(existingTransaction.flow, handler, undefined, existingTransaction?.errors, existingTransaction?.context);
        return transaction;
    }
    static getStepByAction(flow, action) {
        for (const key in flow.steps) {
            if (action === flow.steps[key]?.definition?.action) {
                return flow.steps[key];
            }
        }
        return null;
    }
    static async getTransactionAndStepFromIdempotencyKey(responseIdempotencyKey, handler, transaction) {
        const [modelId, transactionId, action, actionType] = responseIdempotencyKey.split(TransactionOrchestrator.SEPARATOR);
        if (!transaction && !handler) {
            throw new Error("If a transaction is not provided, the handler is required");
        }
        if (!transaction) {
            const existingTransaction = await TransactionOrchestrator.loadTransactionById(modelId, transactionId);
            if (existingTransaction === null) {
                throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Transaction ${transactionId} could not be found.`);
            }
            transaction = new distributed_transaction_1.DistributedTransaction(existingTransaction.flow, handler, undefined, existingTransaction.errors, existingTransaction.context);
        }
        const step = TransactionOrchestrator.getStepByAction(transaction.getFlow(), action);
        if (step === null) {
            throw new Error("Action not found.");
        }
        else if (step.isCompensating()
            ? actionType !== types_1.TransactionHandlerType.COMPENSATE
            : actionType !== types_1.TransactionHandlerType.INVOKE) {
            throw new Error("Incorrect action type.");
        }
        return [transaction, step];
    }
    /** Skip the execution of a specific transaction and step
     * @param responseIdempotencyKey - The idempotency key for the step
     * @param handler - The handler function to execute the step
     * @param transaction - The current transaction. If not provided it will be loaded based on the responseIdempotencyKey
     */
    async skipStep({ responseIdempotencyKey, handler, transaction, }) {
        const [curTransaction, step] = await TransactionOrchestrator.getTransactionAndStepFromIdempotencyKey(responseIdempotencyKey, handler, transaction);
        if (step.getStates().status === types_1.TransactionStepStatus.WAITING) {
            this.emit(types_1.DistributedTransactionEvent.RESUME, {
                transaction: curTransaction,
            });
            await TransactionOrchestrator.skipStep({
                transaction: curTransaction,
                step,
            });
            await this.executeNext(curTransaction);
        }
        else {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `Cannot skip a step when status is ${step.getStates().status}`);
        }
        return curTransaction;
    }
    /** Register a step success for a specific transaction and step
     * @param responseIdempotencyKey - The idempotency key for the step
     * @param handler - The handler function to execute the step
     * @param transaction - The current transaction. If not provided it will be loaded based on the responseIdempotencyKey
     * @param response - The response of the step
     */
    async registerStepSuccess({ responseIdempotencyKey, handler, transaction, response, onLoad, }) {
        const [curTransaction, step] = await TransactionOrchestrator.getTransactionAndStepFromIdempotencyKey(responseIdempotencyKey, handler, transaction);
        if (onLoad) {
            await onLoad(curTransaction);
        }
        if (step.getStates().status === types_1.TransactionStepStatus.WAITING) {
            this.emit(types_1.DistributedTransactionEvent.RESUME, {
                transaction: curTransaction,
            });
            const ret = await TransactionOrchestrator.setStepSuccess(curTransaction, step, response);
            if (ret.transactionIsCancelling) {
                await this.cancelTransaction(curTransaction);
                return curTransaction;
            }
            await this.executeNext(curTransaction);
        }
        else {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `Cannot set step success when status is ${step.getStates().status}`);
        }
        return curTransaction;
    }
    /**
     * Register a step failure for a specific transaction and step
     * @param responseIdempotencyKey - The idempotency key for the step
     * @param error - The error that caused the failure
     * @param handler - The handler function to execute the step
     * @param transaction - The current transaction
     * @param response - The response of the step
     */
    async registerStepFailure({ responseIdempotencyKey, error, handler, transaction, onLoad, }) {
        const [curTransaction, step] = await TransactionOrchestrator.getTransactionAndStepFromIdempotencyKey(responseIdempotencyKey, handler, transaction);
        if (onLoad) {
            await onLoad(curTransaction);
        }
        if (step.getStates().status === types_1.TransactionStepStatus.WAITING) {
            this.emit(types_1.DistributedTransactionEvent.RESUME, {
                transaction: curTransaction,
            });
            const ret = await TransactionOrchestrator.setStepFailure(curTransaction, step, error, 0);
            if (ret.transactionIsCancelling) {
                await this.cancelTransaction(curTransaction);
                return curTransaction;
            }
            await this.executeNext(curTransaction);
        }
        else {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `Cannot set step failure when status is ${step.getStates().status}`);
        }
        return curTransaction;
    }
}
exports.TransactionOrchestrator = TransactionOrchestrator;
TransactionOrchestrator.ROOT_STEP = "_root";
TransactionOrchestrator.DEFAULT_TTL = 30;
TransactionOrchestrator.DEFAULT_RETRIES = 0;
TransactionOrchestrator.workflowOptions = {};
TransactionOrchestrator.SEPARATOR = ":";
//# sourceMappingURL=transaction-orchestrator.js.map