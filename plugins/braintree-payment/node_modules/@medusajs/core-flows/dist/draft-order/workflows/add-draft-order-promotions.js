"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDraftOrderPromotionWorkflow = exports.addDraftOrderPromotionWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const order_1 = require("../../order");
const validate_draft_order_change_1 = require("../steps/validate-draft-order-change");
const validate_promo_codes_to_add_1 = require("../steps/validate-promo-codes-to-add");
const fields_1 = require("../utils/fields");
const refresh_draft_order_adjustments_1 = require("./refresh-draft-order-adjustments");
exports.addDraftOrderPromotionWorkflowId = "add-draft-order-promotion";
/**
 * This workflow adds promotions to a draft order. It's used by the
 * [Add Promotion to Draft Order Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersideditpromotions).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around adding promotions to
 * a draft order.
 *
 * @example
 * const { result } = await addDraftOrderPromotionWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     promo_codes: ["PROMO_CODE_1", "PROMO_CODE_2"]
 *   }
 * })
 *
 * @summary
 *
 * Add promotions to a draft order.
 */
exports.addDraftOrderPromotionWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.addDraftOrderPromotionWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: fields_1.draftOrderFieldsForRefreshSteps,
        variables: {
            id: input.order_id,
        },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: ["id", "status"],
        variables: {
            filters: {
                order_id: input.order_id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, validate_draft_order_change_1.validateDraftOrderChangeStep)({ order, orderChange });
    const promotions = (0, common_1.useRemoteQueryStep)({
        entry_point: "promotion",
        fields: ["id", "code", "status"],
        variables: {
            filters: {
                code: input.promo_codes,
            },
        },
        list: true,
    }).config({ name: "promotions-query" });
    (0, validate_promo_codes_to_add_1.validatePromoCodesToAddStep)({
        promo_codes: input.promo_codes,
        promotions,
    });
    refresh_draft_order_adjustments_1.refreshDraftOrderAdjustmentsWorkflow.runAsStep({
        input: {
            order,
            promo_codes: input.promo_codes,
            action: utils_1.PromotionActions.ADD,
        },
    });
    const orderChangeActionInput = (0, workflows_sdk_1.transform)({ order, orderChange, promotions }, ({ order, orderChange, promotions }) => {
        return promotions.map((promotion) => ({
            action: utils_1.ChangeActionType.PROMOTION_ADD,
            reference: "order_promotion",
            order_change_id: orderChange.id,
            reference_id: promotion.id,
            order_id: order.id,
            details: {
                added_code: promotion.code,
            },
        }));
    });
    order_1.createOrderChangeActionsWorkflow.runAsStep({
        input: orderChangeActionInput,
    });
    return new workflows_sdk_1.WorkflowResponse((0, order_1.previewOrderChangeStep)(input.order_id));
});
//# sourceMappingURL=add-draft-order-promotions.js.map