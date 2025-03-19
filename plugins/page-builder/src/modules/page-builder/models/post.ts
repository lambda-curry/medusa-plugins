import { model } from '@medusajs/framework/utils'
import { PostSectionModel } from './post-section'
import { PostTagModel } from './post-tag'
import { PostAuthorModel } from './post-author'
import { ImageModel } from './image'
import { postContentModes, postStatuses, postTypes } from '../types/common'

export const PostModel = model.define('post', {
  id: model.id({ prefix: 'post' }).primaryKey(),
  type: model.enum([...postTypes]),
  title: model.text().searchable(),
  handle: model.text().unique().searchable().nullable(),
  excerpt: model.text().searchable().nullable(),
  content: model.json().nullable(),
  status: model.enum([...postStatuses]).default('draft'),
  content_mode: model.enum([...postContentModes]).default('advanced'),
  seo: model.json().nullable(),
  published_at: model.text().nullable(),
  archived_at: model.text().nullable(),
  is_home_page: model.boolean().default(false),

  // relations fields
  featured_image: model.hasOne(() => ImageModel, {
    mappedBy: 'post',
  }),
  authors: model.manyToMany(() => PostAuthorModel, {
    mappedBy: 'posts',
  }),

  root: model.belongsTo(() => PostModel).nullable(),

  sections: model.hasMany(() => PostSectionModel),

  tags: model.manyToMany(() => PostTagModel, {
    mappedBy: 'posts',
  }),
})
