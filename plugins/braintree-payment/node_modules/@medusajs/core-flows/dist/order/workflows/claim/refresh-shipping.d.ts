/**
 * The data to refresh the shipping methods for an claim.
 */
export type RefreshClaimShippingWorkflowInput = {
    /**
     * The order change's ID.
     */
    order_change_id: string;
    /**
     * The claim's details.
     */
    claim_id: string;
    /**
     * The order's ID.
     */
    order_id: string;
};
export declare const refreshClaimShippingWorkflowId = "refresh-claim-shipping";
/**
 * This workflow refreshes the shipping methods for an claim in case the shipping option is calculated.
 * It refreshes both inbound and outbound shipping methods.
 *
 * @summary
 *
 * Refresh claim shipping.
 */
export declare const refreshClaimShippingWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<RefreshClaimShippingWorkflowInput, void, []>;
//# sourceMappingURL=refresh-shipping.d.ts.map