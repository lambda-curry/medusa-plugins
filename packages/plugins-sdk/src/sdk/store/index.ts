import type { Client } from '@medusajs/js-sdk';
// import { Store } from '@medusajs/js-sdk';
import { StoreProductReviews } from './store-product-reviews';

// export class ExtendedStorefrontSDK extends Store {
//   productReviews: StoreProductReviews;

//   constructor(client: Client) {
//     super(client);

//     this.productReviews = new StoreProductReviews(client);
//   }

// }
class Store {
  private client: Client;
  productReviews: StoreProductReviews;

  constructor(client: Client) {
    this.client = client;
    this.productReviews = new StoreProductReviews(client);
  }
}


export {
  Store,
  StoreProductReviews
}