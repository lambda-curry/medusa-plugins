"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSchema = void 0;
const utils_1 = require("@medusajs/utils");
exports.defaultSchema = `
  type Product @Listeners(values: ["${utils_1.Modules.PRODUCT}.product.created", "${utils_1.Modules.PRODUCT}.product.updated", "${utils_1.Modules.PRODUCT}.product.deleted"]) {
    id: ID
    title: String
    handle: String
    status: String
    type_id: String
    collection_id: String
    is_giftcard: Boolean
    external_id: String
    created_at: DateTime
    updated_at: DateTime

    variants: [ProductVariant]
    sales_channels: [SalesChannel]
  }

  type ProductVariant @Listeners(values: ["${utils_1.Modules.PRODUCT}.product-variant.created", "${utils_1.Modules.PRODUCT}.product-variant.updated", "${utils_1.Modules.PRODUCT}.product-variant.deleted"]) {
    id: ID
    product_id: String
    sku: String

    prices: [Price]
  }
  
  type Price @Listeners(values: ["${utils_1.Modules.PRICING}.price.created", "${utils_1.Modules.PRICING}.price.updated", "${utils_1.Modules.PRICING}.price.deleted"]) {
    id: ID
    amount: Float
    currency_code: String
  }

  type SalesChannel @Listeners(values: ["${utils_1.Modules.SALES_CHANNEL}.sales-channel.created", "${utils_1.Modules.SALES_CHANNEL}.sales-channel.updated", "${utils_1.Modules.SALES_CHANNEL}.sales-channel.deleted"]) {
    id: ID
    is_disabled: Boolean
  }
`;
//# sourceMappingURL=default-schema.js.map