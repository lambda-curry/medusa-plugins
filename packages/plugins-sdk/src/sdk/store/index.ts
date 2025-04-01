import type { Client } from '@medusajs/js-sdk'
import { Store } from '@medusajs/js-sdk'
import { StoreProductReviewsResource } from './store-product-reviews'
import { StorePageBuilderResource } from './store-page-builder'

export class ExtendedStorefrontSDK extends Store {
  public productReviews: StoreProductReviewsResource
  public pageBuilder: StorePageBuilderResource

  constructor(client: Client) {
    super(client)

    this.productReviews = new StoreProductReviewsResource(client)
    this.pageBuilder = new StorePageBuilderResource(client)
  }
}
