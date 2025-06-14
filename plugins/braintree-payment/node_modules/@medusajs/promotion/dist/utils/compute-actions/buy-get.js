"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComputedActionsForBuyGet = getComputedActionsForBuyGet;
exports.sortByBuyGetType = sortByBuyGetType;
const utils_1 = require("@medusajs/framework/utils");
const validations_1 = require("../validations");
const usage_1 = require("./usage");
function sortByPrice(a, b) {
    return utils_1.MathBN.lt(a.subtotal, b.subtotal) ? 1 : -1;
}
/*
  Grabs all the items in the context where the rules apply
  We then sort by price to prioritize most valuable item
*/
function filterItemsByPromotionRules(itemsContext, rules) {
    return itemsContext
        .filter((item) => (0, validations_1.areRulesValidForContext)(rules || [], item, utils_1.ApplicationMethodTargetType.ITEMS))
        .sort(sortByPrice);
}
function getComputedActionsForBuyGet(promotion, itemsContext, methodIdPromoValueMap, eligibleBuyItemMap, eligibleTargetItemMap) {
    const computedActions = [];
    if (!itemsContext) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `"items" should be present as an array in the context to compute actions`);
    }
    if (!itemsContext?.length) {
        return computedActions;
    }
    const minimumBuyQuantity = utils_1.MathBN.convert(promotion.application_method?.buy_rules_min_quantity ?? 0);
    const itemsMap = new Map(itemsContext.map((i) => [i.id, i]));
    if (utils_1.MathBN.lte(minimumBuyQuantity, 0) ||
        !promotion.application_method?.buy_rules?.length) {
        return computedActions;
    }
    const eligibleBuyItems = filterItemsByPromotionRules(itemsContext, promotion.application_method?.buy_rules);
    if (!eligibleBuyItems.length) {
        return computedActions;
    }
    const eligibleBuyItemQuantity = utils_1.MathBN.sum(...eligibleBuyItems.map((item) => item.quantity));
    /*
      Get the total quantity of items where buy rules apply. If the total sum of eligible items
      does not match up to the minimum buy quantity set on the promotion, return early.
    */
    if (utils_1.MathBN.gt(minimumBuyQuantity, eligibleBuyItemQuantity)) {
        return computedActions;
    }
    const eligibleItemsByPromotion = [];
    let accumulatedQuantity = utils_1.MathBN.convert(0);
    /*
      Eligibility of a BuyGet promotion can span across line items. Once an item has been chosen
      as eligible, we can't use this item or its partial remaining quantity when we apply the promotion on
      the target item.
  
      We build the map here to use when we apply promotions on the target items.
    */
    for (const eligibleBuyItem of eligibleBuyItems) {
        if (utils_1.MathBN.gte(accumulatedQuantity, minimumBuyQuantity)) {
            break;
        }
        const reservableQuantity = utils_1.MathBN.min(eligibleBuyItem.quantity, utils_1.MathBN.sub(minimumBuyQuantity, accumulatedQuantity));
        if (utils_1.MathBN.lte(reservableQuantity, 0)) {
            continue;
        }
        eligibleItemsByPromotion.push({
            item_id: eligibleBuyItem.id,
            quantity: utils_1.MathBN.min(eligibleBuyItem.quantity, reservableQuantity).toNumber(),
        });
        accumulatedQuantity = utils_1.MathBN.add(accumulatedQuantity, reservableQuantity);
    }
    // Store the eligible buy items for this promotion code in the map
    eligibleBuyItemMap.set(promotion.code, eligibleItemsByPromotion);
    // If we couldn't accumulate enough items to meet the minimum buy quantity, return early
    if (utils_1.MathBN.lt(accumulatedQuantity, minimumBuyQuantity)) {
        return computedActions;
    }
    // Get the number of target items that should receive the discount
    const targetQuantity = utils_1.MathBN.convert(promotion.application_method?.apply_to_quantity ?? 0);
    // If no target quantity is specified, return early
    if (utils_1.MathBN.lte(targetQuantity, 0)) {
        return computedActions;
    }
    // Find all items that match the target rules criteria
    const eligibleTargetItems = filterItemsByPromotionRules(itemsContext, promotion.application_method?.target_rules);
    // If no items match the target rules, return early
    if (!eligibleTargetItems.length) {
        return computedActions;
    }
    // Track quantities of items that can't be used as targets because they were used in buy rules
    const inapplicableQuantityMap = new Map();
    // Build map of quantities that are ineligible as targets because they were used to satisfy buy rules
    for (const buyItem of eligibleItemsByPromotion) {
        const currentValue = inapplicableQuantityMap.get(buyItem.item_id) || utils_1.MathBN.convert(0);
        inapplicableQuantityMap.set(buyItem.item_id, utils_1.MathBN.add(currentValue, buyItem.quantity));
    }
    // Track items eligible for receiving the discount and total quantity that can be discounted
    const targetItemsByPromotion = [];
    let targetableQuantity = utils_1.MathBN.convert(0);
    // Find items eligible for discount, excluding quantities used in buy rules
    for (const eligibleTargetItem of eligibleTargetItems) {
        // Calculate how much of this item's quantity can receive the discount
        const inapplicableQuantity = inapplicableQuantityMap.get(eligibleTargetItem.id) || utils_1.MathBN.convert(0);
        const applicableQuantity = utils_1.MathBN.sub(eligibleTargetItem.quantity, inapplicableQuantity);
        if (utils_1.MathBN.lte(applicableQuantity, 0)) {
            continue;
        }
        // Calculate how many more items we need to fulfill target quantity
        const remainingNeeded = utils_1.MathBN.sub(targetQuantity, targetableQuantity);
        const fulfillableQuantity = utils_1.MathBN.min(remainingNeeded, applicableQuantity);
        if (utils_1.MathBN.lte(fulfillableQuantity, 0)) {
            continue;
        }
        // Add this item to eligible targets
        targetItemsByPromotion.push({
            item_id: eligibleTargetItem.id,
            quantity: fulfillableQuantity.toNumber(),
        });
        targetableQuantity = utils_1.MathBN.add(targetableQuantity, fulfillableQuantity);
        // If we've found enough items to fulfill target quantity, stop looking
        if (utils_1.MathBN.gte(targetableQuantity, targetQuantity)) {
            break;
        }
    }
    // Store eligible target items for this promotion
    eligibleTargetItemMap.set(promotion.code, targetItemsByPromotion);
    // If we couldn't find enough eligible target items, return early
    if (utils_1.MathBN.lt(targetableQuantity, targetQuantity)) {
        return computedActions;
    }
    // Track remaining quantity to apply discount to and get discount percentage
    let remainingQtyToApply = utils_1.MathBN.convert(targetQuantity);
    const applicablePercentage = promotion.application_method?.value ?? 100;
    // Apply discounts to eligible target items
    for (const targetItem of targetItemsByPromotion) {
        if (utils_1.MathBN.lte(remainingQtyToApply, 0)) {
            break;
        }
        const item = itemsMap.get(targetItem.item_id);
        const appliedPromoValue = methodIdPromoValueMap.get(item.id) ?? utils_1.MathBN.convert(0);
        const multiplier = utils_1.MathBN.min(targetItem.quantity, remainingQtyToApply);
        // Calculate discount amount based on item price and applicable percentage
        const pricePerUnit = utils_1.MathBN.div(item.subtotal, item.quantity);
        const applicableAmount = utils_1.MathBN.mult(pricePerUnit, multiplier);
        const amount = utils_1.MathBN.mult(applicableAmount, applicablePercentage).div(100);
        if (utils_1.MathBN.lte(amount, 0)) {
            continue;
        }
        remainingQtyToApply = utils_1.MathBN.sub(remainingQtyToApply, multiplier);
        // Check if applying this discount would exceed promotion budget
        const budgetExceededAction = (0, usage_1.computeActionForBudgetExceeded)(promotion, amount);
        if (budgetExceededAction) {
            computedActions.push(budgetExceededAction);
            continue;
        }
        // Track total promotional value applied to this item
        methodIdPromoValueMap.set(item.id, utils_1.MathBN.add(appliedPromoValue, amount).toNumber());
        // Add computed discount action
        computedActions.push({
            action: utils_1.ComputedActions.ADD_ITEM_ADJUSTMENT,
            item_id: item.id,
            amount,
            code: promotion.code,
        });
    }
    return computedActions;
}
function sortByBuyGetType(a, b) {
    if (a.type === utils_1.PromotionType.BUYGET && b.type !== utils_1.PromotionType.BUYGET) {
        return -1; // BuyGet promotions come first
    }
    else if (a.type !== utils_1.PromotionType.BUYGET &&
        b.type === utils_1.PromotionType.BUYGET) {
        return 1; // BuyGet promotions come first
    }
    else if (a.type === b.type) {
        // If types are equal, sort by application_method.value in descending order when types are equal
        if (a.application_method.value < b.application_method.value) {
            return 1; // Higher value comes first
        }
        else if (a.application_method.value > b.application_method.value) {
            return -1; // Lower value comes later
        }
        /*
          If the promotion is a BuyGet & the value is the same, we need to sort by the following criteria:
          - buy_rules_min_quantity in descending order
          - apply_to_quantity in descending order
        */
        if (a.type === utils_1.PromotionType.BUYGET) {
            if (a.application_method.buy_rules_min_quantity <
                b.application_method.buy_rules_min_quantity) {
                return 1;
            }
            else if (a.application_method.buy_rules_min_quantity >
                b.application_method.buy_rules_min_quantity) {
                return -1;
            }
            if (a.application_method.apply_to_quantity <
                b.application_method.apply_to_quantity) {
                return 1;
            }
            else if (a.application_method.apply_to_quantity >
                b.application_method.apply_to_quantity) {
                return -1;
            }
        }
        return 0; // If all criteria are equal, keep original order
    }
    else {
        return 0; // If types are different (and not BuyGet), keep original order
    }
}
//# sourceMappingURL=buy-get.js.map