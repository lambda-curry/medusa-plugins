"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwIfNotDraftOrder = throwIfNotDraftOrder;
exports.throwIfCodesAreMissing = throwIfCodesAreMissing;
exports.throwIfCodesAreInactive = throwIfCodesAreInactive;
const utils_1 = require("@medusajs/framework/utils");
function throwIfNotDraftOrder({ order }) {
    if (order.status !== utils_1.OrderStatus.DRAFT && !order.is_draft_order) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Order is not a draft");
    }
}
function getMessageByCount(count, singular, plural) {
    return count === 1 ? singular : plural;
}
function throwIfCodesAreMissing(promo_codes, promotions) {
    const missingPromoCodes = promo_codes.filter((code) => !promotions.some((promotion) => promotion.code === code));
    if (missingPromoCodes.length > 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, getMessageByCount(missingPromoCodes.length, `Promotion code "${missingPromoCodes[0]}" not found`, `Promotion codes "${missingPromoCodes.join('", "')}" not found`));
    }
}
function throwIfCodesAreInactive(promo_codes, promotions) {
    const inactivePromoCodes = promo_codes.filter((code) => promotions.some((promotion) => promotion.code === code && promotion.status !== utils_1.PromotionStatus.ACTIVE));
    if (inactivePromoCodes.length > 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, getMessageByCount(inactivePromoCodes.length, `Promotion code "${inactivePromoCodes[0]}" is not active`, `Promotion codes "${inactivePromoCodes.join('", "')}" are not active`));
    }
}
//# sourceMappingURL=validation.js.map