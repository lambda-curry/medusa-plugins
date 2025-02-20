import type { Client, ClientHeaders } from '@medusajs/js-sdk';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import type {
  StoreListProductReviewsResponse,
  StoreListProductReviewsQuery,
  StoreListProductReviewStatsQuery,
  StoreListProductReviewStatsResponse,
  StoreUpsertProductReviewsDTO,
  StoreUpsertProductReviewsResponse,
  StoreUploadProductReviewImagesResponse,
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

  async uploadImages(
    images: File[],
    headers?: ClientHeaders
  ) {

    const formData = new FormData();

    for (const image of images) {
      if ('getFilePath' in image) {
        
        formData.append('files', createReadStream((image.getFilePath as () => string)()));
      } else {
        return;
      }
    }

    return await this.client.fetch<StoreUploadProductReviewImagesResponse>(`/store/product-reviews/uploads`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });
  }
}
