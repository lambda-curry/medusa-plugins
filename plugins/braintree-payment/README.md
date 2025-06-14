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
{
  resolve: '@lambdacurry/medusa-payment-braintree/providers/payment-braintree',
  id: 'braintree',
  options: {
    environment: process.env.BRAINTREE_ENVIRONMENT || (process.env.NODE_ENV !== 'production' ? 'sandbox' : 'production'),
    braintree_merchant_id: process.env.BRAINTREE_MERCHANT_ID,
    public_key: process.env.BRAINTREE_PUBLIC_KEY,
    private_key: process.env.BRAINTREE_PRIVATE_KEY,
    webhook_secret: process.env.BRAINTREE_WEBHOOK_SECRET,
    enable_3d_secure: process.env.BRAINTREE_ENABLE_3D_SECURE === 'true',
    save_payment_method: true, // Save payment methods for future use
    auto_capture: true,        // Automatically capture payments
  }
}
```

#### Options

- **braintree_merchant_id**: Your Braintree Merchant ID.
- **public_key**: Your Braintree Public Key.
- **private_key**: Your Braintree Private Key.
- **webhook_secret**: Secret for validating Braintree webhooks.
- **enable_3d_secure**: Enable 3D Secure authentication (`true` or `false`).
- **save_payment_method**: Save payment methods for future use (default: `true`).
- **auto_capture**: Automatically capture payments (default: `true`).

> **Note:**
> - `auto_capture`: If set to `true`, payments are captured automatically after authorization.
> - `save_payment_method`: If set to `true`, customer payment methods are saved for future use.

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

To ensure proper integration with Medusa, you need to add the following custom fields in your Braintree dashboard:

1. **Navigate to:**  
   `Account Settings` → `Transactions` → `Custom Fields`

2. **Add each custom field:**
   - Click the **Options** button.
   - Click the **Add** button.
   - Enter the details for each field as shown below:

| Field Name                | API Name                    | Description         | Options             |
|--------------------------|-----------------------------|---------------------|---------------------|
| Medusa Payment Session Id | `medusa_payment_session_id` | Medusa Session Id   | Store and Pass back |
| Cart Id                   | `cart_id`                   | Cart Id             | Store and Pass back |
| Customer Id               | `customer_id`               | Customer Id         | Store and Pass back |

> **Note:**  
> - The **API Name** must be in lowercase.  
> - Set the **Options** to "Store and Pass back" for each field.

## License

This plugin is licensed under the [MIT License](LICENSE).

For more information, visit the [Braintree Documentation](https://developer.paypal.com/braintree/docs).  