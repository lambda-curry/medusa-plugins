import Medusa, { type Config } from '@medusajs/js-sdk';
import { ExtendedAdminSDK } from './admin';
import { ExtendedStorefrontSDK } from './store';

declare const __BACKEND_URL__: string | undefined;

export const backendUrl = __BACKEND_URL__ ?? 'http://localhost:9000';

class MedusaSDK extends Medusa {
  public store: ExtendedStorefrontSDK;
  public admin: ExtendedAdminSDK;
  constructor(options: Config) {
    super(options);
    this.store = new ExtendedStorefrontSDK(this.client);
    this.admin = new ExtendedAdminSDK(this.client);
  }
}

export const sdk = new MedusaSDK({
  baseUrl: backendUrl,
  auth: {
    type: 'session',
  },
});
