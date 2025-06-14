import { DeleteResponse, PaginatedResponse } from "../../common";
import { AdminReservation } from "./entities";
export interface AdminReservationResponse {
    /**
     * The reservation's details.
     */
    reservation: AdminReservation;
}
export type AdminReservationListResponse = PaginatedResponse<{
    /**
     * The list of reservations.
     */
    reservations: AdminReservation[];
}>;
export type AdminReservationDeleteResponse = DeleteResponse<"reservation">;
//# sourceMappingURL=responses.d.ts.map