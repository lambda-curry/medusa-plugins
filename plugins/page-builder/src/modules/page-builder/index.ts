import PageBuilderService from './service'
import { Module } from '@medusajs/framework/utils'

export const PAGE_BUILDER_MODULE = 'page-builder'

export default Module(PAGE_BUILDER_MODULE, {
  service: PageBuilderService,
})
