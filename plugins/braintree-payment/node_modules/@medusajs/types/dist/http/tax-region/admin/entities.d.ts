import { AdminTaxRate } from "../../tax-rate";
export interface AdminTaxRegion {
    /**
     * The tax region's ID.
     */
    id: string;
    /**
     * The tax region's country code.
     *
     * @example
     * "us"
     */
    country_code: string | null;
    /**
     * The tax region's lower-case [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) province or state code.
     *
     * @example
     * "us-ca"
     */
    province_code: string | null;
    /**
     * Custom key-value pairs that can be added to the tax region.
     */
    metadata: Record<string, unknown> | null;
    /**
     * The ID of the parent tax region.
     */
    parent_id: string | null;
    /**
     * The ID of the tax provider for the region.
     */
    provider_id: string | null;
    /**
     * The date the tax region was created.
     */
    created_at: string;
    /**
     * The date the tax region was updated.
     */
    updated_at: string;
    /**
     * The date the tax region was deleted.
     */
    deleted_at: string | null;
    /**
     * The ID of the user who created the tax region.
     */
    created_by: string | null;
    /**
     * The tax rates associated with the tax region.
     */
    tax_rates: AdminTaxRate[];
    /**
     * The parent tax region.
     */
    parent: AdminTaxRegion | null;
    /**
     * The child tax regions.
     */
    children: AdminTaxRegion[];
}
//# sourceMappingURL=entities.d.ts.map