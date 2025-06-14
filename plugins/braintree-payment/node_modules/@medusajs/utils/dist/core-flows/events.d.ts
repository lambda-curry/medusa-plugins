/**
 * @category Cart
 * @customNamespace Cart
 */
export declare const CartWorkflowEvents: {
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
    CREATED: string;
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
    UPDATED: string;
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
    CUSTOMER_UPDATED: string;
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
    REGION_UPDATED: string;
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
    CUSTOMER_TRANSFERRED: string;
};
/**
 * @category Customer
 * @customNamespace Customer
 */
export declare const CustomerWorkflowEvents: {
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
    CREATED: string;
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
    UPDATED: string;
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
    DELETED: string;
};
/**
 * @category Order
 * @customNamespace Order
 */
export declare const OrderWorkflowEvents: {
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
    UPDATED: string;
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
    PLACED: string;
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
    CANCELED: string;
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
    COMPLETED: string;
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
    ARCHIVED: string;
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
    FULFILLMENT_CREATED: string;
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
    FULFILLMENT_CANCELED: string;
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
    RETURN_REQUESTED: string;
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
    RETURN_RECEIVED: string;
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
    CLAIM_CREATED: string;
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
    EXCHANGE_CREATED: string;
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
    TRANSFER_REQUESTED: string;
};
/**
 * @category Order Edit
 * @customNamespace Order
 */
export declare const OrderEditWorkflowEvents: {
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
    REQUESTED: string;
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
    CONFIRMED: string;
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
    CANCELED: string;
};
/**
 * @category User
 * @customNamespace User
 */
export declare const UserWorkflowEvents: {
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
    CREATED: string;
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
    UPDATED: string;
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
    DELETED: string;
};
/**
 * @category Auth
 * @customNamespace Auth
 */
export declare const AuthWorkflowEvents: {
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
    PASSWORD_RESET: string;
};
/**
 * @category Sales Channel
 * @customNamespace Sales Channel
 */
export declare const SalesChannelWorkflowEvents: {
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
    CREATED: string;
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
    UPDATED: string;
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
    DELETED: string;
};
/**
 * @category Product Category
 * @customNamespace Product
 */
export declare const ProductCategoryWorkflowEvents: {
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
    CREATED: string;
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
    UPDATED: string;
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
    DELETED: string;
};
/**
 * @category Product Collection
 * @customNamespace Product
 */
export declare const ProductCollectionWorkflowEvents: {
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
    CREATED: string;
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
    UPDATED: string;
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
    DELETED: string;
};
/**
 * @category Product Variant
 * @customNamespace Product
 */
export declare const ProductVariantWorkflowEvents: {
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
    UPDATED: string;
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
    CREATED: string;
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
    DELETED: string;
};
/**
 * @category Product
 * @customNamespace Product
 */
export declare const ProductWorkflowEvents: {
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
    UPDATED: string;
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
    CREATED: string;
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
    DELETED: string;
};
/**
 * @category Product Type
 * @customNamespace Product
 */
export declare const ProductTypeWorkflowEvents: {
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
    UPDATED: string;
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
    CREATED: string;
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
    DELETED: string;
};
/**
 * @category Product Tag
 * @customNamespace Product
 */
export declare const ProductTagWorkflowEvents: {
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
    UPDATED: string;
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
    CREATED: string;
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
    DELETED: string;
};
/**
 * @category Product Option
 * @customNamespace Product
 */
export declare const ProductOptionWorkflowEvents: {
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
    UPDATED: string;
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
    CREATED: string;
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
    DELETED: string;
};
/**
 * @category Invite
 * @customNamespace User
 */
export declare const InviteWorkflowEvents: {
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
    ACCEPTED: string;
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
    CREATED: string;
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
    DELETED: string;
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
    RESENT: string;
};
/**
 * @category Region
 * @customNamespace Region
 */
export declare const RegionWorkflowEvents: {
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
    UPDATED: string;
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
    CREATED: string;
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
    DELETED: string;
};
/**
 * @category Fulfillment
 * @customNamespace Fulfillment
 */
export declare const FulfillmentWorkflowEvents: {
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
    SHIPMENT_CREATED: string;
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
    DELIVERY_CREATED: string;
};
//# sourceMappingURL=events.d.ts.map