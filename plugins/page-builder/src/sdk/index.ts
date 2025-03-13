import Medusa, { type Config } from '@medusajs/js-sdk'
import { ExtendedAdmin } from './admin'
import { ExtendedStore } from './store'

export class ExtendedMedusaSDK extends Medusa {
  public admin: ExtendedAdmin
  public store: ExtendedStore

  constructor(config: Config) {
    super(config)

    this.admin = new ExtendedAdmin(this.client)
    this.store = new ExtendedStore(this.client)
  }
}

export { AdminPageBuilderResource } from './admin/admin-page-builder'
export { StorePageBuilderResource } from './store/store-page-builder'
