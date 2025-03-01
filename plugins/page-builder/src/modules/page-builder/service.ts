import { MedusaService } from '@medusajs/framework/utils'
import {
  Page,
  PageTemplate,
  PageTag,
  PageSection,
  SiteSettings,
  NavigationItem,
} from './models'

class PageBuilderService extends MedusaService({
  Page,
  PageTag,
  PageSection,
  PageTemplate,
  SiteSettings,
  NavigationItem,
}) {}

export default PageBuilderService
