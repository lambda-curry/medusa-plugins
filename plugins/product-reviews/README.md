# Medusa Product Reviews Plugin

A plugin that adds product review capabilities to your Medusa commerce application.

> This plugin is part of the [Medusa Plugins Collection](https://github.com/lambda-curry/medusa-plugins).

## Features

- Customer product reviews with ratings
- Review moderation system (Admin)
- API endpoints for review management
- Store API endpoints for review retrieval

## Prerequisites

- [Medusa >=2.5.0 backend](https://docs.medusajs.com/development/backend/install)
- [PostgreSQL](https://docs.medusajs.com/development/backend/prepare-environment#postgresql)

> **IMPORTANT**: A running PostgreSQL instance is required. The plugin expects `DB_USERNAME` and `DB_PASSWORD` environment variables to be set. If not provided, both default to "postgres".

## Installation

```bash
npm install @lambdacurry/medusa-product-reviews
# or
yarn add @lambdacurry/medusa-product-reviews
```

## Configuration

Add the following to your `medusa-config.ts`:

```js
{
  resolve: `@lambdacurry/medusa-product-reviews`,
  options: {
    defaultReviewStatus: 'pending', // optional, default is 'approved'
  }
}
```

## API Documentation

The plugin adds the following endpoints:

- `GET /admin/product-reviews` - List all reviews (admin)
- `POST /admin/product-reviews/:id/response` - Add a response to a review (admin)
- `PUT /admin/product-reviews/:id/response` - Update a response to a review (admin)
- `DELETE /admin/product-reviews/:id/response` - Delete a response to a review (admin)
- `PUT /admin/product-reviews/:id/status` - Update review status (admin)
- `GET /admin/product-review-stats` - Get review statistics (admin)


- `GET /store/product-reviews` - Get product reviews
- `POST /store/product-reviews` - Create or update a product reviews
- `GET /store/product-review-stats` - Get review statistics

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

This plugin is compatible with versions >= 2.5.0 of `@medusajs/medusa`.

## License

MIT License
