"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProduct = exports.UpdateProductVariant = exports.UpdateVariantPrice = exports.UpdateProductOption = exports.CreateProduct = exports.CreateProductVariant = exports.CreateProductOption = exports.CreateVariantPrice = exports.IdAssociation = exports.numericString = exports.booleanString = void 0;
const zod_1 = require("zod");
const enums_1 = require("./enums");
const booleanString = () => zod_1.z
    .union([zod_1.z.boolean(), zod_1.z.string()])
    .refine((value) => {
    return ["true", "false"].includes(value.toString().toLowerCase());
})
    .transform((value) => {
    return value.toString().toLowerCase() === "true";
});
exports.booleanString = booleanString;
const numericString = () => zod_1.z.number().transform((value) => {
    return value !== null && value !== undefined ? String(value) : value;
});
exports.numericString = numericString;
exports.IdAssociation = zod_1.z.object({
    id: zod_1.z.string(),
});
const statusEnum = zod_1.z.nativeEnum(enums_1.ProductStatus);
exports.CreateVariantPrice = zod_1.z.object({
    currency_code: zod_1.z.string(),
    amount: zod_1.z.number(),
    min_quantity: zod_1.z.number().nullish(),
    max_quantity: zod_1.z.number().nullish(),
    rules: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
});
exports.CreateProductOption = zod_1.z.object({
    title: zod_1.z.string(),
    values: zod_1.z.array(zod_1.z.string()),
});
exports.CreateProductVariant = zod_1.z
    .object({
    title: zod_1.z.string(),
    sku: zod_1.z.string().nullish(),
    ean: zod_1.z.string().nullish(),
    upc: zod_1.z.string().nullish(),
    barcode: zod_1.z.string().nullish(),
    hs_code: zod_1.z.string().nullish(),
    mid_code: zod_1.z.string().nullish(),
    allow_backorder: (0, exports.booleanString)().optional().default(false),
    manage_inventory: (0, exports.booleanString)().optional().default(true),
    variant_rank: zod_1.z.number().optional(),
    weight: zod_1.z.number().nullish(),
    length: zod_1.z.number().nullish(),
    height: zod_1.z.number().nullish(),
    width: zod_1.z.number().nullish(),
    origin_country: zod_1.z.string().nullish(),
    material: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
    prices: zod_1.z.array(exports.CreateVariantPrice),
    options: zod_1.z.record(zod_1.z.string()).optional(),
    inventory_items: zod_1.z
        .array(zod_1.z.object({
        inventory_item_id: zod_1.z.string(),
        required_quantity: zod_1.z.number(),
    }))
        .optional(),
})
    .strict();
exports.CreateProduct = zod_1.z
    .object({
    title: zod_1.z.string(),
    subtitle: zod_1.z.string().nullish(),
    description: zod_1.z.string().nullish(),
    is_giftcard: (0, exports.booleanString)().optional().default(false),
    discountable: (0, exports.booleanString)().optional().default(true),
    images: zod_1.z.array(zod_1.z.object({ url: zod_1.z.string() })).optional(),
    thumbnail: zod_1.z.string().nullish(),
    handle: zod_1.z.string().optional(),
    status: statusEnum.optional().default(enums_1.ProductStatus.DRAFT),
    external_id: zod_1.z.string().nullish(),
    type_id: zod_1.z.string().nullish(),
    collection_id: zod_1.z.string().nullish(),
    categories: zod_1.z.array(exports.IdAssociation).optional(),
    tags: zod_1.z.array(exports.IdAssociation).optional(),
    options: zod_1.z.array(exports.CreateProductOption).optional(),
    variants: zod_1.z.array(exports.CreateProductVariant).optional(),
    sales_channels: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string() })).optional(),
    shipping_profile_id: zod_1.z.string().optional(),
    weight: zod_1.z.number().nullish(),
    length: zod_1.z.number().nullish(),
    height: zod_1.z.number().nullish(),
    width: zod_1.z.number().nullish(),
    hs_code: zod_1.z.string().nullish(),
    mid_code: zod_1.z.string().nullish(),
    origin_country: zod_1.z.string().nullish(),
    material: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
})
    .strict();
exports.UpdateProductOption = zod_1.z.object({
    id: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    values: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.UpdateVariantPrice = zod_1.z.object({
    id: zod_1.z.string().optional(),
    currency_code: zod_1.z.string().optional(),
    amount: zod_1.z.number().optional(),
    min_quantity: zod_1.z.number().nullish(),
    max_quantity: zod_1.z.number().nullish(),
    rules: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
});
exports.UpdateProductVariant = zod_1.z
    .object({
    id: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    prices: zod_1.z.array(exports.UpdateVariantPrice).optional(),
    sku: zod_1.z.string().nullish(),
    ean: zod_1.z.string().nullish(),
    upc: zod_1.z.string().nullish(),
    barcode: zod_1.z.string().nullish(),
    hs_code: zod_1.z.string().nullish(),
    mid_code: zod_1.z.string().nullish(),
    allow_backorder: (0, exports.booleanString)().optional(),
    manage_inventory: (0, exports.booleanString)().optional(),
    variant_rank: zod_1.z.number().optional(),
    weight: (0, exports.numericString)().nullish(),
    length: (0, exports.numericString)().nullish(),
    height: (0, exports.numericString)().nullish(),
    width: (0, exports.numericString)().nullish(),
    origin_country: zod_1.z.string().nullish(),
    material: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
    options: zod_1.z.record(zod_1.z.string()).optional(),
})
    .strict();
exports.UpdateProduct = zod_1.z
    .object({
    id: zod_1.z.string(),
    title: zod_1.z.string().optional(),
    discountable: (0, exports.booleanString)().optional(),
    is_giftcard: (0, exports.booleanString)().optional(),
    options: zod_1.z.array(exports.UpdateProductOption).optional(),
    variants: zod_1.z.array(exports.UpdateProductVariant).optional(),
    status: statusEnum.optional(),
    subtitle: zod_1.z.string().nullish(),
    description: zod_1.z.string().nullish(),
    images: zod_1.z.array(zod_1.z.object({ url: zod_1.z.string() })).optional(),
    thumbnail: zod_1.z.string().nullish(),
    handle: zod_1.z.string().nullish(),
    type_id: zod_1.z.string().nullish(),
    external_id: zod_1.z.string().nullish(),
    collection_id: zod_1.z.string().nullish(),
    categories: zod_1.z.array(exports.IdAssociation).optional(),
    tags: zod_1.z.array(exports.IdAssociation).optional(),
    sales_channels: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string() })).optional(),
    shipping_profile_id: zod_1.z.string().nullish(),
    weight: (0, exports.numericString)().nullish(),
    length: (0, exports.numericString)().nullish(),
    height: (0, exports.numericString)().nullish(),
    width: (0, exports.numericString)().nullish(),
    hs_code: zod_1.z.string().nullish(),
    mid_code: zod_1.z.string().nullish(),
    origin_country: zod_1.z.string().nullish(),
    material: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
})
    .strict();
//# sourceMappingURL=validators.js.map