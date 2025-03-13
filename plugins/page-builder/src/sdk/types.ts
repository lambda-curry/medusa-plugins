import { z } from 'zod'

import { Post } from '../modules/page-builder/types'
import {
  CreatePostDTO,
  listAdminPostsQuerySchema,
} from '../api/admin/content/posts/middlewares'

interface PaginatedResponse {
  count: number
  offset: number
  limit: number
}

export type AdminPageBuilderListPostsQuery = z.infer<
  typeof listAdminPostsQuerySchema
>

export interface AdminPageBuilderListPostsResponse extends PaginatedResponse {
  posts: Post[]
}

export type AdminPageBuilderCreatePostBody = CreatePostDTO

export type AdminPageBuilderCreatePostResponse = {
  post: Post
}
