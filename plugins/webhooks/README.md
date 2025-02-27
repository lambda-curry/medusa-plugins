# Markethaus Webhooks Plugin

Add webhook functionality to your Medusa e-commerce server, allowing you to send real-time notifications to external services when specific events occur in your system. The plugin seamlessly integrates with Medusa's event system and provides a simple way to manage webhooks for various events.

## Features

- **Event-Based Webhooks**: Automatically trigger webhooks based on Medusa events like product creation, updates, and more
- **Flexible Configuration**: Easy setup and configuration through Medusa's plugin system
- **Built-in Event Support**: Pre-configured support for common Medusa events
- **Workflow Integration**: Seamlessly integrates with Medusa's workflow system for reliable webhook processing
- **Error Handling**: Robust error handling and logging for webhook delivery

## Installation

1. Install the plugin using your preferred package manager:

```bash
npm install @markethaus/webhooks
# or
yarn add @markethaus/webhooks
```

2. Add the plugin to your `medusa-config.js`:

```javascript
const plugins = [
  // ... other plugins
  {
    resolve: "@markethaus/webhooks",
    options: {
      // Add here the subcribers you will define
      subscriptions: ["product.created", "product.updated"],
    },
  },
];
```

3. Run migrations:

```bash
yarn medusa db:migrate
```

## Usage

### Creating a Webhook Subscriber

Here's an example of how to create a webhook subscriber for product events:

```typescript
import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework/subscribers";
import { getWebhooksSubscriptionsWorkflow } from "@markethaus/webhooks/workflows";

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated"],
  context: {
    subscriberId: "product-added",
  },
};

export default async function handleProductAdded({
  event: { name },
  container,
}: SubscriberArgs<{ id: string }>): Promise<void> {
  const query = container.resolve("query");
  const logger = container.resolve("logger");

  // Fetch product data
  const { data: productResult } = await query.graph({
    entity: "product",
    fields: ["*"],
  });

  const product = productResult[0];

  if (!product) {
    logger.error("Product not found");
    return;
  }

  // Process webhooks
  const webhooksResult = await getWebhooksSubscriptionsWorkflow(container).run({
    input: {
      eventName: name,
      eventData: product,
    },
  });

  console.log(webhooksResult);
}
```

## Development

To contribute to this plugin:

1. Clone the repository
2. Install dependencies: `yarn install`
3. Run the plugin: `yarn dev`

Please read more about how to run the plugin in dev mode: https://docs.medusajs.com/learn/fundamentals/plugins/create

## License

MIT License
