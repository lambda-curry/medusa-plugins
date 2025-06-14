"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelDraftOrderEditWorkflow = exports.cancelDraftOrderEditWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const order_1 = require("../../order");
const restore_draft_order_shipping_methods_1 = require("../steps/restore-draft-order-shipping-methods");
const validate_draft_order_change_1 = require("../steps/validate-draft-order-change");
const fields_1 = require("../utils/fields");
const refresh_draft_order_adjustments_1 = require("./refresh-draft-order-adjustments");
exports.cancelDraftOrderEditWorkflowId = "cancel-draft-order-edit";
/**
 * This workflow cancels a draft order edit. It's used by the
 * [Cancel Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_deletedraftordersidedit).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * cancelling a draft order edit.
 *
 * @example
 * const { result } = await cancelDraftOrderEditWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Cancel a draft order edit.
 */
exports.cancelDraftOrderEditWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.cancelDraftOrderEditWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["version", ...fields_1.draftOrderFieldsForRefreshSteps],
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: ["id", "status", "version", "actions.*"],
        variables: {
            filters: {
                order_id: input.order_id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, validate_draft_order_change_1.validateDraftOrderChangeStep)({ order, orderChange });
    const shippingToRemove = (0, workflows_sdk_1.transform)({ orderChange, input }, ({ orderChange }) => {
        return (orderChange.actions ?? [])
            .filter((a) => a.action === utils_1.ChangeActionType.SHIPPING_ADD)
            .map(({ reference_id }) => reference_id);
    });
    const shippingToRestore = (0, workflows_sdk_1.transform)({ orderChange, input }, ({ orderChange }) => {
        return (orderChange.actions ?? [])
            .filter((a) => a.action === utils_1.ChangeActionType.SHIPPING_UPDATE)
            .map(({ reference_id, details }) => ({
            id: reference_id,
            before: {
                shipping_option_id: details?.old_shipping_option_id,
                amount: details?.old_amount,
            },
            after: {
                shipping_option_id: details?.new_shipping_option_id,
                amount: details?.new_amount,
            },
        }));
    });
    const promotionsToRemove = (0, workflows_sdk_1.transform)({ orderChange, input }, ({ orderChange }) => {
        return (orderChange.actions ?? [])
            .filter((a) => a.action === utils_1.ChangeActionType.PROMOTION_ADD)
            .map(({ details }) => details?.added_code)
            .filter(Boolean);
    });
    const promotionsToRestore = (0, workflows_sdk_1.transform)({ orderChange, input }, ({ orderChange }) => {
        return (orderChange.actions ?? [])
            .filter((a) => a.action === utils_1.ChangeActionType.PROMOTION_REMOVE)
            .map(({ details }) => details?.removed_code)
            .filter(Boolean);
    });
    const promotionsToRefresh = (0, workflows_sdk_1.transform)({ order, promotionsToRemove, promotionsToRestore }, ({ order, promotionsToRemove, promotionsToRestore }) => {
        const promotionLink = order.promotion_link;
        const codes = new Set();
        if (promotionLink) {
            if (Array.isArray(promotionLink)) {
                promotionLink.forEach((promo) => {
                    codes.add(promo.promotion.code);
                });
            }
            else {
                codes.add(promotionLink.promotion.code);
            }
        }
        for (const code of promotionsToRemove) {
            codes.delete(code);
        }
        for (const code of promotionsToRestore) {
            codes.add(code);
        }
        return Array.from(codes);
    });
    (0, workflows_sdk_1.parallelize)((0, order_1.deleteOrderChangesStep)({ ids: [orderChange.id] }), (0, order_1.deleteOrderShippingMethods)({ ids: shippingToRemove }));
    refresh_draft_order_adjustments_1.refreshDraftOrderAdjustmentsWorkflow.runAsStep({
        input: {
            order,
            promo_codes: promotionsToRefresh,
            action: utils_1.PromotionActions.REPLACE,
        },
    });
    (0, workflows_sdk_1.when)(shippingToRestore, (methods) => {
        return !!methods?.length;
    }).then(() => {
        (0, restore_draft_order_shipping_methods_1.restoreDraftOrderShippingMethodsStep)({
            shippingMethods: shippingToRestore,
        });
    });
});
//# sourceMappingURL=cancel-draft-order-edit.js.map