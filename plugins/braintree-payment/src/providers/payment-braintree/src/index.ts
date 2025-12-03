import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import { BraintreeImportService, BraintreeProviderService } from './services';

const services = [BraintreeProviderService, BraintreeImportService];

export default ModuleProvider(Modules.PAYMENT, {
  services,
});
