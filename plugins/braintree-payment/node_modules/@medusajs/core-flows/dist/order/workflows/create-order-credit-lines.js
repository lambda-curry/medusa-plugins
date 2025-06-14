"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderCreditLinesWorkflow = exports.createOrderCreditLinesWorkflowId = exports.validateOrderCreditLinesStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const confirm_order_changes_1 = require("../steps/confirm-order-changes");
const create_order_change_1 = require("../steps/create-order-change");
const create_order_change_actions_1 = require("./create-order-change-actions");
exports.validateOrderCreditLinesStep = (0, workflows_sdk_1.createStep)("validate-order-credit-lines", async function ({ order, creditLines, }) {
    const pendingDifference = utils_1.MathBN.convert(order.summary?.pending_difference);
    const creditLinesAmount = creditLines.reduce((acc, creditLine) => {
        return utils_1.MathBN.add(acc, utils_1.MathBN.convert(creditLine.amount));
    }, utils_1.MathBN.convert(0));
    if (utils_1.MathBN.eq(pendingDifference, 0)) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Can only create credit lines if the order has a positive or negative pending difference`);
    }
    if (utils_1.MathBN.gt(pendingDifference, 0) && utils_1.MathBN.lt(creditLinesAmount, 0)) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Can only create positive credit lines if the order has a positive pending difference`);
    }
    if (utils_1.MathBN.lt(pendingDifference, 0) && utils_1.MathBN.gt(creditLinesAmount, 0)) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Can only create negative credit lines if the order has a negative pending difference`);
    }
    if (utils_1.MathBN.lt(pendingDifference, 0)) {
        if (utils_1.MathBN.gt(creditLinesAmount.multipliedBy(-1), pendingDifference.multipliedBy(-1))) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cannot create more negative credit lines with amount more than the pending difference`);
        }
    }
    if (utils_1.MathBN.gt(pendingDifference, 0)) {
        if (utils_1.MathBN.gt(creditLinesAmount, pendingDifference)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cannot create more positive credit lines with amount more than the pending difference`);
        }
    }
});
exports.createOrderCreditLinesWorkflowId = "create-order-credit-lines";
exports.createOrderCreditLinesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createOrderCreditLinesWorkflowId, (input) => {
    const orderQuery = (0, common_1.useQueryGraphStep)({
        entity: "orders",
        fields: ["id", "status", "summary"],
        filters: { id: input.id },
        options: { throwIfKeyNotFound: true },
    }).config({ name: "get-order" });
    const order = (0, workflows_sdk_1.transform)({ orderQuery }, ({ orderQuery }) => orderQuery.data[0]);
    (0, exports.validateOrderCreditLinesStep)({ order, creditLines: input.credit_lines });
    const orderChangeInput = (0, workflows_sdk_1.transform)({ input }, ({ input }) => ({
        change_type: utils_1.OrderChangeType.CREDIT_LINE,
        order_id: input.id,
    }));
    const createdOrderChange = (0, create_order_change_1.createOrderChangeStep)(orderChangeInput);
    const orderChangeActionInput = (0, workflows_sdk_1.transform)({ order, orderChange: createdOrderChange, input }, ({ order, orderChange, input }) => {
        return input.credit_lines.map((creditLine) => {
            return {
                order_change_id: orderChange.id,
                order_id: order.id,
                version: orderChange.version,
                action: utils_1.ChangeActionType.CREDIT_LINE_ADD,
                reference: creditLine.reference,
                reference_id: creditLine.reference_id,
                amount: creditLine.amount,
            };
        });
    });
    create_order_change_actions_1.createOrderChangeActionsWorkflow.runAsStep({
        input: orderChangeActionInput,
    });
    const orderChangeQuery = (0, common_1.useQueryGraphStep)({
        entity: "order_change",
        fields: [
            "id",
            "status",
            "change_type",
            "actions.id",
            "actions.order_id",
            "actions.action",
            "actions.details",
            "actions.reference",
            "actions.reference_id",
            "actions.internal_note",
        ],
        filters: {
            order_id: input.id,
            status: [utils_1.OrderChangeStatus.PENDING],
        },
    }).config({ name: "order-change-query" });
    const orderChange = (0, workflows_sdk_1.transform)({ orderChangeQuery }, ({ orderChangeQuery }) => orderChangeQuery.data[0]);
    const orderChanges = (0, confirm_order_changes_1.confirmOrderChanges)({
        changes: [orderChange],
        orderId: order.id,
    });
    (0, workflows_sdk_1.createHook)("creditLinesCreated", {
        order_id: input.id,
        credit_lines: orderChanges.credit_lines,
    });
    return new workflows_sdk_1.WorkflowResponse(orderChanges.credit_lines);
});
//# sourceMappingURL=create-order-credit-lines.js.map