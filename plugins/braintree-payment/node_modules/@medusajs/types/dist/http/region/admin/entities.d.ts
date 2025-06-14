import { BaseRegion, BaseRegionCountry } from "../common";
export interface AdminRegion extends Omit<BaseRegion, "countries"> {
    /**
     * The countries in the region.
     */
    countries?: AdminRegionCountry[];
}
export interface AdminRegionCountry extends BaseRegionCountry {
}
//# sourceMappingURL=entities.d.ts.map