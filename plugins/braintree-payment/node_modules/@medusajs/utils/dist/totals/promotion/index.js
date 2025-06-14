"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPromotionValue = getPromotionValue;
exports.getApplicableQuantity = getApplicableQuantity;
exports.calculateAdjustmentAmountFromPromotion = calculateAdjustmentAmountFromPromotion;
const promotion_1 = require("../../promotion");
const math_1 = require("../math");
function getPromotionValueForPercentage(promotion, lineItemTotal) {
    return math_1.MathBN.mult(math_1.MathBN.div(promotion.value, 100), lineItemTotal);
}
function getPromotionValueForFixed(promotion, itemTotal, allItemsTotal) {
    if (promotion.allocation === promotion_1.ApplicationMethodAllocation.ACROSS) {
        const promotionValueForItem = math_1.MathBN.mult(math_1.MathBN.div(itemTotal, allItemsTotal), promotion.value);
        if (math_1.MathBN.lte(promotionValueForItem, itemTotal)) {
            return promotionValueForItem;
        }
        const percentage = math_1.MathBN.div(math_1.MathBN.mult(itemTotal, 100), promotionValueForItem);
        return math_1.MathBN.mult(promotionValueForItem, math_1.MathBN.div(percentage, 100)).precision(4);
    }
    return promotion.value;
}
function getPromotionValue(promotion, lineItemTotal, lineItemsTotal) {
    if (promotion.type === promotion_1.ApplicationMethodType.PERCENTAGE) {
        return getPromotionValueForPercentage(promotion, lineItemTotal);
    }
    return getPromotionValueForFixed(promotion, lineItemTotal, lineItemsTotal);
}
function getApplicableQuantity(lineItem, maxQuantity) {
    if (maxQuantity && lineItem.quantity) {
        return math_1.MathBN.min(lineItem.quantity, maxQuantity);
    }
    return lineItem.quantity;
}
function getLineItemUnitPrice(lineItem) {
    return math_1.MathBN.div(lineItem.subtotal, lineItem.quantity);
}
function calculateAdjustmentAmountFromPromotion(lineItem, promotion, lineItemsTotal = 0) {
    /*
      For a promotion with an across allocation, we consider not only the line item total, but also the total of all other line items in the order.
  
      We then distribute the promotion value proportionally across the line items based on the total of each line item.
  
      For example, if the promotion is 100$, and the order total is 400$, and the items are:
        item1: 250$
        item2: 150$
        total: 400$
      
      The promotion value for the line items would be:
        item1: 62.5$
        item2: 37.5$
        total: 100$
  
      For the next 100$ promotion, we remove the applied promotions value from the line item total and redistribute the promotion value across the line items based on the updated totals.
  
      Example:
        item1: (250 - 62.5) = 187.5
        item2: (150 - 37.5) = 112.5
        total: 300
  
        The promotion value for the line items would be:
        item1: $62.5
        item2: $37.5
        total: 100$
    
    */
    if (promotion.allocation === promotion_1.ApplicationMethodAllocation.ACROSS) {
        const quantity = getApplicableQuantity(lineItem, promotion.max_quantity);
        const lineItemTotal = math_1.MathBN.mult(getLineItemUnitPrice(lineItem), quantity);
        const applicableTotal = math_1.MathBN.sub(lineItemTotal, promotion.applied_value);
        if (math_1.MathBN.lte(applicableTotal, 0)) {
            return applicableTotal;
        }
        const promotionValue = getPromotionValue(promotion, applicableTotal, lineItemsTotal);
        return math_1.MathBN.min(promotionValue, applicableTotal);
    }
    /*
      For a promotion with an EACH allocation, we calculate the promotion value on the line item as a whole.
  
      Example:
        item1: {
          subtotal: 200$,
          unit_price: 50$,
          quantity: 4,
        }
        
        When applying promotions, we need to consider 2 values:
          1. What is the maximum promotion value?
          2. What is the maximum promotion we can apply on the line item?
        
        After applying each promotion, we reduce the maximum promotion that you can add to the line item by the value of the promotions applied.
        
        We then apply whichever is lower.
    */
    const remainingItemTotal = math_1.MathBN.sub(lineItem.subtotal, promotion.applied_value);
    const unitPrice = math_1.MathBN.div(lineItem.subtotal, lineItem.quantity);
    const maximumPromotionTotal = math_1.MathBN.mult(unitPrice, promotion.max_quantity ?? math_1.MathBN.convert(1));
    const applicableTotal = math_1.MathBN.min(remainingItemTotal, maximumPromotionTotal);
    if (math_1.MathBN.lte(applicableTotal, 0)) {
        return math_1.MathBN.convert(0);
    }
    const promotionValue = getPromotionValue(promotion, applicableTotal, lineItemsTotal);
    return math_1.MathBN.min(promotionValue, applicableTotal);
}
//# sourceMappingURL=index.js.map