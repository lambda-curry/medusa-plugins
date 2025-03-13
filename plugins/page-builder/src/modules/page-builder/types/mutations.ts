import type { Post, Image } from './common'

type PostInput = Omit<
  Post,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'featured_image'
  | 'root'
  | 'sections'
  | 'authors'
  | 'tags'
>

// Post types
export type CreatePostStepInput = Partial<PostInput> & {
  featured_image_id?: string
  authors?: string[]
  tags?: string[]
}

export type CreatePostWorkflowInput = {
  post: CreatePostStepInput
}
