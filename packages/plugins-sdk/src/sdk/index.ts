import { Auth, Client, type Config } from '@medusajs/js-sdk';
import { Admin } from './admin';
import { Store } from './store';

class MedusaPluginsSDK {
  public client: Client

  public admin: Admin
  public store: Store
  public auth: Auth

  constructor(config: Config) {
    this.client = new Client(config)

    this.admin = new Admin(this.client)
    this.store = new Store(this.client)
    this.auth = new Auth(this.client, config)
  }
}

export {
  MedusaPluginsSDK
}