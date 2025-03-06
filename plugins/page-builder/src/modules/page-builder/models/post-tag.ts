import { model } from '@medusajs/framework/utils'
import { Post } from './post'

export const PostTag = model.define('post_tag', {
  id: model.id({ prefix: 'post_tag' }).primaryKey(),
  label: model.text(),
  handle: model.text().unique(),
  description: model.text(),

  // relations fields
  created_by_id: model.text(),
  posts: model.manyToMany(() => Post, {
    mappedBy: 'tags',
  }),
})
