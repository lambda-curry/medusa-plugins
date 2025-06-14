import { DistributedTransactionEvents, DistributedTransactionType, TransactionStep } from "@medusajs/framework/orchestration";
import { ContainerLike, Context, MedusaContainer } from "@medusajs/framework/types";
import { type FlowRunOptions, ReturnWorkflow } from "@medusajs/framework/workflows-sdk";
import { WorkflowOrchestratorCancelOptions } from "../types";
import { InMemoryDistributedTransactionStorage } from "../utils";
export type WorkflowOrchestratorRunOptions<T> = Omit<FlowRunOptions<T>, "container"> & {
    transactionId?: string;
    runId?: string;
    container?: ContainerLike;
};
type RegisterStepSuccessOptions<T> = Omit<WorkflowOrchestratorRunOptions<T>, "transactionId" | "input">;
type IdempotencyKeyParts = {
    workflowId: string;
    transactionId: string;
    stepId: string;
    action: "invoke" | "compensate";
};
type NotifyOptions = {
    eventType: keyof DistributedTransactionEvents;
    workflowId: string;
    transactionId?: string;
    step?: TransactionStep;
    response?: unknown;
    result?: unknown;
    errors?: unknown[];
};
type SubscriberHandler = {
    (input: NotifyOptions): void;
} & {
    _id?: string;
};
type SubscribeOptions = {
    workflowId: string;
    transactionId?: string;
    subscriber: SubscriberHandler;
    subscriberId?: string;
};
type UnsubscribeOptions = {
    workflowId: string;
    transactionId?: string;
    subscriberOrId: string | SubscriberHandler;
};
export declare class WorkflowOrchestratorService {
    private subscribers;
    private container_;
    constructor({ inMemoryDistributedTransactionStorage, sharedContainer, }: {
        inMemoryDistributedTransactionStorage: InMemoryDistributedTransactionStorage;
        workflowOrchestratorService: WorkflowOrchestratorService;
        sharedContainer: MedusaContainer;
    });
    private triggerParentStep;
    run<T = unknown>(workflowIdOrWorkflow: string | ReturnWorkflow<any, any, any>, options?: WorkflowOrchestratorRunOptions<T>): Promise<any>;
    cancel(workflowIdOrWorkflow: string | ReturnWorkflow<any, any, any>, options?: WorkflowOrchestratorCancelOptions): Promise<any>;
    getRunningTransaction(workflowId: string, transactionId: string, context?: Context): Promise<DistributedTransactionType>;
    setStepSuccess<T = unknown>({ idempotencyKey, stepResponse, options, }: {
        idempotencyKey: string | IdempotencyKeyParts;
        stepResponse: unknown;
        options?: RegisterStepSuccessOptions<T>;
    }): Promise<any>;
    setStepFailure<T = unknown>({ idempotencyKey, stepResponse, options, }: {
        idempotencyKey: string | IdempotencyKeyParts;
        stepResponse: unknown;
        options?: RegisterStepSuccessOptions<T>;
    }): Promise<any>;
    subscribe({ workflowId, transactionId, subscriber, subscriberId, }: SubscribeOptions): void;
    unsubscribe({ workflowId, transactionId, subscriberOrId, }: UnsubscribeOptions): void;
    private notify;
    private buildWorkflowEvents;
    private buildIdempotencyKeyAndParts;
}
export {};
//# sourceMappingURL=workflow-orchestrator.d.ts.map