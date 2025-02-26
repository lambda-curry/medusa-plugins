import type { InferTypeOf } from '@medusajs/framework/types';
import type { ProductReviewModel } from '../models';
import { ProductReviewStatsModel } from '../models/product-review-stats';
import { ProductReviewResponseModel } from '../models/product-review-response';

export type ProductReview = InferTypeOf<typeof ProductReviewModel>;

export type ProductReviewStats = InferTypeOf<typeof ProductReviewStatsModel>;

export type ProductReviewResponse = InferTypeOf<typeof ProductReviewResponseModel>;
