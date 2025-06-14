"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshClaimShippingWorkflow = exports.refreshClaimShippingWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const maybe_refresh_shipping_methods_1 = require("../maybe-refresh-shipping-methods");
const common_1 = require("../../../common");
exports.refreshClaimShippingWorkflowId = "refresh-claim-shipping";
/**
 * This workflow refreshes the shipping methods for an claim in case the shipping option is calculated.
 * It refreshes both inbound and outbound shipping methods.
 *
 * @summary
 *
 * Refresh claim shipping.
 */
exports.refreshClaimShippingWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.refreshClaimShippingWorkflowId, function (input) {
    const orderChangeQuery = (0, common_1.useQueryGraphStep)({
        entity: "order_change",
        fields: [
            "id",
            "status",
            "order_id",
            "claim_id",
            "return_id",
            "actions.*",
        ],
        filters: {
            order_id: input.order_id,
            claim_id: input.claim_id,
            status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
        },
    }).config({ name: "order-change-query" });
    const orderChange = (0, workflows_sdk_1.transform)(orderChangeQuery, ({ data }) => data[0]);
    const refreshArgs = (0, workflows_sdk_1.transform)({ input, orderChange, orderChangeQuery }, ({ input, orderChange, orderChangeQuery }) => {
        const shippingToRefresh = {};
        const inboundShippingAction = orderChange.actions.find((action) => action.action === utils_1.ChangeActionType.SHIPPING_ADD &&
            !!action.return_id);
        const outboundShippingAction = orderChange.actions.find((action) => action.action === utils_1.ChangeActionType.SHIPPING_ADD && !action.return_id);
        if (inboundShippingAction) {
            const items = orderChange.actions
                .filter((action) => action.action === utils_1.ChangeActionType.RETURN_ITEM)
                .map((a) => ({
                id: a.details?.reference_id,
                quantity: a.details?.quantity,
            }));
            shippingToRefresh.inbound = {
                shipping_method_id: inboundShippingAction.reference_id,
                order_id: orderChange.order_id,
                action_id: inboundShippingAction.id,
                context: {
                    return_id: inboundShippingAction.return_id,
                    return_items: items,
                },
            };
        }
        if (outboundShippingAction) {
            const items = orderChange.actions
                .filter((action) => action.action === utils_1.ChangeActionType.ITEM_ADD)
                .map((a) => ({
                id: a.details?.reference_id,
                quantity: a.details?.quantity,
            }));
            shippingToRefresh.outbound = {
                shipping_method_id: outboundShippingAction.reference_id,
                order_id: orderChange.order_id,
                action_id: outboundShippingAction.id,
                context: {
                    claim_id: outboundShippingAction.claim_id,
                    claim_items: items,
                },
            };
        }
        return shippingToRefresh;
    });
    (0, workflows_sdk_1.when)({ refreshArgs }, ({ refreshArgs }) => !!refreshArgs.inbound).then(() => maybe_refresh_shipping_methods_1.maybeRefreshShippingMethodsWorkflow
        .runAsStep({
        input: refreshArgs.inbound,
    })
        .config({ name: "refresh-inbound-shipping-method" }));
    (0, workflows_sdk_1.when)({ refreshArgs }, ({ refreshArgs }) => !!refreshArgs.outbound).then(() => maybe_refresh_shipping_methods_1.maybeRefreshShippingMethodsWorkflow
        .runAsStep({
        input: refreshArgs.outbound,
    })
        .config({ name: "refresh-outbound-shipping-method" }));
    return new workflows_sdk_1.WorkflowResponse(void 0);
});
//# sourceMappingURL=refresh-shipping.js.map