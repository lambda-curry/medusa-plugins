import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { upsertProductReviewsWorkflow } from '../../../workflows/upsert-product-reviews';
import { defaultStoreProductReviewFields, UpsertProductReviewsSchema } from './middlewares';

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: product_reviews, metadata = { count: 0, skip: 0, take: 0 } } = await query.graph({
    entity: 'product_review',
    ...req.queryConfig,
    filters: {
      ...req.filterableFields,
    }
  });

  res.status(200).json({ product_reviews, count: metadata.count, offset: metadata.skip, limit: metadata.take });
};

export const POST = async (req: AuthenticatedMedusaRequest<UpsertProductReviewsSchema>, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { reviews } = req.validatedBody;

  const { result } = await upsertProductReviewsWorkflow(req.scope).run({ input: { reviews } });

  const createdReviewIds = result.creates.map((review) => review.id);
  const updatedReviewIds = result.updates.map((review) => review.id);

  const { data: product_reviews } = await query.graph({
    entity: 'product_review',
    fields: [...defaultStoreProductReviewFields],
    filters: {
      id: [...createdReviewIds, ...updatedReviewIds],
    }
  });

  res.status(200).json({ product_reviews });
};
