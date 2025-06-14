import { DeleteResponse, PaginatedResponse } from "../../common";
import { AdminRegion } from "./entities";
export interface AdminRegionResponse {
    /**
     * The region's details.
     */
    region: AdminRegion;
}
export type AdminRegionListResponse = PaginatedResponse<{
    /**
     * The list of regions.
     */
    regions: AdminRegion[];
}>;
export type AdminRegionDeleteResponse = DeleteResponse<"region">;
//# sourceMappingURL=responses.d.ts.map