import type { Client } from '@medusajs/js-sdk'
import { Admin } from '@medusajs/js-sdk'
import { AdminProductReviewsResource } from './admin-product-reviews'
import { AdminPageBuilderResource } from './admin-page-builder'
export class ExtendedAdminSDK extends Admin {
  public productReviews: AdminProductReviewsResource
  public pageBuilder: AdminPageBuilderResource

  constructor(client: Client) {
    super(client)

    this.productReviews = new AdminProductReviewsResource(client)
    this.pageBuilder = new AdminPageBuilderResource(client)
  }
}
