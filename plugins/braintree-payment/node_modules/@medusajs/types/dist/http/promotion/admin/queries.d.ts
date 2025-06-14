import { BaseFilterable, OperatorMap } from "../../../dal";
import { ApplicationMethodTypeValues } from "../../../promotion";
import { FindParams, SelectParams } from "../../common";
export interface AdminGetPromotionParams extends SelectParams {
}
export interface AdminGetPromotionsParams extends FindParams, BaseFilterable<AdminGetPromotionsParams> {
    /**
     * Search for a promotion by its searchable
     */
    q?: string;
    /**
     * Filter by promotion code.
     */
    code?: string | string[] | OperatorMap<string>;
    /**
     * Filter by campaign ID to retrieve promotions by campaign.
     */
    campaign_id?: string | string[];
    /**
     * Filter by the promotion's application method.
     */
    application_method?: {
        /**
         * Filter by the promotion's application method currency code.
         */
        currency_code?: string | string[];
    };
    /**
     * Filter by the promotion's currency code.
     */
    currency_code?: string | string[];
    /**
     * Filter by the promotion's created date.
     */
    created_at?: OperatorMap<string>;
    /**
     * Filter by the promotion's updated date.
     */
    updated_at?: OperatorMap<string>;
    /**
     * Filter by the promotion's deleted date.
     */
    deleted_at?: OperatorMap<string>;
    /**
     * Filter by the promotion's application method type.
     */
    application_method_type?: ApplicationMethodTypeValues | ApplicationMethodTypeValues[];
    /**
     * An array of filters to apply on the entity, where each item in the array is joined with an "and" condition.
     */
    $and?: AdminGetPromotionsParams[];
    /**
     * An array of filters to apply on the entity, where each item in the array is joined with an "or" condition.
     */
    $or?: AdminGetPromotionsParams[];
}
export interface AdminGetPromotionRuleParams {
    promotion_type?: string;
    application_method_type?: string;
}
export interface AdminGetPromotionRuleTypeParams extends SelectParams {
    promotion_type?: string;
    application_method_type?: string;
}
export interface AdminGetPromotionsRuleValueParams extends FindParams {
    /**
     * Search for a rule value by its searchable
     */
    q?: string;
    /**
     * Filter by rule value.
     */
    value?: string | string[];
}
//# sourceMappingURL=queries.d.ts.map