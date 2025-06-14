import { BaseFilterable, OperatorMap } from "../../../dal";
import { FindParams } from "../../common";
export interface AdminTaxRateListParams extends FindParams, BaseFilterable<AdminTaxRateListParams> {
    /**
     * Query or keywords to search the tax rate's searchable fields.
     */
    q?: string;
    /**
     * Filter by tax region ID(s).
     */
    tax_region_id?: string | string[] | OperatorMap<string | string[]>;
    /**
     * Filter by whether the tax rate is the default tax rate in its tax region.
     */
    is_default?: "true" | "false";
    /**
     * Filter by service zone ID(s) to retrieve tax rates that are associated with the service zones.
     */
    service_zone_id?: string;
    /**
     * Filter by shipping profile ID(s) to retrieve tax rates that are associated with the shipping profiles.
     */
    shipping_profile_id?: string;
    /**
     * Filter by tax provider ID(s) to retrieve tax rates that are associated with the providers.
     */
    provider_id?: string;
    /**
     * Filter by shipping option type ID(s) to retrieve tax rates that are associated with the shipping option types.
     */
    shipping_option_type_id?: string;
    /**
     * Filter by the date the tax rate was created.
     */
    created_at?: OperatorMap<string>;
    /**
     * Filter by the date the tax rate was updated.
     */
    updated_at?: OperatorMap<string>;
    /**
     * Filter by the date the tax rate was deleted.
     */
    deleted_at?: OperatorMap<string>;
}
//# sourceMappingURL=queries.d.ts.map