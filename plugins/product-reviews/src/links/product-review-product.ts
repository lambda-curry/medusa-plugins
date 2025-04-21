import { defineLink } from '@medusajs/framework/utils';
import ProductModule from '@medusajs/medusa/product';
import ProductReviewModule from '../modules/product-review';

export default defineLink(
  {
    linkable: ProductReviewModule.linkable.productReview,
    field: 'product_id',
  },
  ProductModule.linkable.product,
  {
    readOnly: true,
  },
);
