import { type MiddlewareRoute, validateAndTransformBody } from '@medusajs/framework';
import { z } from 'zod';

export const updateProductReviewStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'flagged']),
});

export type UpdateProductReviewStatusSchema = z.infer<typeof updateProductReviewStatusSchema>;

export const adminProductReviewStatusRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/admin/product-reviews/:id/status',
    method: 'PUT',
    middlewares: [validateAndTransformBody(updateProductReviewStatusSchema)],
  },
];
