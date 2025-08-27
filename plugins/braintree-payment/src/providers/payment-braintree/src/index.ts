import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import { BraintreeProviderService, BraintreeImportService } from './services';

const services = [BraintreeProviderService, BraintreeImportService];

export default ModuleProvider(Modules.PAYMENT, {
  services,
});
