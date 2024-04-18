# @lambdacurry/medusa-plugin-event-bus-redis-dashboard

## Overview

A dashboard to view event-bus-redis events, based on bull-board <https://github.com/felixmosh/bull-board>

## Getting started

Install the module:

```bash
yarn add @lambdacurry/medusa-plugin-event-bus-redis-dashboard
```

Add the plugin to your `medusa-config.js`:

```js
module.exports = {
  // ...
  plugins: [
    {
      resolve: '@lambdacurry/medusa-plugin-event-bus-redis-dashboard',
      options: {
        eventBusRedisOptions: {
          // copy paste all options passed to event-bus-redis here.
          redisUrl: 'redis:..',
        },
        // where you want the dashboard to live on the API.
        basePath: '/event-bus-ui',
      },
    },
  ],
  // ...
};
```
