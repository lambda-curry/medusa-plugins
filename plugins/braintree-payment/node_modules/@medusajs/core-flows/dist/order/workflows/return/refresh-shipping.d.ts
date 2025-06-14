/**
 * The data to validate that items can be added to a return.
 */
export type RequestItemReturnValidationStepInput = {
    /**
     * The order change's ID.
     */
    order_change_id: string;
    /**
     * The return's details.
     */
    return_id: string;
    /**
     * The order's ID.
     */
    order_id: string;
};
export declare const refreshReturnShippingWorkflowId = "refresh-return-shipping";
/**
 * This workflow refreshes the shipping method for a return in case the shipping option is calculated.
 *
 * @summary
 *
 * Refresh return shipping.
 */
export declare const refreshReturnShippingWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<RequestItemReturnValidationStepInput, void, []>;
//# sourceMappingURL=refresh-shipping.d.ts.map