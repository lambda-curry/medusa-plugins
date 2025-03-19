import type { Post } from '../modules/page-builder/types'
import type {
  CreatePostDTO,
  ListAdminPostsQueryDTO,
  UpdatePostDTO,
} from '../api/admin/content/validations'

interface PaginatedResponse {
  count: number
  offset: number
  limit: number
}

export type AdminPageBuilderListPostsQuery = ListAdminPostsQueryDTO

export interface AdminPageBuilderListPostsResponse extends PaginatedResponse {
  posts: Post[]
}

export type AdminPageBuilderCreatePostBody = CreatePostDTO

export type AdminPageBuilderCreatePostResponse = {
  post: Post
}

export type AdminPageBuilderUpdatePostBody = UpdatePostDTO

export type AdminPageBuilderUpdatePostResponse = {
  post: Post
}

export type AdminPageBuilderDeletePostResponse = {
  id: string
  object: string
  deleted: boolean
}

export type AdminPageBuilderDuplicatePostResponse = {
  post: Post
}
