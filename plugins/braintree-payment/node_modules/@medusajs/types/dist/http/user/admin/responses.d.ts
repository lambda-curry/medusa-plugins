import { DeleteResponse, PaginatedResponse } from "../../common";
import { AdminUser } from "./entities";
export interface AdminUserResponse {
    /**
     * The user's details.
     */
    user: AdminUser;
}
export interface AdminUserListResponse extends PaginatedResponse<{
    /**
     * The list of users.
     */
    users: AdminUser[];
}> {
}
export interface AdminUserDeleteResponse extends DeleteResponse<"user"> {
}
//# sourceMappingURL=responses.d.ts.map