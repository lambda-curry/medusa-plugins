import { model } from '@medusajs/framework/utils'

export const NavigationItem = model.define('navigation_item', {
  id: model.id({ prefix: 'nav_item' }).primaryKey(),
  label: model.text(),
  location: model.enum(['header', 'footer']),
  sort_order: model.number().default(0),
  url: model.text().nullable(),
  new_tab: model.boolean().default(false),
})
