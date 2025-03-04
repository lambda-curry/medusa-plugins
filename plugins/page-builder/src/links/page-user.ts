import PageBuilderModule from '../modules/page-builder'
import UserModule from '@medusajs/medusa/user'
import { defineLink } from '@medusajs/framework/utils'

export default defineLink(PageBuilderModule.linkable.page, {
  linkable: UserModule.linkable.user,
  isList: true,
})
