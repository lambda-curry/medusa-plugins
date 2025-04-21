import { defineLink } from '@medusajs/framework/utils';
import ProductModule from '@medusajs/medusa/product';
import ProductReviewStatsModule from '../modules/product-review';

export default defineLink(
  {
    linkable: ProductReviewStatsModule.linkable.productReviewStats,
    field: 'product_id',
    isList: false,
  },
  ProductModule.linkable.product,
  {
    readOnly: true,
    isList: false,
  },
);
