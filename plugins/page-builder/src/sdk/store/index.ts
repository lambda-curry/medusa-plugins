import type { Client } from '@medusajs/js-sdk'
import { Store as MedusaStore } from '@medusajs/js-sdk'
import { StorePageBuilderResource } from './store-page-builder'

export class ExtendedStore extends MedusaStore {
  public pageBuilder: StorePageBuilderResource

  constructor(client: Client) {
    super(client)

    this.pageBuilder = new StorePageBuilderResource(client)
  }
}
