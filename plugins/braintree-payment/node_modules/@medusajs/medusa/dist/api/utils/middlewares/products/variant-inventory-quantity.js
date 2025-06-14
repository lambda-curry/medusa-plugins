"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapVariantsWithInventoryQuantityForSalesChannel = exports.wrapVariantsWithTotalInventoryQuantity = void 0;
const utils_1 = require("@medusajs/framework/utils");
const filter_by_valid_sales_channels_1 = require("./filter-by-valid-sales-channels");
const wrapVariantsWithTotalInventoryQuantity = async (req, variants) => {
    const variantIds = (variants ?? []).map((variant) => variant.id).flat(1);
    if (!variantIds.length) {
        return;
    }
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const availability = await (0, utils_1.getTotalVariantAvailability)(query, {
        variant_ids: variantIds,
    });
    wrapVariants(variants, availability);
};
exports.wrapVariantsWithTotalInventoryQuantity = wrapVariantsWithTotalInventoryQuantity;
const wrapVariantsWithInventoryQuantityForSalesChannel = async (req, variants) => {
    const salesChannelIds = (0, filter_by_valid_sales_channels_1.transformAndValidateSalesChannelIds)(req);
    const publishableApiKeySalesChannelIds = req.publishable_key_context.sales_channel_ids ?? [];
    let channelsToUse;
    if (publishableApiKeySalesChannelIds.length === 1) {
        channelsToUse = publishableApiKeySalesChannelIds[0];
    }
    else if (salesChannelIds.length === 1) {
        channelsToUse = salesChannelIds[0];
    }
    else {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Inventory availability cannot be calculated in the given context. Either provide a single sales channel id or configure a single sales channel in the publishable key`);
    }
    variants ??= [];
    const variantIds = variants.map((variant) => variant.id).flat(1);
    if (!variantIds.length) {
        return;
    }
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const availability = await (0, utils_1.getVariantAvailability)(query, {
        variant_ids: variantIds,
        sales_channel_id: channelsToUse,
    });
    wrapVariants(variants, availability);
};
exports.wrapVariantsWithInventoryQuantityForSalesChannel = wrapVariantsWithInventoryQuantityForSalesChannel;
const wrapVariants = (variants, availability) => {
    for (const variant of variants) {
        if (!variant.manage_inventory) {
            continue;
        }
        variant.inventory_quantity = availability[variant.id].availability;
    }
};
//# sourceMappingURL=variant-inventory-quantity.js.map