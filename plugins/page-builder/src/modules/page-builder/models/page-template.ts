import { model } from '@medusajs/framework/utils'
import { PageSection } from './page-section'

export const PageTemplate = model.define('page_template', {
  id: model.id({ prefix: 'page_temp' }).primaryKey(),
  title: model.text(),
  status: model.enum(['draft', 'published', 'archived']).default('draft'),
  type: model.enum(['page', 'post', 'product', 'revision']),
  // last_updated_by_id: model.text().nullable(),
  sort_order: model.number().default(0),
  description: model.text().nullable(),
  sections: model.hasMany(() => PageSection),
})
