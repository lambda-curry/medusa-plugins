# @lambdacurry/medusa-plugins-sdk

SDK for Medusa plugins by Lambda Curry.

> This package is part of the [Medusa Plugins Collection](https://github.com/lambda-curry/medusa-plugins).

## Installation

```bash
yarn install @lambdacurry/medusa-plugins-sdk
```

## Usage

```typescript
import {
  MedusaPluginsSDK,
  StoreListProductReviewsQuery,
  StoreListProductReviewStatsQuery,
} from '@lambdacurry/medusa-plugins-sdk';

const pluginsSDK = new MedusaPluginsSDK({
  baseUrl: 'http://localhost:9000',
  // publishableKey: 'pk_', // Optional
  auth: {
    type: 'session',
  },
});


// Use the SDK
await pluginsSDK.store.productReviews.list({
  ...query,
  offset: query.offset ?? 0,
  limit: query.limit ?? 10,
}, headers);
```

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Start development mode:
   ```bash
   yarn run dev
   ```
4. Build the package:
   ```bash
   yarn run build
   ```

## License

MIT © [Lambda Curry](https://lambdacurry.dev)
