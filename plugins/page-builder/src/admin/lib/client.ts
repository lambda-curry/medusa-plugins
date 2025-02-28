import Medusa from '@medusajs/js-sdk'

declare const __BACKEND_URL__: string | undefined

export const backendUrl = __BACKEND_URL__ ?? 'http://localhost:9000'

export const sdk = new Medusa({
  baseUrl: backendUrl,
  auth: {
    type: 'session',
  },
})
