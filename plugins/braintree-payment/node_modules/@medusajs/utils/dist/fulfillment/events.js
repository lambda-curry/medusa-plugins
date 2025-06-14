"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillmentEvents = void 0;
const event_bus_1 = require("../event-bus");
const modules_sdk_1 = require("../modules-sdk");
const eventBaseNames = [
    "fulfillmentSet",
    "serviceZone",
    "geoZone",
    "shippingOption",
    "shippingOptionType",
    "shippingProfile",
    "shippingOptionRule",
    "fulfillment",
    "fulfillmentAddress",
    "fulfillmentItem",
    "fulfillmentLabel",
];
exports.FulfillmentEvents = {
    ...(0, event_bus_1.buildEventNamesFromEntityName)(eventBaseNames, modules_sdk_1.Modules.FULFILLMENT),
    /**
     * @deprecated use `FulfillmentWorkflowEvents.SHIPMENT_CREATED` instead
     */
    SHIPMENT_CREATED: "shipment.created",
    /**
     * @deprecated use `FulfillmentWorkflowEvents.DELIVERY_CREATED` instead
     */
    DELIVERY_CREATED: "delivery.created",
};
//# sourceMappingURL=events.js.map