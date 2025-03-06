import { model } from '@medusajs/framework/utils'
import { Post } from './post'

export const PostAuthor = model.define('post_author', {
  id: model.id({ prefix: 'post_author' }).primaryKey(),
  name: model.text(),

  // relations fields
  medusa_user_id: model.text().unique(),
  posts: model.manyToMany(() => Post, {
    mappedBy: 'authors',
  }),
})
