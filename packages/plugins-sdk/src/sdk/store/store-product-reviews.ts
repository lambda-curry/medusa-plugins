import type { Client, ClientHeaders } from '@medusajs/js-sdk';
import type {
  StoreListProductReviewsQuery,
  StoreListProductReviewsResponse,
  StoreListProductReviewStatsQuery,
  StoreListProductReviewStatsResponse,
  StoreUpsertProductReviewsDTO,
  StoreUpsertProductReviewsResponse
} from '../../types';

export class StoreProductReviewsResource {
  constructor(private client: Client) {}

  async upsert(data: StoreUpsertProductReviewsDTO, headers?: ClientHeaders) {
    return this.client.fetch<StoreUpsertProductReviewsResponse>(`/store/product-reviews`, {
      method: 'POST',
      body: data,
      headers,
    });
  }

  async list(query: StoreListProductReviewsQuery, headers?: ClientHeaders) {
    return this.client.fetch<StoreListProductReviewsResponse>(`/store/product-reviews`, {
      method: 'GET',
      query,
      headers,
    });
  }

  async listStats(query: StoreListProductReviewStatsQuery, headers?: ClientHeaders) {
    return this.client.fetch<StoreListProductReviewStatsResponse>(`/store/product-review-stats`, {
      method: 'GET',
      query,
      headers,
    });
  }
}
