"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformAndValidateSalesChannelIds = transformAndValidateSalesChannelIds;
exports.filterByValidSalesChannels = filterByValidSalesChannels;
const utils_1 = require("@medusajs/framework/utils");
/**
 * Transforms and validates the sales channel ids
 * @param req
 * @returns The transformed and validated sales channel ids
 */
function transformAndValidateSalesChannelIds(req) {
    const { sales_channel_ids: idsFromPublishableKey = [] } = req.publishable_key_context;
    let { sales_channel_id: idsFromRequest = [] } = req.validatedQuery;
    idsFromRequest = Array.isArray(idsFromRequest)
        ? idsFromRequest
        : [idsFromRequest];
    // If all sales channel ids are not in the publishable key, we throw an error
    if (idsFromRequest.length) {
        const uniqueInParams = (0, utils_1.arrayDifference)(idsFromRequest, idsFromPublishableKey);
        if (uniqueInParams.length) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Requested sales channel is not part of the publishable key`);
        }
        return idsFromRequest;
    }
    if (idsFromPublishableKey?.length) {
        return idsFromPublishableKey;
    }
    return [];
}
// Selection of sales channels happens in the following priority:
// - If a publishable API key is passed, we take the sales channels attached to it and filter them down based on the query params
// - If a sales channel id is passed through query params, we use that
// - If not, we use the default sales channel for the store
function filterByValidSalesChannels() {
    return async (req, _, next) => {
        const salesChannelIds = transformAndValidateSalesChannelIds(req);
        if (!salesChannelIds.length) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Publishable key needs to have a sales channel configured`);
        }
        req.filterableFields.sales_channel_id = salesChannelIds;
        next();
    };
}
//# sourceMappingURL=filter-by-valid-sales-channels.js.map