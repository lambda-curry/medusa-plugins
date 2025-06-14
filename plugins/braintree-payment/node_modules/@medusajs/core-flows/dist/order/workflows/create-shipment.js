"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderShipmentWorkflow = exports.createOrderShipmentWorkflowId = exports.createShipmentValidateOrder = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const fulfillment_1 = require("../../fulfillment");
const steps_1 = require("../steps");
const order_validation_1 = require("../utils/order-validation");
/**
 * This step validates that a shipment can be created for an order. If the order is cancelled,
 * the items don't exist in the order, or the fulfillment doesn't exist in the order,
 * the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = createShipmentValidateOrder({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   input: {
 *     order_id: "order_123",
 *     fulfillment_id: "ful_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 1
 *       }
 *     ]
 *   }
 * })
 */
exports.createShipmentValidateOrder = (0, workflows_sdk_1.createStep)("create-shipment-validate-order", ({ order, input }) => {
    const inputItems = input.items;
    (0, order_validation_1.throwIfOrderIsCancelled)({ order });
    (0, order_validation_1.throwIfItemsDoesNotExistsInOrder)({ order, inputItems });
    const order_ = order;
    const fulfillment = order_.fulfillments.find((f) => f.id === input.fulfillment_id);
    if (!fulfillment) {
        throw new Error(`Fulfillment with id ${input.fulfillment_id} not found in the order`);
    }
});
function prepareRegisterShipmentData({ order, input, }) {
    const fulfillId = input.fulfillment_id;
    const order_ = order;
    const fulfillment = order_.fulfillments.find((f) => f.id === fulfillId);
    const lineItemIds = new Array(...new Set(fulfillment.items.map((i) => i.line_item_id)));
    return {
        order_id: order.id,
        reference: utils_1.Modules.FULFILLMENT,
        reference_id: fulfillment.id,
        created_by: input.created_by,
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
            //   We need to take this into account when creating a shipment to compute quantity of line items being shipped based on fulfillment items and qunatities.
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
exports.createOrderShipmentWorkflowId = "create-order-shipment";
/**
 * This workflow creates a shipment for an order. It's used by the [Create Order Shipment Admin API Route](https://docs.medusajs.com/api/admin#orders_postordersidfulfillmentsfulfillment_idshipments).
 *
 * This workflow has a hook that allows you to perform custom actions on the created shipment. For example, you can pass under `additional_data` custom data that
 * allows you to create custom data models linked to the shipment.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around creating a shipment.
 *
 * @example
 * const { result } = await createOrderShipmentWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     fulfillment_id: "fulfillment_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 1
 *       }
 *     ],
 *     additional_data: {
 *       oms_id: "123"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Creates a shipment for an order.
 *
 * @property hooks.shipmentCreated - This hook is executed after the shipment is created. You can consume this hook to perform custom actions on the created shipment.
 */
exports.createOrderShipmentWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createOrderShipmentWorkflowId, (input) => {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: [
            "id",
            "status",
            "region_id",
            "currency_code",
            "items.id",
            "items.quantity",
            "items.variant.manage_inventory",
            "items.variant.inventory_items.inventory.id",
            "items.variant.inventory_items.required_quantity",
            "fulfillments.*",
            "fulfillments.items.id",
            "fulfillments.items.quantity",
            "fulfillments.items.line_item_id",
            "fulfillments.items.inventory_item_id",
        ],
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    });
    (0, exports.createShipmentValidateOrder)({ order, input });
    const fulfillmentData = (0, workflows_sdk_1.transform)({ input }, ({ input }) => {
        return {
            id: input.fulfillment_id,
            labels: input.labels ?? [],
        };
    });
    const shipmentData = (0, workflows_sdk_1.transform)({ order, input }, prepareRegisterShipmentData);
    const [shipment] = (0, workflows_sdk_1.parallelize)(fulfillment_1.createShipmentWorkflow.runAsStep({
        input: fulfillmentData,
    }), (0, steps_1.registerOrderShipmentStep)(shipmentData));
    (0, common_1.emitEventStep)({
        eventName: utils_1.FulfillmentWorkflowEvents.SHIPMENT_CREATED,
        data: { id: shipment.id, no_notification: input.no_notification },
    });
    const shipmentCreated = (0, workflows_sdk_1.createHook)("shipmentCreated", {
        shipment,
        additional_data: input.additional_data,
    });
    return new workflows_sdk_1.WorkflowResponse(void 0, {
        hooks: [shipmentCreated],
    });
});
//# sourceMappingURL=create-shipment.js.map