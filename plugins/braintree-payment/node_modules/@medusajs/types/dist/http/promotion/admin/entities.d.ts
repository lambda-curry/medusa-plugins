import { BaseApplicationMethod, BasePromotion, BasePromotionRule, BaseRuleAttributeOptions, BaseRuleOperatorOptions, BaseRuleValueOptions } from "../common";
export interface AdminPromotion extends BasePromotion {
    /**
     * The promotion's application method.
     */
    application_method?: AdminApplicationMethod;
    /**
     * The rules for the promotion.
     */
    rules?: AdminPromotionRule[];
}
export interface AdminApplicationMethod extends BaseApplicationMethod {
    /**
     * The associated promotion.
     */
    promotion?: AdminPromotion;
    /**
     * The target rules that strict which cart items or shipping methods can
     * the promotion be applied to.
     */
    target_rules?: AdminPromotionRule[];
    /**
     * The buy rules that specify the conditions for the promotion if its type is `buyget`.
     * It specifies the buy X part of the buy X get Y promotion.
     *
     * For example, if the promotion is a "buy 2 get 1 free" promotion, the buy rules
     * indicate what should be bought to get the promotion.
     */
    buy_rules?: AdminPromotionRule[];
}
export interface AdminPromotionRule extends BasePromotionRule {
}
export interface AdminRuleAttributeOption extends BaseRuleAttributeOptions {
}
export interface AdminRuleOperatorOption extends BaseRuleOperatorOptions {
}
export interface AdminRuleValueOption extends BaseRuleValueOptions {
}
//# sourceMappingURL=entities.d.ts.map