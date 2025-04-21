import { model } from '@medusajs/framework/utils';
import { ProductReviewImageModel } from './product-review-image';
import { ProductReviewResponseModel } from './product-review-response';

export const ProductReviewModel = model
  .define('product_review', {
    id: model.id({ prefix: 'prev' }).primaryKey(),
    name: model.text().searchable().nullable(),
    email: model.text().nullable(),
    rating: model.number(),
    content: model.text().searchable().nullable(),
    order_line_item_id: model.text().nullable(),
    product_id: model.text().nullable(),
    order_id: model.text().nullable(),
    images: model.hasMany(() => ProductReviewImageModel),
    response: model.hasOne(() => ProductReviewResponseModel, { nullable: true }).nullable(),
    status: model.enum(['pending', 'approved', 'flagged']).default('pending'),
  })
  .indexes([
    {
      on: ['product_id'],
    },
    {
      on: ['order_id'],
    },
    {
      on: ['order_line_item_id'],
    },
  ]);
