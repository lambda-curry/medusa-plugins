import { model } from '@medusajs/framework/utils'
import { PostSection } from './post-section'
import { PostTag } from './post-tag'
import { PostAuthor } from './post-author'
import { Image } from './image'

export const Post = model.define('post', {
  id: model.id({ prefix: 'post' }).primaryKey(),
  type: model.enum(['page', 'post']),
  title: model.text(),
  handle: model.text().unique(),
  excerpt: model.text().nullable(),
  content: model.json().nullable(),
  status: model.enum(['draft', 'published', 'archived']).default('draft'),
  content_mode: model.enum(['basic', 'advanced']),
  seo: model.json().nullable(),
  published_at: model.text().nullable(),
  archived_at: model.text().nullable(),
  is_home_page: model.boolean().default(false),

  // relations fields
  featured_image: model.hasOne(() => Image, {
    mappedBy: 'post',
  }),
  authors: model.manyToMany(() => PostAuthor, {
    mappedBy: 'posts',
  }),

  root: model.belongsTo(() => Post).nullable(),

  sections: model.hasMany(() => PostSection),

  tags: model.manyToMany(() => PostTag, {
    mappedBy: 'posts',
  }),
})
