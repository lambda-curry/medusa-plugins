import { ContainerLike } from "@medusajs/framework";
import { Logger } from "@medusajs/framework/types";
import { FlowCancelOptions } from "@medusajs/framework/workflows-sdk";
export type InitializeModuleInjectableDependencies = {
    logger?: Logger;
};
export type WorkflowOrchestratorCancelOptions = Omit<FlowCancelOptions, "transaction" | "transactionId" | "container"> & {
    transactionId: string;
    container?: ContainerLike;
};
//# sourceMappingURL=index.d.ts.map