import { DAL, ITaxProvider, Logger, TaxTypes } from "@medusajs/framework/types";
type InjectedDependencies = {
    logger?: Logger;
    taxProviderRepository: DAL.RepositoryService;
    [key: `tp_${string}`]: ITaxProvider;
};
declare const TaxProviderService_base: new (container: InjectedDependencies) => import("@medusajs/framework/types").IMedusaInternalService<any, InjectedDependencies>;
export default class TaxProviderService extends TaxProviderService_base {
    #private;
    constructor(container: InjectedDependencies);
    retrieveProvider(providerId: string): ITaxProvider;
    getTaxLines(providerId: string, itemLines: TaxTypes.ItemTaxCalculationLine[], shippingLines: TaxTypes.ShippingTaxCalculationLine[], context: TaxTypes.TaxCalculationContext): Promise<(TaxTypes.ItemTaxLineDTO | TaxTypes.ShippingTaxLineDTO)[]>;
}
export {};
//# sourceMappingURL=tax-provider.d.ts.map