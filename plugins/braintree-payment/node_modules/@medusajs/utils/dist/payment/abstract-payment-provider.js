"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractPaymentProvider = void 0;
class AbstractPaymentProvider {
    /**
     * This method validates the options of the provider set in `medusa-config.ts`.
     * Implementing this method is optional, but it's useful to ensure that the required
     * options are passed to the provider, or if you have any custom validation logic.
     *
     * If the options aren't valid, throw an error.
     *
     * @param options - The provider's options passed in `medusa-config.ts`.
     *
     * @example
     * class MyPaymentProviderService extends AbstractPaymentProvider<Options> {
     *   static validateOptions(options: Record<any, any>) {
     *     if (!options.apiKey) {
     *       throw new MedusaError(
     *         MedusaError.Types.INVALID_DATA,
     *         "API key is required in the provider's options."
     *       )
     *     }
     *   }
     * }
     */
    static validateOptions(options) { }
    /**
     * The constructor allows you to access resources from the [module's container](https://docs.medusajs.com/learn/fundamentals/modules/container)
     * using the first parameter, and the module's options using the second parameter.
     *
     * If you're creating a client or establishing a connection with a third-party service, do it in the constructor.
     *
     * :::note
     *
     * A module's options are passed when you register it in the Medusa application.
     *
     * :::
     *
     * @param {Record<string, unknown>} cradle - The module's container used to resolve resources.
     * @param {Record<string, unknown>} config - The options passed to the Payment Module provider.
     * @typeParam TConfig - The type of the provider's options passed as a second parameter.
     *
     * @example
     * import { AbstractPaymentProvider } from "@medusajs/framework/utils"
     * import { Logger } from "@medusajs/framework/types"
     *
     * type Options = {
     *   apiKey: string
     * }
     *
     * type InjectedDependencies = {
     *   logger: Logger
     * }
     *
     * class MyPaymentProviderService extends AbstractPaymentProvider<Options> {
     *   protected logger_: Logger
     *   protected options_: Options
     *   // assuming you're initializing a client
     *   protected client
     *
     *   constructor(
     *     container: InjectedDependencies,
     *     options: Options
     *   ) {
     *     super(container, options)
     *
     *     this.logger_ = container.logger
     *     this.options_ = options
     *
     *     // TODO initialize your client
     *   }
     *   // ...
     * }
     *
     * export default MyPaymentProviderService
     */
    constructor(cradle, 
    /**
     * @ignore
     */
    config = {} // eslint-disable-next-line @typescript-eslint/no-empty-function
    ) {
        this.config = config;
        this.container = cradle;
    }
    /**
     * @ignore
     */
    static isPaymentProvider(object) {
        return object?.constructor?._isPaymentProvider;
    }
    /**
     * @ignore
     *
     * Return a unique identifier to retrieve the payment plugin provider
     */
    getIdentifier() {
        const ctr = this.constructor;
        if (!ctr.identifier) {
            throw new Error(`Missing static property "identifier".`);
        }
        return ctr.identifier;
    }
}
exports.AbstractPaymentProvider = AbstractPaymentProvider;
/**
 * @ignore
 */
AbstractPaymentProvider._isPaymentProvider = true;
//# sourceMappingURL=abstract-payment-provider.js.map