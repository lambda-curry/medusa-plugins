import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework';

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve('query');

  const { data: product_reviews, metadata = { count: 0, skip: 0, take: 0 } } = await query.graph({
    entity: 'product_review',
    fields: req.queryConfig.fields,
    filters: req.filterableFields,
    pagination: req.queryConfig.pagination,
  });

  res.status(200).json({ product_reviews, count: metadata.count, offset: metadata.skip, limit: metadata.take });
};
