# Braintree Payment Provider for Medusa

This plugin integrates Braintree as a payment provider for your Medusa store. It allows you to process payments, handle 3D Secure authentication, and manage payment methods seamlessly.

## Quick Start

1. **Install the plugin:**
   ```bash
   npm install @lambdacurry/medusa-payment-braintree
   ```
2. **Set the required environment variables** in your `.env` file (see below).
3. **Add the provider** to your `medusa-config.js` or `config.ts` (see below).
4. **Add the required custom fields** in your Braintree dashboard (see below).
5. **Restart your Medusa server.**

## Features

- Secure payment processing with Braintree.
- Support for 3D Secure authentication.
- Webhook handling for payment updates.
- Save payment methods for future transactions.

## Installation

Install the plugin in your Medusa project:

```bash
npm install @lambdacurry/medusa-payment-braintree
```

## Configuration

### Environment Variables

Set the following environment variables in your `.env` file:

```env
BRAINTREE_PUBLIC_KEY=<your_public_key>
BRAINTREE_MERCHANT_ID=<your_merchant_id>
BRAINTREE_PRIVATE_KEY=<your_private_key>
BRAINTREE_WEBHOOK_SECRET=<your_webhook_secret>
BRAINTREE_ENVIRONMENT=sandbox|development|production|qa
BRAINTREE_ENABLE_3D_SECURE=true|false
BRAINTREE_LOGGING=true|false
TEST_FORCE_SETTLED=true|false
```

- `BRAINTREE_PUBLIC_KEY`: Your Braintree public key.
- `BRAINTREE_MERCHANT_ID`: Your Braintree merchant ID.
- `BRAINTREE_PRIVATE_KEY`: Your Braintree private key.
- `BRAINTREE_WEBHOOK_SECRET`: Secret for validating Braintree webhooks.
- `BRAINTREE_ENVIRONMENT`: One of `sandbox`, `development`, `production`, or `qa`.
- `BRAINTREE_ENABLE_3D_SECURE`: Set to `true` to enable 3D Secure authentication, otherwise `false`.
- `BRAINTREE_LOGGING`: Optional. Set to `true` to enable plugin debug logging. Wire this to the provider `logging` option in `medusa-config.ts` (see below). Defaults to `false`.
- `TEST_FORCE_SETTLED`: Optional. **Sandbox only.** Wire this to the provider `testForceSettled` option in `medusa-config.ts` (see below). Defaults to `false`. Do not enable in production.

### Testing refunds in sandbox

In Braintree sandbox, transactions often remain in `authorized` or `submitted_for_settlement` status until they are settled. The provider routes refunds differently by status:

- **Void path:** `authorized`, `submitted_for_settlement`
- **Refund path:** `settled`, `settling`

To test the refund path locally without waiting for settlement, set `environment: 'sandbox'` and `testForceSettled: true` in provider options (optionally via env):

```env
BRAINTREE_ENVIRONMENT=sandbox
TEST_FORCE_SETTLED=true
```

```javascript
options: {
  environment: process.env.BRAINTREE_ENVIRONMENT || 'sandbox',
  testForceSettled: process.env.TEST_FORCE_SETTLED === 'true',
  // ...
}
```

When both are set, `refundPayment` calls Braintree's sandbox `testing.settle` on the transaction, re-fetches it, then proceeds with `transaction.refund`. If `testForceSettled` is `true` but the provider environment is not `sandbox`, the settle step is skipped and a warning is logged.

### Medusa Configuration

Add the following configuration to the `payment` section of your `medusa-config.js` or `config.ts` file:

```javascript
dependencies:[Modules.CACHE]
{
  resolve: '@lambdacurry/medusa-payment-braintree/providers/payment-braintree',
  id: 'braintree',
  options: {
    environment: process.env.BRAINTREE_ENVIRONMENT || (process.env.NODE_ENV !== 'production' ? 'sandbox' : 'production'),
    defaultCurrencyCode: "USD",
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
    webhookSecret: process.env.BRAINTREE_WEBHOOK_SECRET,
    enable3DSecure: process.env.BRAINTREE_ENABLE_3D_SECURE === 'true',
    savePaymentMethod: true, // Save payment methods for future use
    autoCapture: true,        // Automatically capture payments
    allowRefundOnRefunded: false,
    disableVoidTransactions: false,
    logging: process.env.BRAINTREE_LOGGING === 'true', // Enable plugin debug logs
    testForceSettled: process.env.TEST_FORCE_SETTLED === 'true', // Sandbox: settle before refund
  }
}
```

#### Options

- **merchantId**: Your Braintree Merchant ID.
- **defaultCurrencyCode**: An optional field to indicate default currency code
- **publicKey**: Your Braintree Public Key.
- **privateKey**: Your Braintree Private Key.
- **webhookSecret**: Secret for validating Braintree webhooks.
- **enable3DSecure**: Enable 3D Secure authentication (`true` or `false`).
- **savePaymentMethod**: Save payment methods for future use (default: `true`).
- **autoCapture**: Automatically capture payments (default: `true`).
- **allowRefundOnRefunded**: Allow refund attempts on already-refunded imported transactions (default: `false`).
- **disableVoidTransactions**: When `true`, refunds never void; only `settled`/`settling` transactions may be refunded. Late requirement so future partial order refunds and order edits can be supported (void cancels the full authorization). Default: `false`. With this enabled, refunds on unsettled transactions fail with “cannot be refunded right now”.
- **logging**: Enable verbose plugin debug logging (`true` or `false`, default: `false`). When `true`, the provider logs operation details (initiate, authorize, capture, refund, etc.) and expanded Braintree error context via Medusa's logger with a `[Braintree]` prefix. Set via `BRAINTREE_LOGGING=true` in `.env` or pass `logging: true` directly in provider options. Disable in production unless actively debugging.
- **testForceSettled**: **Sandbox only.** When `true` **and** `environment` is `sandbox`, the refund flow settles the Braintree transaction via the sandbox testing API before attempting a refund. Use this to exercise the **refund** path (settled/settling) instead of the **void** path (authorized/submitted_for_settlement). Defaults to `false`. Ignored (with a warning) outside sandbox. Set via `TEST_FORCE_SETTLED=true` in `.env` wired to this option, or pass `testForceSettled: true` directly. Do not enable in production.

### Debug logging

Enable plugin debug logs in `medusa-config.ts`:

```typescript
options: {
  // ...
  logging: process.env.BRAINTREE_LOGGING === 'true',
}
```

Then in `.env`:

```env
BRAINTREE_LOGGING=true
```

What `logging: true` enables:

- **`logDebug`** — operation context for payment flows (e.g. refund input, API responses)
- **`logErrorDetail`** — extra Braintree failure details (validation errors, processor response codes, stack traces)

Logs are written through Medusa's `logger.info()` and appear in the Medusa server output. Ensure Medusa's `LOG_LEVEL` is not set to `error` if you want to see them (the default `http` level includes `info` messages).

### Upgrading to 0.1.2

Earlier README examples used `logging: process.env.NODE_ENV !== 'production'` (auto-enabled in development). Current examples use explicit `BRAINTREE_LOGGING=true` / `logging: process.env.BRAINTREE_LOGGING === 'true'`. If you relied on implicit dev logging, set `BRAINTREE_LOGGING=true` or pass `logging: true` in provider options.

> **Note:**
> - `autoCapture`: If set to `true`, payments are captured automatically after authorization.
> - `savePaymentMethod`: If set to `true`, customer payment methods are saved for future use.
> - `allowRefundOnRefunded`: If set to `true`, the imported payment provider will gracefully handle refund attempts on transactions that have already been refunded in Braintree. Instead of throwing an error, it will log a warning and record the refund locally only. This is useful when orders are imported and later refunded directly in Braintree.
> - `disableVoidTransactions`: Late additional requirement so future partial order refunds and order edits can be supported. When `true`, the provider waits for `settled`/`settling` before refunding; otherwise refund fails with “cannot be refunded right now”. `cancelPayment` may still void.

### 3D Secure Setup

If you enable 3D Secure (`BRAINTREE_ENABLE_3D_SECURE=true`), you may need to make additional changes on your storefront to support 3D Secure flows. Refer to the [Braintree 3D Secure documentation](https://developer.paypal.com/braintree/docs/guides/3d-secure/overview/) for more details.

### Webhook Setup

To handle payment updates from Braintree, you need to configure webhooks:

1. In your Braintree dashboard, go to **Settings > Webhooks**.
2. Add a new webhook and set the URL to your Medusa server's webhook endpoint (e.g., `https://your-medusa-server.com/webhooks/braintree`).
3. Use the value of `BRAINTREE_WEBHOOK_SECRET` as the secret for validating incoming webhooks.
4. Make sure your Medusa server is configured to handle Braintree webhook events.

For more information, see the [Braintree Webhooks documentation](https://developer.paypal.com/braintree/docs/guides/webhooks/overview).

### Adding Custom Fields in the Braintree Dashboard

To use custom fields, create them in your Braintree dashboard (API names must be lowercase). You will provide their values when calling `authorizePayment` via `context.custom_fields`.

1. **Navigate to:**  
   `Account Settings` → `Transactions` → `Custom Fields`

2. **Add each custom field:**
   - Click the **Options** button.
   - Click the **Add** button.
   - Enter the details for each field as shown below:

| Field Name (example)     | API Name (example)          | Description         | Options             |
|--------------------------|-----------------------------|---------------------|---------------------|
| Medusa Payment Session Id | `medusa_payment_session_id` | Medusa Session Id   | Store and Pass back |
| Cart Id                   | `cart_id`                   | Cart Id             | Store and Pass back |
| Customer Id               | `customer_id`               | Customer Id         | Store and Pass back |

> Note
> - Braintree only accepts values for custom fields that exist in your dashboard and match the field API names (lowercase).
> - If you rely on webhooks that read `medusa_payment_session_id`, include that key in `context.custom_fields` when you call `authorizePayment`.
### Passing Custom Fields to authorizePayment

Custom fields are forwarded to Braintree when the provider creates the transaction during `authorizePayment`. Provide them on the `context` as `custom_fields`.

Example:

```ts
// Example shape; Medusa calls the provider under the hood.
await braintreeProvider.authorizePayment({
  data: {
    amount: 10, // standard currency units; converted to "10.00"
    currency_code: 'USD',
    payment_method_nonce: '<client-side-nonce>',
  },
  context: {
    idempotency_key: 'sess_123',
    customer: { id: 'cust_123', email: 'c@example.com' },
    custom_fields: {
      medusa_payment_session_id: 'sess_123',
      cart_id: 'cart_123',
      customer_id: 'cust_123',
    },
    // Optional: shipping_address, billing_address, totals, items
  },
});
```

Requirements and tips:
- Provide `custom_fields` as an object of `API name -> string value`.
- Only fields that exist in Braintree will be accepted.
- For webhook correlation, set `medusa_payment_session_id` to your Medusa payment session or idempotency key.

Implementation detail: the provider passes `context.custom_fields` directly to Braintree’s `customFields` in the sale request (`plugins/braintree-payment/src/providers/payment-braintree/src/core/braintree-base.ts:402`).

## License

This plugin is licensed under the [MIT License](LICENSE).

For more information, visit the [Braintree Documentation](https://developer.paypal.com/braintree/docs).
