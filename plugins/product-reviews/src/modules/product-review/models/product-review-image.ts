import { model } from '@medusajs/framework/utils';
import { ProductReviewModel } from './product-review';

export const ProductReviewImageModel = model.define('product_review_image', {
  id: model.id({ prefix: 'prev_img' }).primaryKey(),
  url: model.text(),
  product_review: model.belongsTo(() => ProductReviewModel, {
    mappedBy: 'images',
  }),
});
