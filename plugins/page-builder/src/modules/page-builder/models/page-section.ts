import { model } from '@medusajs/framework/utils'
import { Page } from './page'
import { PageTemplate } from './page-template'

export const PageSection = model.define('page_section', {
  id: model.id({ prefix: 'pagesec' }).primaryKey(),
  type: model.enum([
    'button_list',
    'cta',
    'header',
    'hero',
    'product_carousel',
    'product_grid',
    'image_gallery',
    'raw_html',
    'rich_text',
    'blog_list',
  ]),
  name: model.text(),
  content: model.json().nullable(),
  status: model.enum(['draft', 'published', 'archived']).default('draft'),
  settings: model.json().nullable(),
  is_reusable: model.boolean().default(false),
  styles: model.json().nullable(),
  sort_order: model.number(),

  // last_updated_by_id: model.text().nullable(),
  page: model
    .belongsTo(() => Page, {
      mappedBy: 'sections',
    })
    .nullable(),
  pageTemplate: model
    .belongsTo(() => PageTemplate, {
      mappedBy: 'sections',
    })
    .nullable(),
})
