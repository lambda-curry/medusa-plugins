import type { Client, ClientHeaders } from '@medusajs/js-sdk'

export class StorePageBuilderResource {
  constructor(private client: Client) {}

  // async getPost(postId: string) {
  //   return this.client.fetch<StorePageBuilderGetPostResponse>(`/store/content/posts/${postId}`, {
  //     method: 'GET',
  //   });
  // }
}
