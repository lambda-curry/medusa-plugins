import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import { BraintreeProviderService } from './services';

const services = [BraintreeProviderService];

export default ModuleProvider(Modules.PAYMENT, {
  services,
});
