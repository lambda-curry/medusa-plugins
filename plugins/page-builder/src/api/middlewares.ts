import { defineMiddlewares } from '@medusajs/medusa'
import { adminPostRoutesMiddlewares } from './admin/content/posts/middlewares'

export default defineMiddlewares({
  routes: [
    // Admin
    ...adminPostRoutesMiddlewares,

    // Store
  ],
})
