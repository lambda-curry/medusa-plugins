export interface AdminShippingProfile {
    /**
     * The ID of the shipping profile.
     */
    id: string;
    /**
     * The name of the shipping profile.
     */
    name: string;
    /**
     * The type of the shipping profile.
     */
    type: string;
    /**
     * Custom key-value pairs that can be added to the shipping profile.
     */
    metadata: Record<string, unknown> | null;
    /**
     * The date when the shipping profile was created.
     */
    created_at: string;
    /**
     * The date when the shipping profile was updated.
     */
    updated_at: string;
    /**
     * The date when the shipping profile was deleted.
     */
    deleted_at: string | null;
}
//# sourceMappingURL=entities.d.ts.map