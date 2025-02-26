import { defineMiddlewares } from '@medusajs/medusa';
import { adminProductReviewRoutesMiddlewares } from './admin/product-reviews/middlewares';
import { adminProductReviewStatRoutesMiddlewares } from './admin/product-review-stats/middlewares';
import { storeProductReviewRoutesMiddlewares } from './store/product-reviews/middlewares';
import { adminProductReviewResponseRouteMiddlewares } from './admin/product-reviews/[id]/response/middlewares';
import { storeProductReviewUploadsMiddlewares } from './store/product-reviews/uploads/middlewares';
import { storeProductReviewStatRoutesMiddlewares } from './store/product-review-stats/middlewares';
import { adminProductReviewStatusRoutesMiddlewares } from './admin/product-reviews/[id]/status/middlewares';

export default defineMiddlewares({
  routes: [
    ...adminProductReviewRoutesMiddlewares,
    ...adminProductReviewStatRoutesMiddlewares,
    ...adminProductReviewResponseRouteMiddlewares,
    ...adminProductReviewStatusRoutesMiddlewares,

    // Store
    ...storeProductReviewUploadsMiddlewares,
    ...storeProductReviewRoutesMiddlewares,
    ...storeProductReviewStatRoutesMiddlewares,
  ],
});
