import type { Client } from '@medusajs/js-sdk'
import { Admin as MedusaAdmin } from '@medusajs/js-sdk'
import { AdminPageBuilderResource } from './admin-page-builder'

export class ExtendedAdmin extends MedusaAdmin {
  public pageBuilder: AdminPageBuilderResource

  constructor(client: Client) {
    super(client)

    this.pageBuilder = new AdminPageBuilderResource(client)
  }
}
