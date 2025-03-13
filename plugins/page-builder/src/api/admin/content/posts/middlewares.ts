import { z } from 'zod'
import {
  type MiddlewareRoute,
  validateAndTransformQuery,
  validateAndTransformBody,
} from '@medusajs/framework'
import {
  createFindParams,
  createOperatorMap,
} from '@medusajs/medusa/api/utils/validators'

import {
  postContentModes,
  postStatuses,
  postTypes,
} from '../../../../modules/page-builder/types'

const statuses = z.enum([...postStatuses])
const types = z.enum([...postTypes])
const contentModes = z.enum([...postContentModes])

export const createPostSchema = z.object({
  title: z.string(),
  handle: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.record(z.string(), z.any()).optional(),
  status: statuses.optional(),
  type: types.optional(),
  content_mode: contentModes.optional(),
  seo: z.record(z.string(), z.any()).optional(),
  is_home_page: z.boolean().optional(),
})

export type CreatePostDTO = z.infer<typeof createPostSchema>

export const listAdminPostsQuerySchema = createFindParams({
  offset: 0,
  limit: 50,
}).merge(
  z.object({
    q: z.string().optional(),
    id: z.union([z.string(), z.array(z.string())]).optional(),
    title: z.string().optional(),
    handle: z.string().optional(),
    status: z.union([statuses, z.array(statuses)]).optional(),
    type: z.union([types, z.array(types)]).optional(),
    content_mode: z.union([contentModes, z.array(contentModes)]).optional(),
    is_home_page: z.boolean().optional(),
    published_at: createOperatorMap().optional(),
    archived_at: createOperatorMap().optional(),
    created_at: createOperatorMap().optional(),
    updated_at: createOperatorMap().optional(),
  }),
)

export const defaultAdminPostFields = [
  'id',
  'type',
  'title',
  'handle',
  'excerpt',
  'content',
  'status',
  'content_mode',
  'seo',
  'published_at',
  'archived_at',
  'is_home_page',
  'created_at',
  'updated_at',
  'featured_image.*',
  'authors.*',
  'root.*',
  'sections.*',
  'tags.*',
]

export const defaultPostsQueryConfig = {
  defaults: [...defaultAdminPostFields],
  defaultLimit: 50,
  isList: true,
}

export const adminPostRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/admin/content/posts',
    method: 'GET',
    middlewares: [
      validateAndTransformQuery(
        listAdminPostsQuerySchema,
        defaultPostsQueryConfig,
      ),
    ],
  },
  {
    matcher: '/admin/content/posts',
    method: 'POST',
    middlewares: [validateAndTransformBody(createPostSchema)],
  },
]
