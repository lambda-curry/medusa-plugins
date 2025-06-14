import { BatchResponse, DeleteResponse, PaginatedResponse } from "../../common";
import { AdminShippingOption, AdminShippingOptionRule } from "./entities";
export interface AdminShippingOptionResponse {
    /**
     * The shipping option's details.
     */
    shipping_option: AdminShippingOption;
}
export type AdminShippingOptionListResponse = PaginatedResponse<{
    /**
     * The list of shipping options.
     */
    shipping_options: AdminShippingOption[];
}>;
export interface AdminShippingOptionDeleteResponse extends DeleteResponse<"shipping_option"> {
}
export type AdminUpdateShippingOptionRulesResponse = BatchResponse<AdminShippingOptionRule>;
//# sourceMappingURL=responses.d.ts.map