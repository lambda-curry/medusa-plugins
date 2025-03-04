import { model } from '@medusajs/framework/utils'
import { Page } from './page'

export const PageTag = model.define('page_tag', {
  id: model.id({ prefix: 'pagetag' }).primaryKey(),
  label: model.text(),
  handle: model.text().unique(),
  description: model.text(),
  // created_by_id: model.id(),
  pages: model.manyToMany(() => Page, {
    mappedBy: 'tags',
  }),
})
