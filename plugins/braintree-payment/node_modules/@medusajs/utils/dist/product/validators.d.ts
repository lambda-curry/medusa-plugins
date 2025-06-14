import { z } from "zod";
import { ProductStatus } from "./enums";
export declare const booleanString: () => z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>;
export declare const numericString: () => z.ZodEffects<z.ZodNumber, string, number>;
export declare const IdAssociation: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const CreateVariantPrice: z.ZodObject<{
    currency_code: z.ZodString;
    amount: z.ZodNumber;
    min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    currency_code: string;
    amount: number;
    min_quantity?: number | null | undefined;
    max_quantity?: number | null | undefined;
    rules?: Record<string, string> | undefined;
}, {
    currency_code: string;
    amount: number;
    min_quantity?: number | null | undefined;
    max_quantity?: number | null | undefined;
    rules?: Record<string, string> | undefined;
}>;
export declare const CreateProductOption: z.ZodObject<{
    title: z.ZodString;
    values: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    values: string[];
    title: string;
}, {
    values: string[];
    title: string;
}>;
export declare const CreateProductVariant: z.ZodObject<{
    title: z.ZodString;
    sku: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ean: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    upc: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    barcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    allow_backorder: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>>;
    manage_inventory: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>>;
    variant_rank: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    length: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    width: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    prices: z.ZodArray<z.ZodObject<{
        currency_code: z.ZodString;
        amount: z.ZodNumber;
        min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        currency_code: string;
        amount: number;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }, {
        currency_code: string;
        amount: number;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }>, "many">;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    inventory_items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        inventory_item_id: z.ZodString;
        required_quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        inventory_item_id: string;
        required_quantity: number;
    }, {
        inventory_item_id: string;
        required_quantity: number;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    title: string;
    allow_backorder: boolean;
    manage_inventory: boolean;
    prices: {
        currency_code: string;
        amount: number;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }[];
    sku?: string | null | undefined;
    ean?: string | null | undefined;
    upc?: string | null | undefined;
    barcode?: string | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    variant_rank?: number | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    origin_country?: string | null | undefined;
    material?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    options?: Record<string, string> | undefined;
    inventory_items?: {
        inventory_item_id: string;
        required_quantity: number;
    }[] | undefined;
}, {
    title: string;
    prices: {
        currency_code: string;
        amount: number;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }[];
    sku?: string | null | undefined;
    ean?: string | null | undefined;
    upc?: string | null | undefined;
    barcode?: string | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    allow_backorder?: string | boolean | undefined;
    manage_inventory?: string | boolean | undefined;
    variant_rank?: number | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    origin_country?: string | null | undefined;
    material?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    options?: Record<string, string> | undefined;
    inventory_items?: {
        inventory_item_id: string;
        required_quantity: number;
    }[] | undefined;
}>;
export declare const CreateProduct: z.ZodObject<{
    title: z.ZodString;
    subtitle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_giftcard: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>>;
    discountable: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>>;
    images: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
    }, {
        url: string;
    }>, "many">>;
    thumbnail: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    handle: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodOptional<z.ZodNativeEnum<typeof ProductStatus>>>;
    external_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    collection_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    categories: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, "many">>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        values: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        values: string[];
        title: string;
    }, {
        values: string[];
        title: string;
    }>, "many">>;
    variants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        sku: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        ean: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        upc: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        barcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        allow_backorder: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>>;
        manage_inventory: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>>;
        variant_rank: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        length: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        width: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        prices: z.ZodArray<z.ZodObject<{
            currency_code: z.ZodString;
            amount: z.ZodNumber;
            min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            currency_code: string;
            amount: number;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }, {
            currency_code: string;
            amount: number;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }>, "many">;
        options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        inventory_items: z.ZodOptional<z.ZodArray<z.ZodObject<{
            inventory_item_id: z.ZodString;
            required_quantity: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            inventory_item_id: string;
            required_quantity: number;
        }, {
            inventory_item_id: string;
            required_quantity: number;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        title: string;
        allow_backorder: boolean;
        manage_inventory: boolean;
        prices: {
            currency_code: string;
            amount: number;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[];
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
        inventory_items?: {
            inventory_item_id: string;
            required_quantity: number;
        }[] | undefined;
    }, {
        title: string;
        prices: {
            currency_code: string;
            amount: number;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[];
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        allow_backorder?: string | boolean | undefined;
        manage_inventory?: string | boolean | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
        inventory_items?: {
            inventory_item_id: string;
            required_quantity: number;
        }[] | undefined;
    }>, "many">>;
    sales_channels: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, "many">>;
    shipping_profile_id: z.ZodOptional<z.ZodString>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    length: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    width: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strict", z.ZodTypeAny, {
    title: string;
    is_giftcard: boolean;
    discountable: boolean;
    status: ProductStatus;
    subtitle?: string | null | undefined;
    description?: string | null | undefined;
    images?: {
        url: string;
    }[] | undefined;
    thumbnail?: string | null | undefined;
    handle?: string | undefined;
    external_id?: string | null | undefined;
    type_id?: string | null | undefined;
    collection_id?: string | null | undefined;
    categories?: {
        id: string;
    }[] | undefined;
    tags?: {
        id: string;
    }[] | undefined;
    options?: {
        values: string[];
        title: string;
    }[] | undefined;
    variants?: {
        title: string;
        allow_backorder: boolean;
        manage_inventory: boolean;
        prices: {
            currency_code: string;
            amount: number;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[];
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
        inventory_items?: {
            inventory_item_id: string;
            required_quantity: number;
        }[] | undefined;
    }[] | undefined;
    sales_channels?: {
        id: string;
    }[] | undefined;
    shipping_profile_id?: string | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    origin_country?: string | null | undefined;
    material?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    title: string;
    subtitle?: string | null | undefined;
    description?: string | null | undefined;
    is_giftcard?: string | boolean | undefined;
    discountable?: string | boolean | undefined;
    images?: {
        url: string;
    }[] | undefined;
    thumbnail?: string | null | undefined;
    handle?: string | undefined;
    status?: ProductStatus | undefined;
    external_id?: string | null | undefined;
    type_id?: string | null | undefined;
    collection_id?: string | null | undefined;
    categories?: {
        id: string;
    }[] | undefined;
    tags?: {
        id: string;
    }[] | undefined;
    options?: {
        values: string[];
        title: string;
    }[] | undefined;
    variants?: {
        title: string;
        prices: {
            currency_code: string;
            amount: number;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[];
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        allow_backorder?: string | boolean | undefined;
        manage_inventory?: string | boolean | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
        inventory_items?: {
            inventory_item_id: string;
            required_quantity: number;
        }[] | undefined;
    }[] | undefined;
    sales_channels?: {
        id: string;
    }[] | undefined;
    shipping_profile_id?: string | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    origin_country?: string | null | undefined;
    material?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export declare const UpdateProductOption: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    values: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id?: string | undefined;
    title?: string | undefined;
    values?: string[] | undefined;
}, {
    id?: string | undefined;
    title?: string | undefined;
    values?: string[] | undefined;
}>;
export declare const UpdateVariantPrice: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    currency_code: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id?: string | undefined;
    currency_code?: string | undefined;
    amount?: number | undefined;
    min_quantity?: number | null | undefined;
    max_quantity?: number | null | undefined;
    rules?: Record<string, string> | undefined;
}, {
    id?: string | undefined;
    currency_code?: string | undefined;
    amount?: number | undefined;
    min_quantity?: number | null | undefined;
    max_quantity?: number | null | undefined;
    rules?: Record<string, string> | undefined;
}>;
export declare const UpdateProductVariant: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    prices: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        currency_code: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodNumber>;
        min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id?: string | undefined;
        currency_code?: string | undefined;
        amount?: number | undefined;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }, {
        id?: string | undefined;
        currency_code?: string | undefined;
        amount?: number | undefined;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }>, "many">>;
    sku: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ean: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    upc: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    barcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    allow_backorder: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    manage_inventory: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    variant_rank: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, string, number>>>;
    length: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, string, number>>>;
    height: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, string, number>>>;
    width: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, string, number>>>;
    origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    id?: string | undefined;
    title?: string | undefined;
    prices?: {
        id?: string | undefined;
        currency_code?: string | undefined;
        amount?: number | undefined;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }[] | undefined;
    sku?: string | null | undefined;
    ean?: string | null | undefined;
    upc?: string | null | undefined;
    barcode?: string | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    allow_backorder?: boolean | undefined;
    manage_inventory?: boolean | undefined;
    variant_rank?: number | undefined;
    weight?: string | null | undefined;
    length?: string | null | undefined;
    height?: string | null | undefined;
    width?: string | null | undefined;
    origin_country?: string | null | undefined;
    material?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    options?: Record<string, string> | undefined;
}, {
    id?: string | undefined;
    title?: string | undefined;
    prices?: {
        id?: string | undefined;
        currency_code?: string | undefined;
        amount?: number | undefined;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }[] | undefined;
    sku?: string | null | undefined;
    ean?: string | null | undefined;
    upc?: string | null | undefined;
    barcode?: string | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    allow_backorder?: string | boolean | undefined;
    manage_inventory?: string | boolean | undefined;
    variant_rank?: number | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    origin_country?: string | null | undefined;
    material?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    options?: Record<string, string> | undefined;
}>;
export declare const UpdateProduct: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    discountable: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    is_giftcard: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        values: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id?: string | undefined;
        title?: string | undefined;
        values?: string[] | undefined;
    }, {
        id?: string | undefined;
        title?: string | undefined;
        values?: string[] | undefined;
    }>, "many">>;
    variants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        prices: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            currency_code: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodNumber>;
            min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }, {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }>, "many">>;
        sku: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        ean: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        upc: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        barcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        allow_backorder: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
        manage_inventory: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
        variant_rank: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, string, number>>>;
        length: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, string, number>>>;
        height: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, string, number>>>;
        width: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, string, number>>>;
        origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strict", z.ZodTypeAny, {
        id?: string | undefined;
        title?: string | undefined;
        prices?: {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[] | undefined;
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        allow_backorder?: boolean | undefined;
        manage_inventory?: boolean | undefined;
        variant_rank?: number | undefined;
        weight?: string | null | undefined;
        length?: string | null | undefined;
        height?: string | null | undefined;
        width?: string | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
    }, {
        id?: string | undefined;
        title?: string | undefined;
        prices?: {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[] | undefined;
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        allow_backorder?: string | boolean | undefined;
        manage_inventory?: string | boolean | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
    }>, "many">>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ProductStatus>>;
    subtitle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    images: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
    }, {
        url: string;
    }>, "many">>;
    thumbnail: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    handle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    external_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    collection_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    categories: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, "many">>;
    sales_channels: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, "many">>;
    shipping_profile_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, string, number>>>;
    length: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, string, number>>>;
    height: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, string, number>>>;
    width: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, string, number>>>;
    hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strict", z.ZodTypeAny, {
    id: string;
    title?: string | undefined;
    discountable?: boolean | undefined;
    is_giftcard?: boolean | undefined;
    options?: {
        id?: string | undefined;
        title?: string | undefined;
        values?: string[] | undefined;
    }[] | undefined;
    variants?: {
        id?: string | undefined;
        title?: string | undefined;
        prices?: {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[] | undefined;
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        allow_backorder?: boolean | undefined;
        manage_inventory?: boolean | undefined;
        variant_rank?: number | undefined;
        weight?: string | null | undefined;
        length?: string | null | undefined;
        height?: string | null | undefined;
        width?: string | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
    }[] | undefined;
    status?: ProductStatus | undefined;
    subtitle?: string | null | undefined;
    description?: string | null | undefined;
    images?: {
        url: string;
    }[] | undefined;
    thumbnail?: string | null | undefined;
    handle?: string | null | undefined;
    type_id?: string | null | undefined;
    external_id?: string | null | undefined;
    collection_id?: string | null | undefined;
    categories?: {
        id: string;
    }[] | undefined;
    tags?: {
        id: string;
    }[] | undefined;
    sales_channels?: {
        id: string;
    }[] | undefined;
    shipping_profile_id?: string | null | undefined;
    weight?: string | null | undefined;
    length?: string | null | undefined;
    height?: string | null | undefined;
    width?: string | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    origin_country?: string | null | undefined;
    material?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    id: string;
    title?: string | undefined;
    discountable?: string | boolean | undefined;
    is_giftcard?: string | boolean | undefined;
    options?: {
        id?: string | undefined;
        title?: string | undefined;
        values?: string[] | undefined;
    }[] | undefined;
    variants?: {
        id?: string | undefined;
        title?: string | undefined;
        prices?: {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[] | undefined;
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        allow_backorder?: string | boolean | undefined;
        manage_inventory?: string | boolean | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
    }[] | undefined;
    status?: ProductStatus | undefined;
    subtitle?: string | null | undefined;
    description?: string | null | undefined;
    images?: {
        url: string;
    }[] | undefined;
    thumbnail?: string | null | undefined;
    handle?: string | null | undefined;
    type_id?: string | null | undefined;
    external_id?: string | null | undefined;
    collection_id?: string | null | undefined;
    categories?: {
        id: string;
    }[] | undefined;
    tags?: {
        id: string;
    }[] | undefined;
    sales_channels?: {
        id: string;
    }[] | undefined;
    shipping_profile_id?: string | null | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    origin_country?: string | null | undefined;
    material?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
//# sourceMappingURL=validators.d.ts.map