import type { InferTypeOf } from '@medusajs/framework/types'

import { PostModel } from '../models/post'
import { PostAuthorModel } from '../models/post-author'
import { PostTagModel } from '../models/post-tag'
import { PostSectionModel } from '../models/post-section'
import { PostTemplateModel } from '../models/post-template'
import { ImageModel } from '../models/image'
import { SiteSettingsModel } from '../models/site-settings'
import { NavigationItemModel } from '../models/navigation-item'

export const postTypes = ['page', 'post'] as const
export const postStatuses = ['draft', 'published', 'archived'] as const
export const postContentModes = ['basic', 'advanced'] as const

export type PostType = (typeof postTypes)[number]
export type PostStatus = (typeof postStatuses)[number]
export type PostContentMode = (typeof postContentModes)[number]

export type Post = InferTypeOf<typeof PostModel>
export type PostAuthor = InferTypeOf<typeof PostAuthorModel>
export type PostTag = InferTypeOf<typeof PostTagModel>
export type PostSection = InferTypeOf<typeof PostSectionModel>
export type PostTemplate = InferTypeOf<typeof PostTemplateModel>
export type Image = InferTypeOf<typeof ImageModel>
export type SiteSettings = InferTypeOf<typeof SiteSettingsModel>
export type NavigationItem = InferTypeOf<typeof NavigationItemModel>
