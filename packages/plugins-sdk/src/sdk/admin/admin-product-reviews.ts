import type { Client } from '@medusajs/js-sdk';
import type {
  AdminCreateProductReviewResponseDTO,
  AdminListProductReviewsQuery,
  AdminProductReviewResponse,
  AdminUpdateProductReviewResponseDTO,
  AdminListProductReviewsResponse,
} from '../../types';

export class AdminProductReviews {
  constructor(private client: Client) {}

  async list(query: AdminListProductReviewsQuery) {
    return this.client.fetch<AdminListProductReviewsResponse>(`/admin/product-reviews`, {
      method: 'GET',
      query,
    });
  }

  async updateStatus(productReviewId: string, status: 'pending' | 'approved' | 'flagged') {
    return this.client.fetch<AdminProductReviewResponse>(`/admin/product-reviews/${productReviewId}/status`, {
      method: 'PUT',
      body: { status },
    });
  }

  async createResponse(productReviewId: string, data: AdminCreateProductReviewResponseDTO) {
    return this.client.fetch<AdminProductReviewResponse>(`/admin/product-reviews/${productReviewId}/response`, {
      method: 'POST',
      body: data,
    });
  }

  async updateResponse(productReviewId: string, data: AdminUpdateProductReviewResponseDTO) {
    return this.client.fetch<AdminProductReviewResponse>(`/admin/product-reviews/${productReviewId}/response`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteResponse(productReviewId: string) {
    return this.client.fetch<AdminProductReviewResponse>(`/admin/product-reviews/${productReviewId}/response`, {
      method: 'DELETE',
    });
  }
}
