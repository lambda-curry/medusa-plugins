# Medusa Plugins Collection

A collection of plugins for enhancing your Medusa commerce application with additional features and functionalities.

## Plugins SDK
You can use the [Plugins SDK](./packages/plugins-sdk) to interact with the Medusa API and the plugins in this collection.

## Available Plugins

### [Product Reviews](./plugins/product-reviews)
Add product review capabilities to your Medusa store:
- Customer ratings and reviews
- Review moderation system
- Admin response management
- Review statistics
- Store and Admin API endpoints

## Requirements

- Medusa >= 2.5.0
- Node >= 20
- yarn@4.6.0

## Development
In order to develop and test the plugins, you need to have a running Medusa instance. You can use our [Medusa Starter](https://github.com/lambda-curry/medusa2-starter) for this purpose.

```bash
# Clone the repository
git clone https://github.com/lambda-curry/medusa-plugins.git
# Install dependencies
yarn install
# Test the setup
yarn build
```

## License

MIT
