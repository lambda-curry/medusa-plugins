import { BatchResponse, DeleteResponse, PaginatedResponse } from "../../common";
import { AdminPromotion, AdminPromotionRule, AdminRuleAttributeOption, AdminRuleOperatorOption, AdminRuleValueOption } from "./entities";
export interface AdminPromotionResponse {
    /**
     * The promotion's details.
     */
    promotion: AdminPromotion;
}
export type AdminPromotionListResponse = PaginatedResponse<{
    /**
     * The list of promotions.
     */
    promotions: AdminPromotion[];
}>;
export interface PromotionRuleResponse {
    rule: AdminPromotionRule;
}
export type AdminPromotionRuleListResponse = {
    /**
     * The list of promotion rules.
     */
    rules: AdminPromotionRule[];
};
export interface RuleAttributeOptionsResponse {
    attribute: AdminRuleAttributeOption[];
}
export type AdminRuleAttributeOptionsListResponse = {
    /**
     * The list of rule attribute options.
     */
    attributes: AdminRuleAttributeOption[];
};
export interface RuleOperatorOptionsResponse {
    operator: AdminRuleOperatorOption;
}
export type AdminRuleOperatorOptionsListResponse = PaginatedResponse<{
    operators: AdminRuleOperatorOption[];
}>;
/**
 * @experimental
 */
export interface RuleValueOptionsResponse {
    value: AdminRuleValueOption;
}
/**
 * @experimental
 */
export type AdminRuleValueOptionsListResponse = PaginatedResponse<{
    /**
     * The list of rule value options.
     */
    values: AdminRuleValueOption[];
}>;
export type AdminPromotionRuleBatchResponse = BatchResponse<AdminPromotionRule>;
export type AdminPromotionDeleteResponse = DeleteResponse<"promotion">;
//# sourceMappingURL=responses.d.ts.map