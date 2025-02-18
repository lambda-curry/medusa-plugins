import type { Client } from '@medusajs/js-sdk';
import { Admin } from '@medusajs/js-sdk';
import { AdminProductReviewsResource } from './admin-product-reviews';

export class ExtendedAdminSDK extends Admin {
  public productReviews: AdminProductReviewsResource;

  constructor(client: Client) {
    super(client);
    this.productReviews = new AdminProductReviewsResource(client);
  }
}