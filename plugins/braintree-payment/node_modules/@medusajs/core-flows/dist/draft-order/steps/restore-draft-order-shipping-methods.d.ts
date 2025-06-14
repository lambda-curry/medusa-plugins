import { BigNumberInput } from "@medusajs/types";
export declare const restoreDraftOrderShippingMethodsStepId = "restore-draft-order-shipping-methods";
/**
 * The details of the shipping methods to restore.
 */
export interface RestoreDraftOrderShippingMethodsStepInput {
    /**
     * The shipping methods to restore.
     */
    shippingMethods: {
        /**
         * The ID of the shipping method.
         */
        id: string;
        /**
         * The shipping method's details before the edit.
         */
        before: {
            /**
             * The ID of the shipping option.
             */
            shipping_option_id: string;
            /**
             * The amount of the shipping method.
             */
            amount: BigNumberInput;
        };
        /**
         * The shipping method's details after the edit.
         */
        after: {
            /**
             * The ID of the shipping option.
             */
            shipping_option_id: string;
            /**
             * The amount of the shipping method.
             */
            amount: BigNumberInput;
        };
    }[];
}
/**
 * This step restores the shipping methods of a draft order.
 * It's useful when you need to revert changes made by a canceled draft order edit.
 *
 * @example
 * const data = restoreDraftOrderShippingMethodsStep({
 *   shippingMethods: [
 *     {
 *       id: "shipping_method_123",
 *       before: {
 *         shipping_option_id: "shipping_option_123",
 *         amount: 10
 *       },
 *       after: {
 *         shipping_option_id: "shipping_option_123",
 *         amount: 10
 *       }
 *     },
 *   ],
 * })
 */
export declare const restoreDraftOrderShippingMethodsStep: import("@medusajs/framework/workflows-sdk").StepFunction<RestoreDraftOrderShippingMethodsStepInput, undefined>;
//# sourceMappingURL=restore-draft-order-shipping-methods.d.ts.map