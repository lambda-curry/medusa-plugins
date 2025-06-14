import { PaginatedResponse } from "../../common";
import { AdminTaxProvider } from "./entities";
export type AdminTaxProviderListResponse = PaginatedResponse<{
    /**
     * The list of tax providers.
     */
    tax_providers: AdminTaxProvider[];
}>;
//# sourceMappingURL=responses.d.ts.map