# @lambdacurry/medusa-page-builder

A plugin that adds visual page building capabilities to your Medusa application, with built-in components, layouts, and SEO management.

> This plugin is part of the [Medusa Plugins Collection](https://github.com/lambda-curry/medusa-plugins).

## Features
> See a demo in our [Medusa Starter](https://github.com/lambda-curry/medusa2-starter)

- Visual drag-and-drop page builder interface
- Pre-built components library
- Customizable layouts and templates
- Dynamic content management
- SEO optimization tools
- Version control and publishing workflow
- SDK for Store and Admin operations

## Prerequisites

- [Medusa >=2.5.0 backend](https://docs.medusajs.com/development/backend/install)
- [PostgreSQL](https://docs.medusajs.com/development/backend/prepare-environment#postgresql)

## Installation and Configuration

1. Install the plugin:
```bash
yarn add @lambdacurry/medusa-page-builder

# or, if you're using yarn workspaces
yarn workspace my-app add @lambdacurry/medusa-page-builder
```

2. Add to `medusa-config.ts`:
```js
module.exports = defineConfig({
  plugins: [
    {
      resolve: '@lambdacurry/medusa-page-builder',
      options: {
        defaultPageStatus: 'draft', // OPTIONAL, default is 'published'
        components: {
          // Define your custom components here
        },
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
// List pages
const { pages, count } = await sdk.store.pages.list(
  query: StoreListPagesQuery,
  headers?: ClientHeaders
);

// Get a single page
const page = await sdk.store.pages.retrieve(
  pageId: string,
  headers?: ClientHeaders
);

// Get page components
const components = await sdk.store.pages.getComponents(
  pageId: string,
  headers?: ClientHeaders
);
```

### Admin Operations

```typescript
// List pages
const { pages, count } = await sdk.admin.pages.list(
  query: AdminListPagesQuery
);

// Create/Update pages
const page = await sdk.admin.pages.create(
  data: AdminCreatePageDTO
);

const page = await sdk.admin.pages.update(
  pageId: string,
  data: AdminUpdatePageDTO
);

// Manage page status
const page = await sdk.admin.pages.updateStatus(
  pageId: string,
  status: 'draft' | 'published' | 'archived'
);

// Manage components
const page = await sdk.admin.pages.updateComponents(
  pageId: string,
  data: AdminUpdatePageComponentsDTO
);
```

## Page Workflow

1. **Creation**: Pages are set to:
   - `published` status by default
   - `draft` status if `defaultPageStatus: 'draft'` is set in plugin options

2. **Management**: Admins can:
   - Create and edit pages using the visual builder
   - Manage page status (draft/published/archived)
   - Configure SEO settings
   - Manage component layouts and content

## Available Endpoints

### Admin Endpoints
- `GET /admin/pages` - List all pages
- `POST /admin/pages` - Create a page
- `GET /admin/pages/:id` - Get a page
- `PUT /admin/pages/:id` - Update a page
- `PUT /admin/pages/:id/status` - Update status
- `PUT /admin/pages/:id/components` - Update components

### Store Endpoints
- `GET /store/pages` - List published pages
- `GET /store/pages/:id` - Get a published page
- `GET /store/pages/:id/components` - Get page components

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

yarn medusa plugin:add @lambdacurry/medusa-page-builder

# If you are using yarn with a monorepo, you may also need to run
yarn install
```

## Compatibility

This plugin is compatible with versions `>= 2.5.0` of `@medusajs/medusa`.

## License

MIT License 