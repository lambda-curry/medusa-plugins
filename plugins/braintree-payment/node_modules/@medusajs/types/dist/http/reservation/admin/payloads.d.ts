export interface AdminCreateReservation {
    /**
     * The ID of the line item to create the reservation for.
     */
    line_item_id?: string | null;
    /**
     * The ID of the location that the quantity
     * is reserved from.
     */
    location_id: string;
    /**
     * The ID of the inventory item that the reservation is for.
     */
    inventory_item_id: string;
    /**
     * The quantity of the inventory item that is reserved.
     */
    quantity: number;
    /**
     * The description of the reservation.
     */
    description?: string | null;
    /**
     * Custom key-value pairs that can be added to the reservation.
     */
    metadata?: Record<string, unknown> | null;
}
export interface AdminUpdateReservation {
    /**
     * The ID of the location that the quantity
     * is reserved from.
     */
    location_id?: string;
    /**
     * The quantity of the inventory item that is reserved.
     */
    quantity?: number;
    /**
     * The description of the reservation.
     */
    description?: string | null;
    /**
     * Custom key-value pairs that can be added to the reservation.
     */
    metadata?: Record<string, unknown> | null;
}
//# sourceMappingURL=payloads.d.ts.map