import { model } from '@medusajs/framework/utils'
import { Page } from './page'
import { SiteSettings } from './site-settings'

// TODO: check if this model is needed
export const Image = model.define('image', {
  id: model.id().primaryKey(),
  url: model.text(),
  metadata: model.json().nullable(),

  page: model
    .belongsTo(() => Page, {
      mappedBy: 'featured_image',
    })
    .nullable(),
  site: model
    .belongsTo(() => SiteSettings, {
      mappedBy: 'favicon',
    })
    .nullable(),
})
