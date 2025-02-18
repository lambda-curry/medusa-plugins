import type { Client } from '@medusajs/js-sdk';
import { Store } from '@medusajs/js-sdk';
import { StoreProductReviewsResource } from './store-product-reviews';

export class ExtendedStorefrontSDK extends Store {
  public productReviews: StoreProductReviewsResource;
  constructor(client: Client) {
    super(client);
    this.productReviews = new StoreProductReviewsResource(client);
  }
}