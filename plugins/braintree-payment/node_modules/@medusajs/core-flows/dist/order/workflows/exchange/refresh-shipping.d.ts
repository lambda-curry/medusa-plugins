/**
 * The data to refresh the shipping methods for an exchange.
 */
export type RefreshExchangeShippingWorkflowInput = {
    /**
     * The order change's ID.
     */
    order_change_id: string;
    /**
     * The exchange's details.
     */
    exchange_id: string;
    /**
     * The order's ID.
     */
    order_id: string;
};
export declare const refreshExchangeShippingWorkflowId = "refresh-exchange-shipping";
/**
 * This workflow refreshes the shipping methods for an exchange in case the shipping option is calculated.
 * It refreshes both inbound and outbound shipping methods.
 *
 * @summary
 *
 * Refresh exchange shipping.
 */
export declare const refreshExchangeShippingWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<RefreshExchangeShippingWorkflowInput, void, []>;
//# sourceMappingURL=refresh-shipping.d.ts.map