import { OrderDTO } from "../../../order";
import { DeleteResponse, PaginatedResponse } from "../../common";
import { AdminOrderPreview } from "../../order";
import { AdminReturn } from "./entities";
export interface AdminReturnResponse {
    /**
     * The return's details.
     */
    return: AdminReturn;
}
export type AdminReturnsResponse = PaginatedResponse<{
    /**
     * The list of returns.
     */
    returns: AdminReturn[];
}>;
export interface AdminOrderReturnResponse {
    order: OrderDTO;
    return: AdminReturn;
}
export interface AdminReturnPreviewResponse {
    order_preview: AdminOrderPreview;
    return: AdminReturn;
}
export type AdminReturnDeleteResponse = DeleteResponse<"return">;
//# sourceMappingURL=responses.d.ts.map