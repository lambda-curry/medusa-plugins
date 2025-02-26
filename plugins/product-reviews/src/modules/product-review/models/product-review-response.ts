import { model } from '@medusajs/framework/utils';
import { ProductReviewModel } from './product-review';

export const ProductReviewResponseModel = model.define('product_review_response', {
  id: model.id({ prefix: 'prr' }).primaryKey(),
  content: model.text(),
  product_review: model.belongsTo(() => ProductReviewModel, {
    mappedBy: 'response',
  }),
});
