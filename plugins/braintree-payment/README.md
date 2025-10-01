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
```

- `BRAINTREE_PUBLIC_KEY`: Your Braintree public key.
- `BRAINTREE_MERCHANT_ID`: Your Braintree merchant ID.
- `BRAINTREE_PRIVATE_KEY`: Your Braintree private key.
- `BRAINTREE_WEBHOOK_SECRET`: Secret for validating Braintree webhooks.
- `BRAINTREE_ENVIRONMENT`: One of `sandbox`, `development`, `production`, or `qa`.
- `BRAINTREE_ENABLE_3D_SECURE`: Set to `true` to enable 3D Secure authentication, otherwise `false`.

### Medusa Configuration

Add the following configuration to the `payment` section of your `medusa-config.js` or `config.ts` file:

```javascript
dependencies:[Modules.CACHE]
{
  resolve: '@lambdacurry/medusa-payment-braintree/providers/payment-braintree',
  id: 'braintree',
  options: {
    environment: process.env.BRAINTREE_ENVIRONMENT || (process.env.NODE_ENV !== 'production' ? 'sandbox' : 'production'),
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
    webhookSecret: process.env.BRAINTREE_WEBHOOK_SECRET,
    enable3DSecure: process.env.BRAINTREE_ENABLE_3D_SECURE === 'true',
    savePaymentMethod: true, // Save payment methods for future use
    autoCapture: true,        // Automatically capture payments
  }
}
```

#### Options

- **merchantId**: Your Braintree Merchant ID.
- **publicKey**: Your Braintree Public Key.
- **privateKey**: Your Braintree Private Key.
- **webhookSecret**: Secret for validating Braintree webhooks.
- **enable3DSecure**: Enable 3D Secure authentication (`true` or `false`).
- **savePaymentMethod**: Save payment methods for future use (default: `true`).
- **autoCapture**: Automatically capture payments (default: `true`).

> **Note:**
> - `autoCapture`: If set to `true`, payments are captured automatically after authorization.
> - `savePaymentMethod`: If set to `true`, customer payment methods are saved for future use.

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

To use custom fields, create them in your Braintree dashboard (API names must be lowercase). Add the fields you intend to allow via `options.customFields`.

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
> - Only fields present in `options.customFields` and supplied in `data.custom_fields` are sent to Braintree.
> - If you rely on webhooks that read `medusa_payment_session_id`, include that field in `options.customFields` and provide it in `data.custom_fields` during initiate/update.

### Supplying Custom Fields and Order ID

- In `initiatePayment` or `updatePayment`, provide:
  - `data.custom_fields`: object of API name to value; values are coerced to strings; only whitelisted keys are sent.
  - `data.order_id`: string passed as Braintree `orderId` on the transaction.

Merge behavior on `updatePayment`:
- New `custom_fields` overwrite keys but preserve any previously saved keys.
- If no `custom_fields` are present after merging or the whitelist is empty, no `customFields` are sent.

## License

This plugin is licensed under the [MIT License](LICENSE).

For more information, visit the [Braintree Documentation](https://developer.paypal.com/braintree/docs).  
