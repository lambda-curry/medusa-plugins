# @lambdacurry/medusa-product-reviews

A plugin that adds product review and moderation capabilities to your Medusa application, with built-in admin responses and review statistics.

> This plugin is part of the [Medusa Plugins Collection](https://github.com/lambda-curry/medusa-plugins).

## Features
> See a demo in our [Medusa Starter](https://github.com/lambda-curry/medusa2-starter)

- Product reviews with ratings
- Review statistics and analytics
- Review moderation workflow (`approved`/`pending`/`flagged`)
- Admin response management
- SDK for Store and Admin operations

## Prerequisites

- [Medusa >=2.5.0 backend](https://docs.medusajs.com/development/backend/install)
- [PostgreSQL](https://docs.medusajs.com/development/backend/prepare-environment#postgresql)

## Installation and Configuration
1. Install the plugin:
```bash
yarn add @lambdacurry/medusa-product-reviews

# or, if you're using yarn workspaces
yarn workspace my-app add @lambdacurry/medusa-product-reviews
```

2. Add to `medusa-config.ts`:
```js
module.exports = defineConfig({
  plugins: [
    {
      resolve: '@lambdacurry/medusa-product-reviews',
      options: {
        defaultReviewStatus: 'pending', // OPTIONAL, default is 'approved'
      },
    },
  ],
});
```

3. Run migrations:
```bash
yarn medusa db:migrate
```

## Using the Plugin SDK

> For detailed SDK setup and configuration, refer to the [@lambdacurry/medusa-plugins-sdk README](../packages/plugins-sdk/README.md).

### Store Operations

```typescript
// List product reviews
const { reviews, count } = await sdk.store.productReviews.list(
  query: StoreListProductReviewsQuery,
  headers?: ClientHeaders
);

// Create/Update a review
const review = await sdk.store.productReviews.upsert(
  data: StoreUpsertProductReviewsDTO,
  headers?: ClientHeaders
);

// Get review statistics
const stats = await sdk.store.productReviews.listStats(
  query: StoreListProductReviewStatsQuery,
  headers?: ClientHeaders
);
```

### Admin Operations

```typescript
// List reviews
const { reviews, count } = await sdk.admin.productReviews.list(
  query: AdminListProductReviewsQuery
);

// Update review status
const review = await sdk.admin.productReviews.updateStatus(
  productReviewId: string,
  status: 'pending' | 'approved' | 'flagged'
);

// Manage review responses
const review = await sdk.admin.productReviews.createResponse(
  productReviewId: string,
  data: AdminCreateProductReviewResponseDTO
);

await sdk.admin.productReviews.updateResponse(
  productReviewId: string,
  data: AdminUpdateProductReviewResponseDTO
);

await sdk.admin.productReviews.deleteResponse(
  productReviewId: string
);
```

## Review Workflow

1. **Creation**: Reviews are set to:
   - `approved` status by default
   - `pending` status if `defaultReviewStatus: 'pending'` is set in plugin options

2. **Moderation**: Admins can:
   - List and filter reviews
   - Update review status (approve/flag)
   - Manage responses (create/update/delete)

## Available Endpoints

### Admin Endpoints
- `GET /admin/product-reviews` - List all reviews
- `POST /admin/product-reviews/:id/response` - Add a response
- `PUT /admin/product-reviews/:id/response` - Update response
- `DELETE /admin/product-reviews/:id/response` - Delete response
- `PUT /admin/product-reviews/:id/status` - Update status

### Store Endpoints
- `GET /store/product-reviews` - List reviews
- `POST /store/product-reviews` - Create/Update review
- `GET /store/product-review-stats` - Get statistics

## Local Development

> **IMPORTANT**: A running PostgreSQL instance is required. The plugin expects `DB_USERNAME` and `DB_PASSWORD` environment variables to be set. If not provided, both default to "postgres".

Available scripts:
```bash
# Build the plugin
yarn build

# Development mode with hot-reload
yarn dev

# Publish to local registry for testing
yarn dev:publish

# Generate database migrations
yarn db:generate
```

### Installing the plugin in your Medusa project for local development
After publishing the plugin locally by running yarn dev:publish, go to the root of your Medusa project and run the following commands:

```bash
cd path/to/your/medusa-application

yarn medusa plugin:add @lambdacurry/medusa-product-reviews

# If you are yarn with a monorepo, you may also need to run
yarn install
```

## Compatibility

This plugin is compatible with versions `>= 2.5.0` of `@medusajs/medusa`.

## License

MIT License
