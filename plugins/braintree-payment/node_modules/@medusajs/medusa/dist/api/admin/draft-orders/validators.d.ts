import { z } from "zod";
export type AdminGetDraftOrderParamsType = z.infer<typeof AdminGetDraftOrderParams>;
export declare const AdminGetDraftOrderParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export type AdminGetDraftOrdersParamsType = z.infer<typeof AdminGetDraftOrdersParams>;
export declare const AdminGetDraftOrdersParams: z.ZodObject<{
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    $and: z.ZodOptional<z.ZodLazy<z.ZodArray<z.ZodObject<any, z.UnknownKeysParam, z.ZodTypeAny, {
        [x: string]: any;
    }, {
        [x: string]: any;
    }>, "many">>>;
    $or: z.ZodOptional<z.ZodLazy<z.ZodArray<z.ZodObject<any, z.UnknownKeysParam, z.ZodTypeAny, {
        [x: string]: any;
    }, {
        [x: string]: any;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    $and?: {
        [x: string]: any;
    }[] | undefined;
    $or?: {
        [x: string]: any;
    }[] | undefined;
}, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    $and?: {
        [x: string]: any;
    }[] | undefined;
    $or?: {
        [x: string]: any;
    }[] | undefined;
}>;
declare enum Status {
    completed = "completed"
}
export type AdminCreateDraftOrderType = z.infer<typeof CreateDraftOrder>;
declare const CreateDraftOrder: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof Status>>;
    sales_channel_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    customer_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    billing_address: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        first_name: z.ZodOptional<z.ZodString>;
        last_name: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        company: z.ZodOptional<z.ZodString>;
        address_1: z.ZodOptional<z.ZodString>;
        address_2: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        country_code: z.ZodOptional<z.ZodString>;
        province: z.ZodOptional<z.ZodString>;
        postal_code: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strict", z.ZodTypeAny, {
        first_name?: string | undefined;
        last_name?: string | undefined;
        phone?: string | undefined;
        company?: string | undefined;
        address_1?: string | undefined;
        address_2?: string | undefined;
        city?: string | undefined;
        country_code?: string | undefined;
        province?: string | undefined;
        postal_code?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }, {
        first_name?: string | undefined;
        last_name?: string | undefined;
        phone?: string | undefined;
        company?: string | undefined;
        address_1?: string | undefined;
        address_2?: string | undefined;
        city?: string | undefined;
        country_code?: string | undefined;
        province?: string | undefined;
        postal_code?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }>, z.ZodString]>>;
    shipping_address: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        first_name: z.ZodOptional<z.ZodString>;
        last_name: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        company: z.ZodOptional<z.ZodString>;
        address_1: z.ZodOptional<z.ZodString>;
        address_2: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        country_code: z.ZodOptional<z.ZodString>;
        province: z.ZodOptional<z.ZodString>;
        postal_code: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strict", z.ZodTypeAny, {
        first_name?: string | undefined;
        last_name?: string | undefined;
        phone?: string | undefined;
        company?: string | undefined;
        address_1?: string | undefined;
        address_2?: string | undefined;
        city?: string | undefined;
        country_code?: string | undefined;
        province?: string | undefined;
        postal_code?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }, {
        first_name?: string | undefined;
        last_name?: string | undefined;
        phone?: string | undefined;
        company?: string | undefined;
        address_1?: string | undefined;
        address_2?: string | undefined;
        city?: string | undefined;
        country_code?: string | undefined;
        province?: string | undefined;
        postal_code?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }>, z.ZodString]>>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        variant_sku: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        variant_barcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /**
         * Use variant_sku instead
         * @deprecated
         */
        sku: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /**
         * Use variant_barcode instead
         * @deprecated
         */
        barcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        variant_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        unit_price: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodNumber, z.ZodString, z.ZodObject<{
            value: z.ZodString;
            precision: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value: string;
            precision: number;
        }, {
            value: string;
            precision: number;
        }>]>>>;
        quantity: z.ZodNumber;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        title?: string | null | undefined;
        variant_sku?: string | null | undefined;
        variant_barcode?: string | null | undefined;
        sku?: string | null | undefined;
        barcode?: string | null | undefined;
        variant_id?: string | null | undefined;
        unit_price?: string | number | {
            value: string;
            precision: number;
        } | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
    }, {
        quantity: number;
        title?: string | null | undefined;
        variant_sku?: string | null | undefined;
        variant_barcode?: string | null | undefined;
        sku?: string | null | undefined;
        barcode?: string | null | undefined;
        variant_id?: string | null | undefined;
        unit_price?: string | number | {
            value: string;
            precision: number;
        } | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
    }>, "many">>;
    region_id: z.ZodString;
    promo_codes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    currency_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    no_notification_order: z.ZodOptional<z.ZodBoolean>;
    shipping_methods: z.ZodOptional<z.ZodArray<z.ZodObject<{
        shipping_method_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        name: z.ZodString;
        shipping_option_id: z.ZodString;
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        amount: z.ZodUnion<[z.ZodNumber, z.ZodString, z.ZodObject<{
            value: z.ZodString;
            precision: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value: string;
            precision: number;
        }, {
            value: string;
            precision: number;
        }>]>;
    }, "strip", z.ZodTypeAny, {
        shipping_option_id: string;
        name: string;
        amount: (string | number | {
            value: string;
            precision: number;
        }) & (string | number | {
            value: string;
            precision: number;
        } | undefined);
        shipping_method_id?: string | null | undefined;
        data?: Record<string, unknown> | undefined;
    }, {
        shipping_option_id: string;
        name: string;
        amount: (string | number | {
            value: string;
            precision: number;
        }) & (string | number | {
            value: string;
            precision: number;
        } | undefined);
        shipping_method_id?: string | null | undefined;
        data?: Record<string, unknown> | undefined;
    }>, "many">>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strict", z.ZodTypeAny, {
    region_id: string;
    status?: Status.completed | undefined;
    sales_channel_id?: string | null | undefined;
    email?: string | null | undefined;
    customer_id?: string | null | undefined;
    billing_address?: string | {
        first_name?: string | undefined;
        last_name?: string | undefined;
        phone?: string | undefined;
        company?: string | undefined;
        address_1?: string | undefined;
        address_2?: string | undefined;
        city?: string | undefined;
        country_code?: string | undefined;
        province?: string | undefined;
        postal_code?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    } | undefined;
    shipping_address?: string | {
        first_name?: string | undefined;
        last_name?: string | undefined;
        phone?: string | undefined;
        company?: string | undefined;
        address_1?: string | undefined;
        address_2?: string | undefined;
        city?: string | undefined;
        country_code?: string | undefined;
        province?: string | undefined;
        postal_code?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    } | undefined;
    items?: {
        quantity: number;
        title?: string | null | undefined;
        variant_sku?: string | null | undefined;
        variant_barcode?: string | null | undefined;
        sku?: string | null | undefined;
        barcode?: string | null | undefined;
        variant_id?: string | null | undefined;
        unit_price?: string | number | {
            value: string;
            precision: number;
        } | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
    }[] | undefined;
    promo_codes?: string[] | undefined;
    currency_code?: string | null | undefined;
    no_notification_order?: boolean | undefined;
    shipping_methods?: {
        shipping_option_id: string;
        name: string;
        amount: (string | number | {
            value: string;
            precision: number;
        }) & (string | number | {
            value: string;
            precision: number;
        } | undefined);
        shipping_method_id?: string | null | undefined;
        data?: Record<string, unknown> | undefined;
    }[] | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    region_id: string;
    status?: Status.completed | undefined;
    sales_channel_id?: string | null | undefined;
    email?: string | null | undefined;
    customer_id?: string | null | undefined;
    billing_address?: string | {
        first_name?: string | undefined;
        last_name?: string | undefined;
        phone?: string | undefined;
        company?: string | undefined;
        address_1?: string | undefined;
        address_2?: string | undefined;
        city?: string | undefined;
        country_code?: string | undefined;
        province?: string | undefined;
        postal_code?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    } | undefined;
    shipping_address?: string | {
        first_name?: string | undefined;
        last_name?: string | undefined;
        phone?: string | undefined;
        company?: string | undefined;
        address_1?: string | undefined;
        address_2?: string | undefined;
        city?: string | undefined;
        country_code?: string | undefined;
        province?: string | undefined;
        postal_code?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    } | undefined;
    items?: {
        quantity: number;
        title?: string | null | undefined;
        variant_sku?: string | null | undefined;
        variant_barcode?: string | null | undefined;
        sku?: string | null | undefined;
        barcode?: string | null | undefined;
        variant_id?: string | null | undefined;
        unit_price?: string | number | {
            value: string;
            precision: number;
        } | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
    }[] | undefined;
    promo_codes?: string[] | undefined;
    currency_code?: string | null | undefined;
    no_notification_order?: boolean | undefined;
    shipping_methods?: {
        shipping_option_id: string;
        name: string;
        amount: (string | number | {
            value: string;
            precision: number;
        }) & (string | number | {
            value: string;
            precision: number;
        } | undefined);
        shipping_method_id?: string | null | undefined;
        data?: Record<string, unknown> | undefined;
    }[] | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export declare const AdminCreateDraftOrder: (additionalDataValidator?: z.ZodOptional<z.ZodNullable<z.ZodObject<any, any>>>) => z.ZodObject<any, any, z.ZodTypeAny, {
    [x: string]: any;
}, {
    [x: string]: any;
}> | z.ZodEffects<any, any, any>;
export type AdminUpdateDraftOrderType = z.infer<typeof AdminUpdateDraftOrder>;
export declare const AdminUpdateDraftOrder: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    customer_id: z.ZodOptional<z.ZodString>;
    sales_channel_id: z.ZodOptional<z.ZodString>;
    shipping_address: z.ZodOptional<z.ZodObject<{
        first_name: z.ZodOptional<z.ZodString>;
        last_name: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        company: z.ZodOptional<z.ZodString>;
        address_1: z.ZodOptional<z.ZodString>;
        address_2: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        country_code: z.ZodOptional<z.ZodString>;
        province: z.ZodOptional<z.ZodString>;
        postal_code: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strict", z.ZodTypeAny, {
        first_name?: string | undefined;
        last_name?: string | undefined;
        phone?: string | undefined;
        company?: string | undefined;
        address_1?: string | undefined;
        address_2?: string | undefined;
        city?: string | undefined;
        country_code?: string | undefined;
        province?: string | undefined;
        postal_code?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }, {
        first_name?: string | undefined;
        last_name?: string | undefined;
        phone?: string | undefined;
        company?: string | undefined;
        address_1?: string | undefined;
        address_2?: string | undefined;
        city?: string | undefined;
        country_code?: string | undefined;
        province?: string | undefined;
        postal_code?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }>>;
    billing_address: z.ZodOptional<z.ZodObject<{
        first_name: z.ZodOptional<z.ZodString>;
        last_name: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        company: z.ZodOptional<z.ZodString>;
        address_1: z.ZodOptional<z.ZodString>;
        address_2: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        country_code: z.ZodOptional<z.ZodString>;
        province: z.ZodOptional<z.ZodString>;
        postal_code: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strict", z.ZodTypeAny, {
        first_name?: string | undefined;
        last_name?: string | undefined;
        phone?: string | undefined;
        company?: string | undefined;
        address_1?: string | undefined;
        address_2?: string | undefined;
        city?: string | undefined;
        country_code?: string | undefined;
        province?: string | undefined;
        postal_code?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }, {
        first_name?: string | undefined;
        last_name?: string | undefined;
        phone?: string | undefined;
        company?: string | undefined;
        address_1?: string | undefined;
        address_2?: string | undefined;
        city?: string | undefined;
        country_code?: string | undefined;
        province?: string | undefined;
        postal_code?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    customer_id?: string | undefined;
    sales_channel_id?: string | undefined;
    shipping_address?: {
        first_name?: string | undefined;
        last_name?: string | undefined;
        phone?: string | undefined;
        company?: string | undefined;
        address_1?: string | undefined;
        address_2?: string | undefined;
        city?: string | undefined;
        country_code?: string | undefined;
        province?: string | undefined;
        postal_code?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    } | undefined;
    billing_address?: {
        first_name?: string | undefined;
        last_name?: string | undefined;
        phone?: string | undefined;
        company?: string | undefined;
        address_1?: string | undefined;
        address_2?: string | undefined;
        city?: string | undefined;
        country_code?: string | undefined;
        province?: string | undefined;
        postal_code?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    } | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    email?: string | undefined;
    customer_id?: string | undefined;
    sales_channel_id?: string | undefined;
    shipping_address?: {
        first_name?: string | undefined;
        last_name?: string | undefined;
        phone?: string | undefined;
        company?: string | undefined;
        address_1?: string | undefined;
        address_2?: string | undefined;
        city?: string | undefined;
        country_code?: string | undefined;
        province?: string | undefined;
        postal_code?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    } | undefined;
    billing_address?: {
        first_name?: string | undefined;
        last_name?: string | undefined;
        phone?: string | undefined;
        company?: string | undefined;
        address_1?: string | undefined;
        address_2?: string | undefined;
        city?: string | undefined;
        country_code?: string | undefined;
        province?: string | undefined;
        postal_code?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    } | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export type AdminAddDraftOrderPromotionsType = z.infer<typeof AdminAddDraftOrderPromotions>;
export declare const AdminAddDraftOrderPromotions: z.ZodObject<{
    promo_codes: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    promo_codes: string[];
}, {
    promo_codes: string[];
}>;
export type AdminRemoveDraftOrderPromotionsType = z.infer<typeof AdminRemoveDraftOrderPromotions>;
export declare const AdminRemoveDraftOrderPromotions: z.ZodObject<{
    promo_codes: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    promo_codes: string[];
}, {
    promo_codes: string[];
}>;
export type AdminUpdateDraftOrderItemType = z.infer<typeof AdminUpdateDraftOrderItem>;
export declare const AdminUpdateDraftOrderItem: z.ZodObject<{
    quantity: z.ZodNumber;
    unit_price: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    compare_at_unit_price: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    internal_note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    unit_price?: number | null | undefined;
    compare_at_unit_price?: number | null | undefined;
    internal_note?: string | undefined;
}, {
    quantity: number;
    unit_price?: number | null | undefined;
    compare_at_unit_price?: number | null | undefined;
    internal_note?: string | undefined;
}>;
export type AdminUpdateDraftOrderActionItemType = z.infer<typeof AdminUpdateDraftOrderActionItem>;
export declare const AdminUpdateDraftOrderActionItem: z.ZodObject<{
    quantity: z.ZodNumber;
    unit_price: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    compare_at_unit_price: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    internal_note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    unit_price?: number | null | undefined;
    compare_at_unit_price?: number | null | undefined;
    internal_note?: string | undefined;
}, {
    quantity: number;
    unit_price?: number | null | undefined;
    compare_at_unit_price?: number | null | undefined;
    internal_note?: string | undefined;
}>;
export declare const AdminAddDraftOrderItems: z.ZodObject<{
    items: z.ZodEffects<z.ZodArray<z.ZodObject<{
        variant_id: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        unit_price: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        compare_at_unit_price: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        internal_note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        allow_backorder: z.ZodOptional<z.ZodBoolean>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        variant_id?: string | undefined;
        title?: string | undefined;
        unit_price?: number | null | undefined;
        compare_at_unit_price?: number | null | undefined;
        internal_note?: string | null | undefined;
        allow_backorder?: boolean | undefined;
        metadata?: Record<string, unknown> | undefined;
    }, {
        quantity: number;
        variant_id?: string | undefined;
        title?: string | undefined;
        unit_price?: number | null | undefined;
        compare_at_unit_price?: number | null | undefined;
        internal_note?: string | null | undefined;
        allow_backorder?: boolean | undefined;
        metadata?: Record<string, unknown> | undefined;
    }>, "many">, {
        quantity: number;
        variant_id?: string | undefined;
        title?: string | undefined;
        unit_price?: number | null | undefined;
        compare_at_unit_price?: number | null | undefined;
        internal_note?: string | null | undefined;
        allow_backorder?: boolean | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[], {
        quantity: number;
        variant_id?: string | undefined;
        title?: string | undefined;
        unit_price?: number | null | undefined;
        compare_at_unit_price?: number | null | undefined;
        internal_note?: string | null | undefined;
        allow_backorder?: boolean | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[]>;
}, "strip", z.ZodTypeAny, {
    items: {
        quantity: number;
        variant_id?: string | undefined;
        title?: string | undefined;
        unit_price?: number | null | undefined;
        compare_at_unit_price?: number | null | undefined;
        internal_note?: string | null | undefined;
        allow_backorder?: boolean | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[];
}, {
    items: {
        quantity: number;
        variant_id?: string | undefined;
        title?: string | undefined;
        unit_price?: number | null | undefined;
        compare_at_unit_price?: number | null | undefined;
        internal_note?: string | null | undefined;
        allow_backorder?: boolean | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[];
}>;
export type AdminAddDraftOrderItemsType = z.infer<typeof AdminAddDraftOrderItems>;
export declare const AdminAddDraftOrderShippingMethod: z.ZodObject<{
    shipping_option_id: z.ZodString;
    custom_amount: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    internal_note: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    shipping_option_id: string;
    custom_amount?: number | undefined;
    description?: string | undefined;
    internal_note?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    shipping_option_id: string;
    custom_amount?: number | undefined;
    description?: string | undefined;
    internal_note?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export type AdminAddDraftOrderShippingMethodType = z.infer<typeof AdminAddDraftOrderShippingMethod>;
export declare const AdminUpdateDraftOrderActionShippingMethod: z.ZodObject<{
    shipping_option_id: z.ZodString;
    custom_amount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    internal_note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    shipping_option_id: string;
    custom_amount?: number | null | undefined;
    description?: string | null | undefined;
    internal_note?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    shipping_option_id: string;
    custom_amount?: number | null | undefined;
    description?: string | null | undefined;
    internal_note?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export type AdminUpdateDraftOrderActionShippingMethodType = z.infer<typeof AdminUpdateDraftOrderActionShippingMethod>;
export declare const AdminUpdateDraftOrderShippingMethod: z.ZodObject<{
    shipping_option_id: z.ZodOptional<z.ZodString>;
    custom_amount: z.ZodOptional<z.ZodNumber>;
    internal_note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    shipping_option_id?: string | undefined;
    custom_amount?: number | undefined;
    internal_note?: string | null | undefined;
}, {
    shipping_option_id?: string | undefined;
    custom_amount?: number | undefined;
    internal_note?: string | null | undefined;
}>;
export type AdminUpdateDraftOrderShippingMethodType = z.infer<typeof AdminUpdateDraftOrderShippingMethod>;
export {};
//# sourceMappingURL=validators.d.ts.map