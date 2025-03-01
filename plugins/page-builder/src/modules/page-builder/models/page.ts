import { model } from '@medusajs/framework/utils'
import { PageSection } from './page-section'
import { PageTag } from './page-tag'

export const Page = model.define('page', {
  id: model.id({ prefix: 'page' }).primaryKey(),
  title: model.text(),
  handle: model.text().unique(),
  excerpt: model.text().nullable(),
  content: model.json().nullable(),
  type: model.enum(['page', 'post', 'product', 'revision']),
  status: model.enum(['draft', 'published', 'archived']).default('draft'),
  content_mode: model.enum(['basic', 'advanced']),
  seo: model.json().nullable(),
  published_at: model.text().nullable(),
  archived_at: model.text().nullable(),
  is_home_page: model.boolean().default(false),

  featured_image: model.hasOne(() => Image).nullable(),

  // author_id: model.array(), // TODO: or model.text()?
  // last_updated_by_id: model.text(),

  root: model
    .belongsTo(() => Page, {
      mappedBy: undefined,
    })
    .nullable(),
  sections: model.hasMany(() => PageSection),
  tags: model.manyToMany(() => PageTag, {
    mappedBy: 'page_id',
    pivotTable: 'page_tag',
    joinColumn: 'page_id',
    inverseJoinColumn: 'tag_id',
  }),
})
