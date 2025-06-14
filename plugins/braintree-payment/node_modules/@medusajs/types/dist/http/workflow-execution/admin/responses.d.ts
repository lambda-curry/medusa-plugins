import { Acknowledgement } from "../../../workflows-sdk";
import { PaginatedResponse } from "../../common/response";
import { AdminWorkflowExecution } from "./entities";
export interface AdminWorkflowExecutionResponse {
    /**
     * The workflow execution's details.
     */
    workflow_execution: AdminWorkflowExecution;
}
export type AdminWorkflowExecutionListResponse = PaginatedResponse<{
    /**
     * The list of workflow executions.
     */
    workflow_executions: AdminWorkflowExecution[];
}>;
export type AdminWorkflowRunResponse = {
    acknowledgement: Acknowledgement;
};
//# sourceMappingURL=responses.d.ts.map