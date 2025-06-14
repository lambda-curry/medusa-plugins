"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmDraftOrderEditWorkflow = exports.confirmDraftOrderEditWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const cart_1 = require("../../cart");
const prepare_confirm_inventory_input_1 = require("../../cart/utils/prepare-confirm-inventory-input");
const common_1 = require("../../common");
const order_1 = require("../../order");
const confirm_order_changes_1 = require("../../order/steps/confirm-order-changes");
const reservation_1 = require("../../reservation");
const validate_draft_order_change_1 = require("../steps/validate-draft-order-change");
exports.confirmDraftOrderEditWorkflowId = "confirm-draft-order-edit";
/**
 * This workflow confirms a draft order edit. It's used by the
 * [Confirm Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersideditconfirm).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * confirming a draft order edit.
 *
 * @example
 * const { result } = await confirmDraftOrderEditWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     confirmed_by: "user_123",
 *   }
 * })
 *
 * @summary
 *
 * Confirm a draft order edit.
 */
exports.confirmDraftOrderEditWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.confirmDraftOrderEditWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: [
            "id",
            "status",
            "is_draft_order",
            "version",
            "canceled_at",
            "items.id",
            "items.title",
            "items.variant_title",
            "items.variant_sku",
            "items.variant_barcode",
            "shipping_address.*",
        ],
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: [
            "id",
            "status",
            "actions.id",
            "actions.order_id",
            "actions.return_id",
            "actions.action",
            "actions.details",
            "actions.reference",
            "actions.reference_id",
            "actions.internal_note",
        ],
        variables: {
            filters: {
                order_id: input.order_id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, validate_draft_order_change_1.validateDraftOrderChangeStep)({
        order,
        orderChange,
    });
    const orderPreview = (0, order_1.previewOrderChangeStep)(order.id);
    (0, confirm_order_changes_1.confirmOrderChanges)({
        changes: [orderChange],
        orderId: order.id,
        confirmed_by: input.confirmed_by,
    });
    const orderItems = (0, common_1.useRemoteQueryStep)({
        entry_point: "order",
        fields: [
            "id",
            "version",
            "canceled_at",
            "sales_channel_id",
            "items.*",
            "items.variant.manage_inventory",
            "items.variant.allow_backorder",
            "items.variant.inventory_items.inventory_item_id",
            "items.variant.inventory_items.required_quantity",
            "items.variant.inventory_items.inventory.location_levels.stock_locations.id",
            "items.variant.inventory_items.inventory.location_levels.stock_locations.name",
            "items.variant.inventory_items.inventory.location_levels.stock_locations.sales_channels.id",
            "items.variant.inventory_items.inventory.location_levels.stock_locations.sales_channels.name",
        ],
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-items-query" });
    const { removedLineItemIds } = (0, workflows_sdk_1.transform)({ orderItems, previousOrderItems: order.items }, (data) => {
        const previousItemIds = (data.previousOrderItems || []).map(({ id }) => id);
        const currentItemIds = data.orderItems.items.map(({ id }) => id);
        const removedItemIds = previousItemIds.filter((id) => !currentItemIds.includes(id));
        return {
            removedLineItemIds: removedItemIds,
        };
    });
    (0, reservation_1.deleteReservationsByLineItemsStep)(removedLineItemIds);
    const { variants, items } = (0, workflows_sdk_1.transform)({ orderItems, orderPreview }, ({ orderItems, orderPreview }) => {
        const allItems = [];
        const allVariants = [];
        orderItems.items.forEach((ordItem) => {
            const itemAction = orderPreview.items?.find((item) => item.id === ordItem.id &&
                item.actions?.find((a) => a.action === utils_1.ChangeActionType.ITEM_ADD ||
                    a.action === utils_1.ChangeActionType.ITEM_UPDATE));
            if (!itemAction) {
                return;
            }
            const unitPrice = itemAction.raw_unit_price ?? itemAction.unit_price;
            const compareAtUnitPrice = itemAction.raw_compare_at_unit_price ??
                itemAction.compare_at_unit_price;
            const updateAction = itemAction.actions.find((a) => a.action === utils_1.ChangeActionType.ITEM_UPDATE);
            const quantity = itemAction.raw_quantity ?? itemAction.quantity;
            const newQuantity = updateAction
                ? utils_1.MathBN.sub(quantity, ordItem.raw_quantity)
                : quantity;
            if (utils_1.MathBN.lte(newQuantity, 0)) {
                return;
            }
            const reservationQuantity = utils_1.MathBN.sub(newQuantity, ordItem.raw_fulfilled_quantity);
            allItems.push({
                id: ordItem.id,
                variant_id: ordItem.variant_id,
                quantity: reservationQuantity,
                unit_price: unitPrice,
                compare_at_unit_price: compareAtUnitPrice,
            });
            allVariants.push(ordItem.variant);
        });
        return {
            variants: allVariants,
            items: allItems,
        };
    });
    const formatedInventoryItems = (0, workflows_sdk_1.transform)({
        input: {
            sales_channel_id: orderItems.sales_channel_id,
            variants,
            items,
        },
    }, prepare_confirm_inventory_input_1.prepareConfirmInventoryInput);
    (0, cart_1.reserveInventoryStep)(formatedInventoryItems);
    order_1.createOrUpdateOrderPaymentCollectionWorkflow.runAsStep({
        input: {
            order_id: order.id,
        },
    });
    return new workflows_sdk_1.WorkflowResponse(orderPreview);
});
//# sourceMappingURL=confirm-draft-order-edit.js.map