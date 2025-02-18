import Medusa, { type Config } from '@medusajs/js-sdk';
import { ExtendedAdminSDK } from './admin';
import { ExtendedStorefrontSDK } from './store';

export class MedusaPluginsSDK extends Medusa {
  public admin: ExtendedAdminSDK
  public store: ExtendedStorefrontSDK

  constructor(config: Config) {
    super(config)
    
    this.admin = new ExtendedAdminSDK(this.client)
    this.store = new ExtendedStorefrontSDK(this.client)
  }
}

export { AdminProductReviewsResource } from './admin/admin-product-reviews'
export { StoreProductReviewsResource } from './store/store-product-reviews'
