"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComputedActionsForItems = getComputedActionsForItems;
exports.getComputedActionsForShippingMethods = getComputedActionsForShippingMethods;
exports.getComputedActionsForOrder = getComputedActionsForOrder;
const utils_1 = require("@medusajs/framework/utils");
const validations_1 = require("../validations");
const usage_1 = require("./usage");
function validateContext(contextKey, context) {
    if (!context) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `"${contextKey}" should be present as an array in the context for computeActions`);
    }
}
function getComputedActionsForItems(promotion, items, appliedPromotionsMap, allocationOverride) {
    validateContext("items", items);
    return applyPromotionToItems(promotion, items, appliedPromotionsMap, allocationOverride);
}
function getComputedActionsForShippingMethods(promotion, shippingMethods, appliedPromotionsMap) {
    validateContext("shipping_methods", shippingMethods);
    return applyPromotionToItems(promotion, shippingMethods, appliedPromotionsMap);
}
function getComputedActionsForOrder(promotion, itemApplicationContext, methodIdPromoValueMap) {
    return getComputedActionsForItems(promotion, itemApplicationContext[utils_1.ApplicationMethodTargetType.ITEMS], methodIdPromoValueMap, utils_1.ApplicationMethodAllocation.ACROSS);
}
function applyPromotionToItems(promotion, items, appliedPromotionsMap, allocationOverride) {
    const { application_method: applicationMethod } = promotion;
    if (!applicationMethod) {
        return [];
    }
    const allocation = applicationMethod?.allocation || allocationOverride;
    const target = applicationMethod?.target_type;
    if (!items?.length || !target) {
        return [];
    }
    const computedActions = [];
    const applicableItems = getValidItemsForPromotion(items, promotion);
    if (!applicableItems.length) {
        return computedActions;
    }
    const isTargetShippingMethod = target === utils_1.ApplicationMethodTargetType.SHIPPING_METHODS;
    const isTargetLineItems = target === utils_1.ApplicationMethodTargetType.ITEMS;
    const isTargetOrder = target === utils_1.ApplicationMethodTargetType.ORDER;
    const promotionValue = applicationMethod?.value ?? 0;
    const maxQuantity = isTargetShippingMethod
        ? 1
        : applicationMethod?.max_quantity;
    let lineItemsTotal = utils_1.MathBN.convert(0);
    if (allocation === utils_1.ApplicationMethodAllocation.ACROSS) {
        lineItemsTotal = applicableItems.reduce((acc, item) => utils_1.MathBN.sub(utils_1.MathBN.add(acc, item.subtotal), appliedPromotionsMap.get(item.id) ?? 0), utils_1.MathBN.convert(0));
        if (utils_1.MathBN.lte(lineItemsTotal, 0)) {
            return computedActions;
        }
    }
    for (const item of applicableItems) {
        if (utils_1.MathBN.lte(item.subtotal, 0)) {
            continue;
        }
        if (isTargetShippingMethod) {
            item.quantity = 1;
        }
        const appliedPromoValue = appliedPromotionsMap.get(item.id) ?? 0;
        const amount = (0, utils_1.calculateAdjustmentAmountFromPromotion)(item, {
            value: promotionValue,
            applied_value: appliedPromoValue,
            max_quantity: maxQuantity,
            type: applicationMethod?.type,
            allocation,
        }, lineItemsTotal);
        if (utils_1.MathBN.lte(amount, 0)) {
            continue;
        }
        const budgetExceededAction = (0, usage_1.computeActionForBudgetExceeded)(promotion, amount);
        if (budgetExceededAction) {
            computedActions.push(budgetExceededAction);
            continue;
        }
        appliedPromotionsMap.set(item.id, utils_1.MathBN.add(appliedPromoValue, amount));
        if (isTargetLineItems || isTargetOrder) {
            computedActions.push({
                action: utils_1.ComputedActions.ADD_ITEM_ADJUSTMENT,
                item_id: item.id,
                amount,
                code: promotion.code,
            });
        }
        else if (isTargetShippingMethod) {
            computedActions.push({
                action: utils_1.ComputedActions.ADD_SHIPPING_METHOD_ADJUSTMENT,
                shipping_method_id: item.id,
                amount,
                code: promotion.code,
            });
        }
    }
    return computedActions;
}
function getValidItemsForPromotion(items, promotion) {
    if (!items?.length || !promotion?.application_method) {
        return [];
    }
    const isTargetShippingMethod = promotion.application_method?.target_type === utils_1.ApplicationMethodTargetType.SHIPPING_METHODS;
    const targetRules = promotion.application_method?.target_rules ?? [];
    const hasTargetRules = targetRules.length > 0;
    if (isTargetShippingMethod && !hasTargetRules) {
        return items.filter((item) => item && "subtotal" in item && utils_1.MathBN.gt(item.subtotal, 0));
    }
    return items.filter((item) => {
        if (!item || !("subtotal" in item) || utils_1.MathBN.lte(item.subtotal, 0)) {
            return false;
        }
        if (!isTargetShippingMethod && !("quantity" in item)) {
            return false;
        }
        if (!hasTargetRules) {
            return true;
        }
        return (0, validations_1.areRulesValidForContext)(promotion?.application_method?.target_rules, item, utils_1.ApplicationMethodTargetType.ITEMS);
    });
}
//# sourceMappingURL=line-items.js.map