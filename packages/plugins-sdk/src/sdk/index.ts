import { Auth, Client, type Config } from '@medusajs/js-sdk';
import { ExtendedAdminSDK } from './admin';
import { ExtendedStorefrontSDK } from './store';

export class MedusaPluginsSDK {
  public client: Client

  public admin: ExtendedAdminSDK
  public store: ExtendedStorefrontSDK
  public auth: Auth

  constructor(config: Config) {
    this.client = new Client(config)
    this.admin = new ExtendedAdminSDK(this.client)
    this.store = new ExtendedStorefrontSDK(this.client)
    this.auth = new Auth(this.client, config)
  }
}

