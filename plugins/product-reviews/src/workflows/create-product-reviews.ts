import { transform } from '@medusajs/framework/workflows-sdk';
import { emitEventStep } from '@medusajs/medusa/core-flows';
import { type WorkflowData, WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';
import type { CreateProductReviewsWorkflowInput } from '../modules/product-review/types/mutations';
import { refreshProductReviewStatsWorkflow } from './refresh-product-review-stats';
import { createProductReviewsStep } from './steps/create-product-reviews';

export const createProductReviewsWorkflow = createWorkflow(
  'create-product-reviews-workflow',
  (input: WorkflowData<CreateProductReviewsWorkflowInput>) => {
    const productReviews = createProductReviewsStep(input.productReviews);

    const productIds = transform({ productReviews }, ({ productReviews }) => {
      return productReviews.map((productReview) => productReview.product_id).filter((p) => p !== null);
    });

    refreshProductReviewStatsWorkflow.runAsStep({
      input: { productIds: productIds },
    });

    const emitData = transform({ productReviews }, ({ productReviews }) => {
      return {
        eventName: 'product_review.created',
        data: productReviews.map((productReview) => ({
          id: productReview.id,
        })),
      };
    });

    emitEventStep(emitData);

    return new WorkflowResponse(productReviews);
  },
);
