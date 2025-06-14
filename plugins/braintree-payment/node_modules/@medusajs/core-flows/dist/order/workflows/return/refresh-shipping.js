"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshReturnShippingWorkflow = exports.refreshReturnShippingWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const maybe_refresh_shipping_methods_1 = require("../maybe-refresh-shipping-methods");
const common_1 = require("../../../common");
exports.refreshReturnShippingWorkflowId = "refresh-return-shipping";
/**
 * This workflow refreshes the shipping method for a return in case the shipping option is calculated.
 *
 * @summary
 *
 * Refresh return shipping.
 */
exports.refreshReturnShippingWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.refreshReturnShippingWorkflowId, function (input) {
    const orderChangeQuery = (0, common_1.useQueryGraphStep)({
        entity: "order_change",
        fields: ["id", "status", "order_id", "return_id", "actions.*"],
        filters: {
            order_id: input.order_id,
            return_id: input.return_id,
            status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
        },
    }).config({ name: "order-change-query" });
    const orderChange = (0, workflows_sdk_1.transform)(orderChangeQuery, ({ data }) => data[0]);
    const refreshArgs = (0, workflows_sdk_1.transform)({ input, orderChange }, ({ input, orderChange }) => {
        const shippingAction = orderChange.actions.find((action) => action.action === utils_1.ChangeActionType.SHIPPING_ADD);
        const items = orderChange.actions
            .filter((action) => action.action === utils_1.ChangeActionType.RETURN_ITEM)
            .map((a) => ({
            id: a.details?.reference_id,
            quantity: a.details?.quantity,
        }));
        if (shippingAction) {
            return {
                shipping_method_id: shippingAction.reference_id,
                order_id: orderChange.order_id,
                action_id: shippingAction.id,
                context: {
                    return_id: input.return_id,
                    return_items: items,
                },
            };
        }
        return null;
    });
    (0, workflows_sdk_1.when)({ refreshArgs }, ({ refreshArgs }) => refreshArgs !== null).then(() => maybe_refresh_shipping_methods_1.maybeRefreshShippingMethodsWorkflow.runAsStep({
        input: refreshArgs,
    }));
    return new workflows_sdk_1.WorkflowResponse(void 0);
});
//# sourceMappingURL=refresh-shipping.js.map