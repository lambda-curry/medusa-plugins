"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillmentWorkflowEvents = exports.RegionWorkflowEvents = exports.InviteWorkflowEvents = exports.ProductOptionWorkflowEvents = exports.ProductTagWorkflowEvents = exports.ProductTypeWorkflowEvents = exports.ProductWorkflowEvents = exports.ProductVariantWorkflowEvents = exports.ProductCollectionWorkflowEvents = exports.ProductCategoryWorkflowEvents = exports.SalesChannelWorkflowEvents = exports.AuthWorkflowEvents = exports.UserWorkflowEvents = exports.OrderEditWorkflowEvents = exports.OrderWorkflowEvents = exports.CustomerWorkflowEvents = exports.CartWorkflowEvents = void 0;
/**
 * @category Cart
 * @customNamespace Cart
 */
exports.CartWorkflowEvents = {
    /**
     * Emitted when a cart is created.
     *
     * @eventPayload
     * ```ts
     * {
     *   id, // The ID of the cart
     * }
     * ```
     */
    CREATED: "cart.created",
    /**
     * Emitted when a cart's details are updated.
     *
     * @eventPayload
     * ```ts
     * {
     *   id, // The ID of the cart
     * }
     * ```
     */
    UPDATED: "cart.updated",
    /**
     * Emitted when the customer in the cart is updated.
     *
     * @eventPayload
     * ```ts
     * {
     *   id, // The ID of the cart
     * }
     * ```
     */
    CUSTOMER_UPDATED: "cart.customer_updated",
    /**
     * Emitted when the cart's region is updated. This
     * event is emitted alongside the `cart.updated` event.
     *
     * @eventPayload
     * ```ts
     * {
     *   id, // The ID of the cart
     * }
     * ```
     */
    REGION_UPDATED: "cart.region_updated",
    /**
     * Emitted when the customer in the cart is transferred.
     *
     * @version 2.8.0
     *
     * @eventPayload
     * ```ts
     * {
     *   id, // The ID of the cart
     *   customer_id, // The ID of the customer
     * }
     * ```
     */
    CUSTOMER_TRANSFERRED: "cart.customer_transferred",
};
/**
 * @category Customer
 * @customNamespace Customer
 */
exports.CustomerWorkflowEvents = {
    /**
     * Emitted when a customer is created.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the customer
     * }]
     * ```
     */
    CREATED: "customer.created",
    /**
     * Emitted when a customer is updated.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the customer
     * }]
     * ```
     */
    UPDATED: "customer.updated",
    /**
     * Emitted when a customer is deleted.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the customer
     * }]
     * ```
     */
    DELETED: "customer.deleted",
};
/**
 * @category Order
 * @customNamespace Order
 */
exports.OrderWorkflowEvents = {
    /**
     * Emitted when the details of an order or draft order is updated. This
     * doesn't include updates made by an edit.
     *
     * @eventPayload
     * ```ts
     * {
     *   id, // The ID of the order
     * }
     * ```
     */
    UPDATED: "order.updated",
    /**
     * Emitted when an order is placed, or when a draft order is converted to an
     * order.
     *
     * @eventPayload
     * ```ts
     * {
     *   id, // The ID of the order
     * }
     * ```
     */
    PLACED: "order.placed",
    /**
     * Emitted when an order is canceld.
     *
     * @eventPayload
     * ```ts
     * {
     *   id, // The ID of the order
     * }
     * ```
     */
    CANCELED: "order.canceled",
    /**
     * Emitted when orders are completed.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the order
     * }]
     * ```
     */
    COMPLETED: "order.completed",
    /**
     * Emitted when an order is archived.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the order
     * }]
     * ```
     */
    ARCHIVED: "order.archived",
    /**
     * Emitted when a fulfillment is created for an order.
     *
     * @eventPayload
     * ```ts
     * {
     *   order_id, // The ID of the order
     *   fulfillment_id, // The ID of the fulfillment
     *   no_notification, // (boolean) Whether to notify the customer
     * }
     * ```
     */
    FULFILLMENT_CREATED: "order.fulfillment_created",
    /**
     * Emitted when an order's fulfillment is canceled.
     *
     * @eventPayload
     * ```ts
     * {
     *   order_id, // The ID of the order
     *   fulfillment_id, // The ID of the fulfillment
     *   no_notification, // (boolean) Whether to notify the customer
     * }
     * ```
     */
    FULFILLMENT_CANCELED: "order.fulfillment_canceled",
    /**
     * Emitted when a return request is confirmed.
     *
     * @eventPayload
     * ```ts
     * {
     *   order_id, // The ID of the order
     *   return_id, // The ID of the return
     * }
     * ```
     */
    RETURN_REQUESTED: "order.return_requested",
    /**
     * Emitted when a return is marked as received.
     *
     * @eventPayload
     * ```ts
     * {
     *   order_id, // The ID of the order
     *   return_id, // The ID of the return
     * }
     * ```
     */
    RETURN_RECEIVED: "order.return_received",
    /**
     * Emitted when a claim is created for an order.
     *
     * @eventPayload
     * ```ts
     * {
     *   order_id, // The ID of the order
     *   claim_id, // The ID of the claim
     * }
     * ```
     */
    CLAIM_CREATED: "order.claim_created",
    /**
     * Emitted when an exchange is created for an order.
     *
     * @eventPayload
     * ```ts
     * {
     *   order_id, // The ID of the order
     *   exchange_id, // The ID of the exchange
     * }
     * ```
     */
    EXCHANGE_CREATED: "order.exchange_created",
    /**
     * Emitted when an order is requested to be transferred to
     * another customer.
     *
     * @eventPayload
     * ```ts
     * {
     *   id, // The ID of the order
     *   order_change_id, // The ID of the order change created for the transfer
     * }
     * ```
     */
    TRANSFER_REQUESTED: "order.transfer_requested",
};
/**
 * @category Order Edit
 * @customNamespace Order
 */
exports.OrderEditWorkflowEvents = {
    /**
     * Emitted when an order edit is requested.
     *
     * @version 2.8.0
     *
     * @eventPayload
     * ```ts
     * {
     *   order_id, // The ID of the order
     *   actions, // (array) The [actions](https://docs.medusajs.com/resources/references/fulfillment/interfaces/fulfillment.OrderChangeActionDTO) to edit the order
     * }
     * ```
     */
    REQUESTED: "order-edit.requested",
    /**
     * Emitted when an order edit request is confirmed.
     *
     * @version 2.8.0
     *
     * @eventPayload
     * ```ts
     * {
     *   order_id, // The ID of the order
     *   actions, // (array) The [actions](https://docs.medusajs.com/resources/references/fulfillment/interfaces/fulfillment.OrderChangeActionDTO) to edit the order
     * }
     * ```
     */
    CONFIRMED: "order-edit.confirmed",
    /**
     * Emitted when an order edit request is canceled.
     *
     * @version 2.8.0
     *
     * @eventPayload
     * ```ts
     * {
     *   order_id, // The ID of the order
     *   actions, // (array) The [actions](https://docs.medusajs.com/resources/references/fulfillment/interfaces/fulfillment.OrderChangeActionDTO) to edit the order
     * }
     * ```
     */
    CANCELED: "order-edit.canceled",
};
/**
 * @category User
 * @customNamespace User
 */
exports.UserWorkflowEvents = {
    /**
     * Emitted when users are created.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the user
     * }]
     * ```
     */
    CREATED: "user.created",
    /**
     * Emitted when users are updated.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the user
     * }]
     * ```
     */
    UPDATED: "user.updated",
    /**
     * Emitted when users are deleted.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the user
     * }]
     * ```
     */
    DELETED: "user.deleted",
};
/**
 * @category Auth
 * @customNamespace Auth
 */
exports.AuthWorkflowEvents = {
    /**
     * Emitted when a reset password token is generated. You can listen to this event
     * to send a reset password email to the user or customer, for example.
     *
     * @eventPayload
     * ```ts
     * {
     *   entity_id, // The identifier of the user or customer. For example, an email address.
     *   actor_type, // The type of actor. For example, "customer", "user", or custom.
     *   token, // The generated token.
     * }
     * ```
     */
    PASSWORD_RESET: "auth.password_reset",
};
/**
 * @category Sales Channel
 * @customNamespace Sales Channel
 */
exports.SalesChannelWorkflowEvents = {
    /**
     * Emitted when sales channels are created.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the sales channel
     * }]
     * ```
     */
    CREATED: "sales-channel.created",
    /**
     * Emitted when sales channels are updated.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the sales channel
     * }]
     * ```
     */
    UPDATED: "sales-channel.updated",
    /**
     * Emitted when sales channels are deleted.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the sales channel
     * }]
     * ```
     */
    DELETED: "sales-channel.deleted",
};
/**
 * @category Product Category
 * @customNamespace Product
 */
exports.ProductCategoryWorkflowEvents = {
    /**
     * Emitted when product categories are created.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product category
     * }]
     * ```
     */
    CREATED: "product-category.created",
    /**
     * Emitted when product categories are updated.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product category
     * }]
     * ```
     */
    UPDATED: "product-category.updated",
    /**
     * Emitted when product categories are deleted.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product category
     * }]
     * ```
     */
    DELETED: "product-category.deleted",
};
/**
 * @category Product Collection
 * @customNamespace Product
 */
exports.ProductCollectionWorkflowEvents = {
    /**
     * Emitted when product collections are created.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product collection
     * }]
     * ```
     */
    CREATED: "product-collection.created",
    /**
     * Emitted when product collections are updated.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product collection
     * }]
     * ```
     */
    UPDATED: "product-collection.updated",
    /**
     * Emitted when product collections are deleted.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product collection
     * }]
     * ```
     */
    DELETED: "product-collection.deleted",
};
/**
 * @category Product Variant
 * @customNamespace Product
 */
exports.ProductVariantWorkflowEvents = {
    /**
     * Emitted when product variants are updated.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product variant
     * }]
     * ```
     */
    UPDATED: "product-variant.updated",
    /**
     * Emitted when product variants are created.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product variant
     * }]
     * ```
     */
    CREATED: "product-variant.created",
    /**
     * Emitted when product variants are deleted.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product variant
     * }]
     * ```
     */
    DELETED: "product-variant.deleted",
};
/**
 * @category Product
 * @customNamespace Product
 */
exports.ProductWorkflowEvents = {
    /**
     * Emitted when products are updated.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product
     * }]
     * ```
     */
    UPDATED: "product.updated",
    /**
     * Emitted when products are created.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product
     * }]
     * ```
     */
    CREATED: "product.created",
    /**
     * Emitted when products are deleted.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product
     * }]
     * ```
     */
    DELETED: "product.deleted",
};
/**
 * @category Product Type
 * @customNamespace Product
 */
exports.ProductTypeWorkflowEvents = {
    /**
     * Emitted when product types are updated.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product type
     * }]
     * ```
     */
    UPDATED: "product-type.updated",
    /**
     * Emitted when product types are created.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product type
     * }]
     * ```
     */
    CREATED: "product-type.created",
    /**
     * Emitted when product types are deleted.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product type
     * }]
     * ```
     */
    DELETED: "product-type.deleted",
};
/**
 * @category Product Tag
 * @customNamespace Product
 */
exports.ProductTagWorkflowEvents = {
    /**
     * Emitted when product tags are updated.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product tag
     * }]
     * ```
     */
    UPDATED: "product-tag.updated",
    /**
     * Emitted when product tags are created.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product tag
     * }]
     * ```
     */
    CREATED: "product-tag.created",
    /**
     * Emitted when product tags are deleted.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product tag
     * }]
     * ```
     */
    DELETED: "product-tag.deleted",
};
/**
 * @category Product Option
 * @customNamespace Product
 */
exports.ProductOptionWorkflowEvents = {
    /**
     * Emitted when product options are updated.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product option
     * }]
     * ```
     */
    UPDATED: "product-option.updated",
    /**
     * Emitted when product options are created.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product option
     * }]
     * ```
     */
    CREATED: "product-option.created",
    /**
     * Emitted when product options are deleted.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the product option
     * }]
     * ```
     */
    DELETED: "product-option.deleted",
};
/**
 * @category Invite
 * @customNamespace User
 */
exports.InviteWorkflowEvents = {
    /**
     * Emitted when an invite is accepted.
     *
     * @eventPayload
     * ```ts
     * {
     *   id, // The ID of the invite
     * }
     * ```
     */
    ACCEPTED: "invite.accepted",
    /**
     * Emitted when invites are created. You can listen to this event
     * to send an email to the invited users, for example.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the invite
     * }]
     * ```
     */
    CREATED: "invite.created",
    /**
     * Emitted when invites are deleted.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the invite
     * }]
     * ```
     */
    DELETED: "invite.deleted",
    /**
     * Emitted when invites should be resent because their token was
     * refreshed. You can listen to this event to send an email to the invited users,
     * for example.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the invite
     * }]
     * ```
     */
    RESENT: "invite.resent",
};
/**
 * @category Region
 * @customNamespace Region
 */
exports.RegionWorkflowEvents = {
    /**
     * Emitted when regions are updated.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the region
     * }]
     * ```
     */
    UPDATED: "region.updated",
    /**
     * Emitted when regions are created.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the region
     * }]
     * ```
     */
    CREATED: "region.created",
    /**
     * Emitted when regions are deleted.
     *
     * @eventPayload
     * ```ts
     * [{
     *   id, // The ID of the region
     * }]
     * ```
     */
    DELETED: "region.deleted",
};
/**
 * @category Fulfillment
 * @customNamespace Fulfillment
 */
exports.FulfillmentWorkflowEvents = {
    /**
     * Emitted when a shipment is created for an order.
     *
     * @eventPayload
     * ```ts
     * {
     *   id, // the ID of the shipment
     *   no_notification, // (boolean) whether to notify the customer
     * }
     * ```
     */
    SHIPMENT_CREATED: "shipment.created",
    /**
     * Emitted when a fulfillment is marked as delivered.
     *
     * @eventPayload
     * ```ts
     * {
     *   id, // the ID of the fulfillment
     * }
     * ```
     */
    DELIVERY_CREATED: "delivery.created",
};
//# sourceMappingURL=events.js.map