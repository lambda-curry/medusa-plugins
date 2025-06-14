"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshExchangeShippingWorkflow = exports.refreshExchangeShippingWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const maybe_refresh_shipping_methods_1 = require("../maybe-refresh-shipping-methods");
const common_1 = require("../../../common");
exports.refreshExchangeShippingWorkflowId = "refresh-exchange-shipping";
/**
 * This workflow refreshes the shipping methods for an exchange in case the shipping option is calculated.
 * It refreshes both inbound and outbound shipping methods.
 *
 * @summary
 *
 * Refresh exchange shipping.
 */
exports.refreshExchangeShippingWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.refreshExchangeShippingWorkflowId, function (input) {
    const orderChangeQuery = (0, common_1.useQueryGraphStep)({
        entity: "order_change",
        fields: [
            "id",
            "status",
            "order_id",
            "exchange_id",
            "return_id",
            "actions.*",
        ],
        filters: {
            order_id: input.order_id,
            exchange_id: input.exchange_id,
            status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
        },
    }).config({ name: "order-change-query" });
    const orderChange = (0, workflows_sdk_1.transform)(orderChangeQuery, ({ data }) => data[0]);
    const shippingToRefresh = (0, workflows_sdk_1.transform)({ input, orderChange }, ({ input, orderChange }) => {
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
                    exchange_id: outboundShippingAction.exchange_id,
                    exchange_items: items,
                },
            };
        }
        return shippingToRefresh;
    });
    (0, workflows_sdk_1.when)({ shippingToRefresh }, ({ shippingToRefresh }) => !!shippingToRefresh.inbound).then(() => maybe_refresh_shipping_methods_1.maybeRefreshShippingMethodsWorkflow
        .runAsStep({
        input: shippingToRefresh.inbound,
    })
        .config({ name: "refresh-inbound-shipping-method" }));
    (0, workflows_sdk_1.when)({ shippingToRefresh }, ({ shippingToRefresh }) => !!shippingToRefresh.outbound).then(() => maybe_refresh_shipping_methods_1.maybeRefreshShippingMethodsWorkflow
        .runAsStep({
        input: shippingToRefresh.outbound,
    })
        .config({ name: "refresh-outbound-shipping-method" }));
    return new workflows_sdk_1.WorkflowResponse(void 0);
});
//# sourceMappingURL=refresh-shipping.js.map