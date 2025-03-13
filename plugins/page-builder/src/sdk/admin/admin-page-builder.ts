import type { Client } from '@medusajs/js-sdk'
import type {
  AdminPageBuilderCreatePostBody,
  AdminPageBuilderCreatePostResponse,
  AdminPageBuilderListPostsQuery,
  AdminPageBuilderListPostsResponse,
} from '../types'

export class AdminPageBuilderResource {
  constructor(private client: Client) {}

  async listPosts(query: AdminPageBuilderListPostsQuery) {
    return this.client.fetch<AdminPageBuilderListPostsResponse>(
      `/admin/content/posts`,
      {
        method: 'GET',
        query,
      },
    )
  }

  async createPost(data: AdminPageBuilderCreatePostBody) {
    return this.client.fetch<AdminPageBuilderCreatePostResponse>(
      `/admin/content/posts`,
      {
        method: 'POST',
        body: data,
      },
    )
  }
}
