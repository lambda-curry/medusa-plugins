import { MedusaService } from '@medusajs/framework/utils'
import {
  PostAuthor,
  Post,
  PostTemplate,
  PostTag,
  PostSection,
  Image,
  SiteSettings,
  NavigationItem,
} from './models'

class PageBuilderService extends MedusaService({
  PostAuthor,
  Post,
  PostTemplate,
  PostTag,
  PostSection,
  Image,
  SiteSettings,
  NavigationItem,
}) {}

export default PageBuilderService
