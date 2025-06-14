"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderFulfillmentWorkflow = exports.cancelOrderFulfillmentWorkflowId = exports.cancelOrderFulfillmentValidateOrder = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const fulfillment_1 = require("../../fulfillment");
const inventory_1 = require("../../inventory");
const cancel_fulfillment_1 = require("../steps/cancel-fulfillment");
const order_validation_1 = require("../utils/order-validation");
const reservation_1 = require("../../reservation");
const reservation_2 = require("../../reservation");
/**
 * This step validates that an order fulfillment can be canceled. If
 * the fulfillment doesn't exist, or it has already been shipped, the step throws an error.
 *
 * :::note
 *
 * You can retrieve an order and fulfillment details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = cancelOrderFulfillmentValidateOrder({
 *   order: {
 *     id: "order_123",
 *     fulfillments: [
 *       {
 *         id: "ful_123",
 *         // other fulfillment details...
 *       }
 *     ]
 *     // other order details...
 *   },
 *   input: {
 *     order_id: "order_123",
 *     fulfillment_id: "ful_123"
 *   }
 * })
 */
exports.cancelOrderFulfillmentValidateOrder = (0, workflows_sdk_1.createStep)("cancel-fulfillment-validate-order", ({ order, input }) => {
    (0, order_validation_1.throwIfOrderIsCancelled)({ order });
    const fulfillment = order.fulfillments.find((f) => f.id === input.fulfillment_id);
    if (!fulfillment) {
        throw new Error(`Fulfillment with id ${input.fulfillment_id} not found in the order`);
    }
    if (fulfillment.canceled_at) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "The fulfillment is already canceled");
    }
    if (fulfillment.shipped_at) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `The fulfillment has already been shipped. Shipped fulfillments cannot be canceled`);
    }
    (0, order_validation_1.throwIfItemsDoesNotExistsInOrder)({
        order,
        inputItems: fulfillment.items.map((i) => ({
            id: i.line_item_id,
            quantity: i.quantity,
        })),
    });
});
function prepareCancelOrderFulfillmentData({ order, fulfillment, }) {
    const lineItemIds = new Array(...new Set(fulfillment.items.map((i) => i.line_item_id)));
    return {
        order_id: order.id,
        reference: utils_1.Modules.FULFILLMENT,
        reference_id: fulfillment.id,
        items: lineItemIds.map((lineItemId) => {
            // find order item
            const orderItem = order.items.find((i) => i.id === lineItemId);
            // find inventory items
            const iitems = orderItem.variant?.inventory_items;
            // find fulfillment item
            const fitem = fulfillment.items.find((i) => i.line_item_id === lineItemId);
            let quantity = fitem.quantity;
            // NOTE: if the order item has an inventory kit or `required_qunatity` > 1, fulfillment items wont't match 1:1 with order items.
            // - for each inventory item in the kit, a fulfillment item will be created i.e. one line item could have multiple fulfillment items
            // - the quantity of the fulfillment item will be the quantity of the order item multiplied by the required quantity of the inventory item
            //
            //   We need to take this into account when canceling the fulfillment to compute quantity of line items not being fulfilled based on fulfillment items and qunatities.
            //   NOTE: for now we only need to find one inventory item of a line item to compute this since when a fulfillment is created all inventory items are fulfilled together.
            //   If we allow to cancel partial fulfillments for an order item, we need to change this.
            if (iitems?.length) {
                const iitem = iitems.find((i) => i.inventory.id === fitem.inventory_item_id);
                quantity = utils_1.MathBN.div(quantity, iitem.required_quantity);
            }
            return {
                id: lineItemId,
                quantity,
            };
        }),
    };
}
function prepareInventoryUpdate({ fulfillment, reservations, order, }) {
    const inventoryAdjustment = [];
    const toCreate = [];
    const toUpdate = [];
    const orderItemsMap = order.items.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {});
    for (const fulfillmentItem of fulfillment.items) {
        // if this is `null` this means that item is from variant that has `manage_inventory` false
        if (!fulfillmentItem.inventory_item_id) {
            continue;
        }
        const orderItem = orderItemsMap[fulfillmentItem.line_item_id];
        const iitem = orderItem?.variant?.inventory_items.find((i) => i.inventory.id === fulfillmentItem.inventory_item_id);
        if (!iitem) {
            continue;
        }
        const reservation = reservations.find((r) => r.inventory_item_id === iitem.inventory.id &&
            r.line_item_id === fulfillmentItem.line_item_id);
        if (!reservation) {
            toCreate.push({
                inventory_item_id: iitem.inventory.id,
                location_id: fulfillment.location_id,
                quantity: fulfillmentItem.quantity, // <- this is the inventory quantity that is being fulfilled so it means it does include the required quantity
                line_item_id: fulfillmentItem.line_item_id,
            });
        }
        else {
            toUpdate.push({
                id: reservation.id,
                quantity: utils_1.MathBN.add(reservation.quantity, fulfillmentItem.quantity),
            });
        }
        inventoryAdjustment.push({
            inventory_item_id: fulfillmentItem.inventory_item_id,
            location_id: fulfillment.location_id,
            adjustment: fulfillmentItem.quantity,
        });
    }
    return {
        toCreate,
        toUpdate,
        inventoryAdjustment,
    };
}
exports.cancelOrderFulfillmentWorkflowId = "cancel-order-fulfillment";
/**
 * This workflow cancels an order's fulfillment. It's used by the [Cancel Order's Fulfillment Admin API Route](https://docs.medusajs.com/api/admin#orders_postordersidfulfillmentsfulfillment_idcancel).
 *
 * This workflow has a hook that allows you to perform custom actions on the canceled fulfillment. For example, you can pass under `additional_data` custom data that
 * allows you to update custom data models linked to the fulfillment.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around canceling a fulfillment.
 *
 * @example
 * const { result } = await cancelOrderFulfillmentWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     fulfillment_id: "ful_123",
 *     additional_data: {
 *       reason: "Customer changed their mind"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Cancel an order's fulfillment.
 *
 * @property hooks.orderFulfillmentCanceled - This hook is executed after the fulfillment is canceled. You can consume this hook to perform custom actions on the canceled fulfillment.
 */
exports.cancelOrderFulfillmentWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.cancelOrderFulfillmentWorkflowId, (input) => {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: [
            "id",
            "status",
            "items.id",
            "items.quantity",
            "items.variant.manage_inventory",
            "items.variant.inventory_items.inventory.id",
            "items.variant.inventory_items.required_quantity",
            "fulfillments.id",
            "fulfillments.canceled_at",
            "fulfillments.shipped_at",
            "fulfillments.location_id",
            "fulfillments.items.id",
            "fulfillments.items.quantity",
            "fulfillments.items.line_item_id",
            "fulfillments.items.inventory_item_id",
        ],
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    });
    (0, exports.cancelOrderFulfillmentValidateOrder)({ order, input });
    const fulfillment = (0, workflows_sdk_1.transform)({ input, order }, ({ input, order }) => {
        return order.fulfillments.find((f) => f.id === input.fulfillment_id);
    });
    const lineItemIds = (0, workflows_sdk_1.transform)({ fulfillment }, ({ fulfillment }) => {
        return fulfillment.items.map((i) => i.line_item_id);
    });
    const reservations = (0, common_1.useRemoteQueryStep)({
        entry_point: "reservations",
        fields: [
            "id",
            "line_item_id",
            "quantity",
            "inventory_item_id",
            "location_id",
        ],
        variables: {
            filters: {
                line_item_id: lineItemIds,
            },
        },
    }).config({ name: "get-reservations" });
    const cancelOrderFulfillmentData = (0, workflows_sdk_1.transform)({ order, fulfillment }, prepareCancelOrderFulfillmentData);
    const { toCreate, toUpdate, inventoryAdjustment } = (0, workflows_sdk_1.transform)({ order, fulfillment, reservations }, prepareInventoryUpdate);
    (0, inventory_1.adjustInventoryLevelsStep)(inventoryAdjustment);
    const eventData = (0, workflows_sdk_1.transform)({ order, fulfillment, input }, (data) => {
        return {
            order_id: data.order.id,
            fulfillment_id: data.fulfillment.id,
            no_notification: data.input.no_notification,
        };
    });
    (0, workflows_sdk_1.parallelize)((0, cancel_fulfillment_1.cancelOrderFulfillmentStep)(cancelOrderFulfillmentData), (0, reservation_1.createReservationsStep)(toCreate), (0, reservation_2.updateReservationsStep)(toUpdate), (0, common_1.emitEventStep)({
        eventName: utils_1.OrderWorkflowEvents.FULFILLMENT_CANCELED,
        data: eventData,
    }));
    // last step because there is no compensation for this step
    fulfillment_1.cancelFulfillmentWorkflow.runAsStep({
        input: {
            id: input.fulfillment_id,
        },
    });
    const orderFulfillmentCanceled = (0, workflows_sdk_1.createHook)("orderFulfillmentCanceled", {
        fulfillment,
        additional_data: input.additional_data,
    });
    return new workflows_sdk_1.WorkflowResponse(void 0, {
        hooks: [orderFulfillmentCanceled],
    });
});
//# sourceMappingURL=cancel-order-fulfillment.js.map