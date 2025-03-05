import { model } from '@medusajs/framework/utils'
import { Post } from './post'
import { SiteSettings } from './site-settings'

export const Image = model
  .define('image', {
    id: model.id({ prefix: 'img' }).primaryKey(),
    url: model.text(),
    metadata: model.json().nullable(),

    // relations fields
    post: model
      .belongsTo(() => Post, {
        mappedBy: 'featured_image',
      })
      .nullable(),
    site_settings: model
      .belongsTo(() => SiteSettings, {
        mappedBy: 'favicon',
      })
      .nullable(),
  })
  .indexes([
    {
      name: 'IDX_product_image_url',
      on: ['url'],
      unique: false,
      where: 'deleted_at IS NULL',
    },
  ])
