import { InjectManager, MedusaContext, MedusaService } from '@medusajs/framework/utils';
import { Context } from '@medusajs/framework/types';
import type { EntityManager } from '@mikro-orm/postgresql';
import {
  ProductReviewModel,
  ProductReviewImageModel,
  ProductReviewResponseModel,
  ProductReviewStatsModel,
} from './models';
import { ProductReviewStats } from './types';
import { z } from 'zod';

interface CalculatedProductReviewStats {
  product_id: string;
  review_count: number;
  average_rating: number;
  rating_count_1: number;
  rating_count_2: number;
  rating_count_3: number;
  rating_count_4: number;
  rating_count_5: number;
}

export const modduleOptionsSchema = z.object({
  defaultReviewStatus: z.enum(['pending', 'approved', 'flagged']).default('approved'),
}).default({
  defaultReviewStatus: 'approved',
});

export type ModuleOptions = z.infer<typeof modduleOptionsSchema>;

class ProductReviewService extends MedusaService({
  ProductReview: ProductReviewModel,
  ProductReviewImage: ProductReviewImageModel,
  ProductReviewResponse: ProductReviewResponseModel,
  ProductReviewStats: ProductReviewStatsModel,
}) {
  public readonly defaultReviewStatus: string

  constructor(container, options: ModuleOptions) {
    super(container, options);

    const { defaultReviewStatus } = modduleOptionsSchema.parse(options);

    this.defaultReviewStatus = defaultReviewStatus;
  }

  async refreshProductReviewStats(productIds: string[], sharedContext?: Context): Promise<ProductReviewStats[]> {
    const foundStats = await this.listProductReviewStats({ product_id: productIds }, {});

    const calculatedStats = await this.calculateProductReviewStats(
      foundStats.map((s) => s.product_id),
      sharedContext,
    );

    const toUpdate = foundStats.map((s) => ({
      ...s,
      ...calculatedStats.find((c) => c.product_id === s.product_id),
    }));

    const upsertedStats = await this.updateProductReviewStats(toUpdate);

    return upsertedStats;
  }
  calculateProductReviewStats(productIds: string[], sharedContext?: Context): Promise<CalculatedProductReviewStats[]>;
  @InjectManager()
  async calculateProductReviewStats(
    productIds: string[],
    @MedusaContext() sharedContext: Context<EntityManager> & { manager: EntityManager },
  ): Promise<CalculatedProductReviewStats[]> {
    const SQL = `SELECT 
    product_id,
    COUNT(*) AS review_count, 
    CAST(AVG(rating) AS DECIMAL(10, 2)) AS average_rating,
    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS rating_count_1,
    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS rating_count_2,
    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS rating_count_3,
    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS rating_count_4,
    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS rating_count_5
    FROM product_review WHERE product_id IN (${productIds.map((id) => `'${id}'`).join(', ')}) AND status = 'approved' GROUP BY product_id`;

    const productReviewStats =
      await sharedContext.manager.execute<
        {
          product_id: string;
          review_count: number;
          average_rating: string;
          rating_count_1: number;
          rating_count_2: number;
          rating_count_3: number;
          rating_count_4: number;
          rating_count_5: number;
        }[]
      >(SQL);

    return productReviewStats.map((s) => ({
      ...s,
      average_rating: parseFloat(s.average_rating),
    }));
  }
}

export default ProductReviewService;
