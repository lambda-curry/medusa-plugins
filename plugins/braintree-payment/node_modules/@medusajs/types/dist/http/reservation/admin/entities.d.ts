import { AdminInventoryItem } from "../../inventory";
export interface AdminReservation {
    /**
     * The reservation's ID.
     */
    id: string;
    /**
     * The ID of the line item that the reservation is for.
     */
    line_item_id: string | null;
    /**
     * The ID of the location that the quantity is reserved from.
     */
    location_id: string;
    /**
     * The quantity that is reserved.
     */
    quantity: number;
    /**
     * The ID of the reservation in an external system.
     */
    external_id: string | null;
    /**
     * The description of the reservation.
     */
    description: string | null;
    /**
     * The ID of the inventory item that the reservation is for.
     */
    inventory_item_id: string;
    /**
     * The inventory item that the reservation is for.
     */
    inventory_item?: AdminInventoryItem;
    /**
     * Custom key-value pairs that can be added to the reservation.
     */
    metadata?: Record<string, unknown>;
    /**
     * The ID of the user that created the reservation.
     */
    created_by?: string | null;
    /**
     * The date that the reservation was deleted.
     */
    deleted_at?: Date | string | null;
    /**
     * The date that the reservation was created.
     */
    created_at?: Date | string;
    /**
     * The date that the reservation was updated.
     */
    updated_at?: Date | string;
}
//# sourceMappingURL=entities.d.ts.map