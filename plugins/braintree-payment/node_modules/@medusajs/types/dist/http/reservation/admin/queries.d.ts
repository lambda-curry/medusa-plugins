import { OperatorMap } from "../../../dal";
import { SelectParams } from "../../common";
export interface AdminGetReservationsParams {
    /**
     * The maximum number of reservations to retrieve.
     */
    limit?: number;
    /**
     * The number of reservations to skip.
     */
    offset?: number;
    /**
     * Filter by the ID(s) of the location(s) to retrieve the
     * reservations for.
     */
    location_id?: string | string[];
    /**
     * Filter by the ID(s) of the inventory item(s) to retrieve the
     * reservations for.
     */
    inventory_item_id?: string | string[];
    /**
     * Filter by the ID(s) of the line item(s) to retrieve the
     * reservations for.
     */
    line_item_id?: string | string[];
    /**
     * Filter by the ID(s) of the user(s) to retrieve the
     * reservations they created.
     */
    created_by?: string | string[];
    /**
     * Filter by reservation description(s).
     */
    description?: string | OperatorMap<string>;
    /**
     * Apply filters on the reservation's creation date.
     */
    created_at?: OperatorMap<string>;
    /**
     * Apply filters on the reservation's update date.
     */
    updated_at?: OperatorMap<string>;
    /**
     * Apply filters on the reservation's deletion date.
     */
    deleted_at?: OperatorMap<string>;
}
export interface AdminReservationParams extends SelectParams {
}
//# sourceMappingURL=queries.d.ts.map