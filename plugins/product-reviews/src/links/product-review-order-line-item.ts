import { defineLink } from '@medusajs/framework/utils';
import OrderModule from '@medusajs/medusa/order';
import ProductReviewModule from '../modules/product-review';

export default defineLink(
  {
    linkable: ProductReviewModule.linkable.productReview,
    field: 'order_line_item_id',
    isList: false,
  },
  OrderModule.linkable.orderLineItem,
  {
    readOnly: true,
  },
);
