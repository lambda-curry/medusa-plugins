export interface AdminSalesChannel {
    /**
     * The sales channel's ID.
     */
    id: string;
    /**
     * The sales channel's name.
     */
    name: string;
    /**
     * The sales channel's description.
     */
    description: string | null;
    /**
     * Whether the sales channel is disabled.
     */
    is_disabled: boolean;
    /**
     * Custom key-value pairs that can be added to the sales channel.
     */
    metadata: Record<string, unknown> | null;
    /**
     * The sales channel's creation date.
     */
    created_at: string;
    /**
     * The sales channel's last updated date.
     */
    updated_at: string;
    /**
     * The sales channel's deletion date.
     */
    deleted_at: string | null;
}
//# sourceMappingURL=entities.d.ts.map