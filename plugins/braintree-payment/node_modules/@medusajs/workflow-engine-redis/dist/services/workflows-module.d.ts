import { Context, DAL, FilterableWorkflowExecutionProps, FindConfig, InferEntityType, InternalModuleDeclaration, ModulesSdkTypes, WorkflowExecutionDTO, WorkflowsSdkTypes } from "@medusajs/framework/types";
import { ModulesSdkUtils } from "@medusajs/framework/utils";
import type { ReturnWorkflow, UnwrapWorkflowInputDataType } from "@medusajs/framework/workflows-sdk";
import { SqlEntityManager } from "@mikro-orm/postgresql";
import { WorkflowExecution } from "../models";
import { WorkflowOrchestratorCancelOptions, WorkflowOrchestratorService } from ".";
type InjectedDependencies = {
    manager: SqlEntityManager;
    baseRepository: DAL.RepositoryService;
    workflowExecutionService: ModulesSdkTypes.IMedusaInternalService<any>;
    workflowOrchestratorService: WorkflowOrchestratorService;
    redisDisconnectHandler: () => Promise<void>;
};
declare const WorkflowsModuleService_base: ModulesSdkUtils.MedusaServiceReturnType<{
    WorkflowExecution: {
        dto: InferEntityType<typeof WorkflowExecution>;
    };
}>;
export declare class WorkflowsModuleService<TWorkflowExecution extends InferEntityType<typeof WorkflowExecution> = InferEntityType<typeof WorkflowExecution>> extends WorkflowsModuleService_base {
    protected readonly moduleDeclaration: InternalModuleDeclaration;
    protected baseRepository_: DAL.RepositoryService;
    protected workflowExecutionService_: ModulesSdkTypes.IMedusaInternalService<TWorkflowExecution>;
    protected workflowOrchestratorService_: WorkflowOrchestratorService;
    protected redisDisconnectHandler_: () => Promise<void>;
    protected manager_: SqlEntityManager;
    private clearTimeout_;
    constructor({ manager, baseRepository, workflowExecutionService, workflowOrchestratorService, redisDisconnectHandler, }: InjectedDependencies, moduleDeclaration: InternalModuleDeclaration);
    __hooks: {
        onApplicationStart: () => Promise<void>;
        onApplicationPrepareShutdown: () => Promise<void>;
        onApplicationShutdown: () => Promise<void>;
    };
    static prepareFilters<T>(filters: T & {
        q?: string;
    }): (T & {
        q?: string;
    }) | {
        $or: ({
            transaction_id: {
                $ilike: string;
            };
            workflow_id?: undefined;
            state?: undefined;
            execution?: undefined;
        } | {
            workflow_id: {
                $ilike: string;
            };
            transaction_id?: undefined;
            state?: undefined;
            execution?: undefined;
        } | {
            state: {
                $ilike: string;
            };
            transaction_id?: undefined;
            workflow_id?: undefined;
            execution?: undefined;
        } | {
            execution: {
                runId: {
                    $ilike: string;
                };
            };
            transaction_id?: undefined;
            workflow_id?: undefined;
            state?: undefined;
        })[];
    } | {
        $and: ((T & {
            q?: string;
        }) | {
            $or: ({
                transaction_id: {
                    $ilike: string;
                };
                workflow_id?: undefined;
                state?: undefined;
                execution?: undefined;
            } | {
                workflow_id: {
                    $ilike: string;
                };
                transaction_id?: undefined;
                state?: undefined;
                execution?: undefined;
            } | {
                state: {
                    $ilike: string;
                };
                transaction_id?: undefined;
                workflow_id?: undefined;
                execution?: undefined;
            } | {
                execution: {
                    runId: {
                        $ilike: string;
                    };
                };
                transaction_id?: undefined;
                workflow_id?: undefined;
                state?: undefined;
            })[];
        })[];
    };
    listWorkflowExecutions(filters?: FilterableWorkflowExecutionProps, config?: FindConfig<WorkflowExecutionDTO>, sharedContext?: Context): Promise<{
        id: string;
        workflow_id: string;
        transaction_id: string;
        run_id: string;
        execution: Record<string, unknown> | null;
        context: Record<string, unknown> | null;
        state: import("@medusajs/framework/utils").TransactionState;
        retention_time: number | null;
        raw_retention_time: Record<string, unknown> | null;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }[]>;
    listAndCountWorkflowExecutions(filters?: FilterableWorkflowExecutionProps, config?: FindConfig<WorkflowExecutionDTO>, sharedContext?: Context): Promise<[{
        id: string;
        workflow_id: string;
        transaction_id: string;
        run_id: string;
        execution: Record<string, unknown> | null;
        context: Record<string, unknown> | null;
        state: import("@medusajs/framework/utils").TransactionState;
        retention_time: number | null;
        raw_retention_time: Record<string, unknown> | null;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }[], number]>;
    run<TWorkflow extends string | ReturnWorkflow<any, any, any>>(workflowIdOrWorkflow: TWorkflow, options?: WorkflowsSdkTypes.WorkflowOrchestratorRunDTO<TWorkflow extends ReturnWorkflow<any, any, any> ? UnwrapWorkflowInputDataType<TWorkflow> : unknown>, context?: Context): Promise<any>;
    getRunningTransaction(workflowId: string, transactionId: string, context?: Context): Promise<import("@medusajs/orchestration").DistributedTransactionType>;
    setStepSuccess({ idempotencyKey, stepResponse, options, }: {
        idempotencyKey: string | object;
        stepResponse: unknown;
        options?: Record<string, any>;
    }, context?: Context): Promise<any>;
    setStepFailure({ idempotencyKey, stepResponse, options, }: {
        idempotencyKey: string | object;
        stepResponse: unknown;
        options?: Record<string, any>;
    }, context?: Context): Promise<any>;
    subscribe(args: {
        workflowId: string;
        transactionId?: string;
        subscriber: Function;
        subscriberId?: string;
    }, context?: Context): Promise<void>;
    unsubscribe(args: {
        workflowId: string;
        transactionId?: string;
        subscriberOrId: string | Function;
    }, context?: Context): Promise<void>;
    private clearExpiredExecutions;
    cancel(workflowId: string, options: WorkflowOrchestratorCancelOptions, context?: Context): Promise<any>;
}
export {};
//# sourceMappingURL=workflows-module.d.ts.map