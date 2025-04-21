import { defineLink } from '@medusajs/framework/utils';
import OrderModule from '@medusajs/medusa/order';
import ProductReviewModule from '../modules/product-review';

export default defineLink(
  {
    linkable: ProductReviewModule.linkable.productReview,
    field: 'order_id',
    isList: false,
  },
  OrderModule.linkable.order,
  {
    readOnly: true,
  },
);
