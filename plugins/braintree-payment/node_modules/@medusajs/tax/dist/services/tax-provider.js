"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _TaxProviderService_logger;
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const tax_provider_1 = __importDefault(require("../models/tax-provider"));
class TaxProviderService extends utils_1.ModulesSdkUtils.MedusaInternalService(tax_provider_1.default) {
    constructor(container) {
        super(container);
        _TaxProviderService_logger.set(this, void 0);
        __classPrivateFieldSet(this, _TaxProviderService_logger, container["logger"]
            ? container.logger
            : console, "f");
    }
    retrieveProvider(providerId) {
        try {
            return this.__container__[providerId];
        }
        catch (err) {
            if (err.name === "AwilixResolutionError") {
                const errMessage = `
  Unable to retrieve the tax provider with id: ${providerId}
  Please make sure that the provider is registered in the container and it is configured correctly in your project configuration file.`;
                throw new Error(errMessage);
            }
            const errMessage = `Unable to retrieve the tax provider with id: ${providerId}, the following error occurred: ${err.message}`;
            __classPrivateFieldGet(this, _TaxProviderService_logger, "f").error(errMessage);
            throw new Error(errMessage);
        }
    }
    async getTaxLines(providerId, itemLines, shippingLines, context) {
        const provider = this.retrieveProvider(providerId);
        return provider.getTaxLines(itemLines, shippingLines, context);
    }
}
_TaxProviderService_logger = new WeakMap();
exports.default = TaxProviderService;
//# sourceMappingURL=tax-provider.js.map