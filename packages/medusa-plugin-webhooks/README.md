# Medusa Webhooks Plugin

This plugin adds webhook functionality to your Medusa e-commerce server, enabling you to send real-time notifications to external services whenever specific events occur in your system. By integrating this plugin, you can easily manage webhooks directly from the Medusa admin panel, ensuring that your application stays connected and responsive to changes.

## Features

- **Create and Manage Webhooks**: Easily create, update, and delete webhooks through a user-friendly interface in the Medusa admin panel.
- **Custom Event Subscriptions**: Support for custom event types, allowing you to trigger webhooks for specific events that are important to your business.
- **Seamless Integration**: Fully integrates with Medusa's event bus system, making it easy to extend and customize.

## Installation

To install the Medusa Webhooks Plugin in your Medusa project, follow these steps:

1. Add the plugin package to your Medusa project:

   ```bash
   yarn add @markethaus/medusa-plugin-webhooks
   ```

2. Open your `medusa-config.js` file and add the plugin to the `plugins` array with the desired configuration:

   ```javascript
   const plugins = [
     // other plugins
     {
       resolve: "@markethaus/medusa-plugin-webhooks",
       options: {
         enableUI: true, // Enables the UI components for managing webhooks in the admin panel
         customSubscriptions: [
           "customer.referred",
           "wishlist.item_added",
           "wishlist.item_removed",
         ],
       },
     },
     // other plugins
   ];
   ```

## Configuration

To configure the Webhooks Plugin:

1. **Enable the UI**: By setting `enableUI: true`, the plugin will include UI components in the Medusa admin panel, allowing for easy management of webhooks.

2. **Custom Event Subscriptions**: The `customSubscriptions` array allows you to define custom events that your application can subscribe to. These events will trigger the webhooks you've set up.

   Example custom events:

   - `customer.referred`: Triggered when a customer refers a friend or family member to the store.
   - `wishlist.item_added`: Triggered when a customer adds an item to their wishlist.
   - `wishlist.item_removed`: Triggered when a customer removes an item from their wishlist.

### Example: Implementing a Custom Subscriber

To handle custom events in your Medusa server, you can create a custom subscriber. Here's an example implementation of a custom subscriber for the `wishlist.item_added` event:

```javascript
    import { type SubscriberArgs, type SubscriberConfig } from '@medusajs/medusa';
    import WishlistService from '../services/wishlist';
    import WebhookService from '@markethaus/medusa-plugin-webhooks/src/services/webhook';
    import { Logger } from '@tanstack/react-query';

    export const config: SubscriberConfig = {
      event: [WishlistService.Events.ITEM_ADDED, WishlistService.Events.ITEM_REMOVED],
      context: {
        subscriberId: 'wishlist-webhooks',
      },
    };

    export default async function handleWishlistWebhooks({ eventName, container, data }: SubscriberArgs) {
      const webhookService = container.resolve<WebhookService>('webhookService');
      const logger = container.resolve<Logger>('logger');
      const { itemId } = data as {
        itemId: string;
      };

      const webhooks = await webhookService.list({
        event_type: eventName,
        active: true,
      });

      if (webhooks.length === 0) {
        logger.warn(`No webhooks found for event ${eventName}`);
        return;
      }

      const wishlistService = container.resolve<WishlistService>('wishlistService');

      const wishlistItem = await wishlistService.retrieveItem(
        { id: itemId }
      );

      const results = await webhookService.sendWebhooksEvents(webhooks, wishlistItem);

      results.forEach((result) => {
        logger.log(`Webhook ${result.value.event_type} -> ${result.value.target_url} ${result.value.result}`);
      });
    }
```

By following these steps, your Medusa server will be equipped to handle real-time notifications via webhooks, enhancing the interactivity and responsiveness of your e-commerce platform.
