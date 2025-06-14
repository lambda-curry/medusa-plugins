export interface AdminCreateRegion {
    /**
     * The name of the region.
     */
    name: string;
    /**
     * The currency code of the region.
     *
     * @example
     * "usd"
     */
    currency_code: string;
    /**
     * The 2 ISO code of the countries in the region.
     *
     * @example
     * ["us", "ca"]
     */
    countries?: string[];
    /**
     * Whether taxes are automatically calculated during checkout
     * for this region.
     */
    automatic_taxes?: boolean;
    /**
     * Whether prices in this region include taxes by default.
     *
     * Learn more in the [tax-inclusive pricing](https://docs.medusajs.com/resources/commerce-modules/pricing/tax-inclusive-pricing#content) documentation.
     */
    is_tax_inclusive?: boolean;
    /**
     * The IDs of the payment providers that are available in this region. The IDs are
     * of the format `pp_{identifier}_{id}`.
     *
     * @example
     * ["pp_stripe_stripe", "pp_system_default"]
     */
    payment_providers?: string[];
    /**
     * Custom key-value pairs that can be added to the region.
     */
    metadata?: Record<string, any> | null;
}
export interface AdminUpdateRegion {
    /**
     * The name of the region.
     */
    name?: string;
    /**
     * The currency code of the region.
     *
     * @example
     * "usd"
     */
    currency_code?: string;
    /**
     * The 2 ISO code of the countries in the region.
     *
     * @example
     * ["us", "ca"]
     */
    countries?: string[];
    /**
     * Whether taxes are automatically calculated during checkout
     * for this region.
     */
    automatic_taxes?: boolean;
    /**
     * Whether prices in this region include taxes by default.
     *
     * Learn more in the [tax-inclusive pricing](https://docs.medusajs.com/resources/commerce-modules/pricing/tax-inclusive-pricing#content) documentation.
     */
    is_tax_inclusive?: boolean;
    /**
     * The IDs of the payment providers that are available in this region. The IDs are
     * of the format `pp_{identifier}_{id}`.
     *
     * @example
     * ["pp_stripe_stripe", "pp_system_default"]
     */
    payment_providers?: string[];
    /**
     * Custom key-value pairs that can be added to the region.
     */
    metadata?: Record<string, any> | null;
}
//# sourceMappingURL=payloads.d.ts.map