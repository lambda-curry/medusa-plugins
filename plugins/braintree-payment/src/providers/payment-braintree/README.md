# Braintree Payment Provider for Medusa

This plugin integrates Braintree as a payment provider for your Medusa store. It allows you to process payments, handle 3D Secure authentication, and manage payment methods seamlessly.

## Installation

Install the plugin in your Medusa project:

```bash
npm install medusa-plugin-braintree
```

## Configuration

### Environment Variables

Set the following environment variables in your `.env` file:

```env
BRAINTREE_PUBLIC_KEY=<Your public key>
BRAINTREE_MERCHANT_ID=<Your merchnat Id>
BRAINTREE_PRIVATE_KEY=<Your private key>
BRAINTREE_WEBHOOK_SECRET=<Your webhook secret>
BRAINTREE_ENVIRONMENT=one of "sandbox" | "devevlopmnent" | "production" | "qa"
BRAINTREE_ENABLE_3D_SECURE=true
```

### Medusa Configuration

Add the following configuration to the `payment` section of your `medusa-config.js` or `config.ts` file:

```javascript
{
  resolve: 'medusa-plugin-braintree/providers/payment-braintree/src',
  id: 'braintree',
  options: {
    environment: process.env.NODE_ENV !== 'production' ? 'sandbox' : 'production',
    defaultCurrencyCode:"USD"
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
    webhookSecret: process.env.BRAINTREE_WEBHOOK_SECRET,
    enable3DSecure: process.env.BRAINTREE_ENABLE_3D_SECURE === 'true',
    savePaymentMethod: true,
    autoCapture: true,
    customFields: ['medusa_payment_session_id', 'cart_id', 'customer_id'],
  }
}
```

### Options

- **merchantId**: Your Braintree Merchant ID.
- **publicKey**: Your Braintree Public Key.
- **privateKey**: Your Braintree Private Key.
- **webhookSecret**: Secret for validating Braintree webhooks.
- **enable3DSecure**: Enable 3D Secure authentication (`true` or `false`).
- **savePaymentMethod**: Save payment methods for future use (default: `true`).
- **autoCapture**: Automatically capture payments (default: `true`).
- **defaultCurrencyCode**: The default currency to use. This is optional
- **customFields**: Array of Braintree custom field API names permitted to be forwarded from `data.custom_fields`. If empty or omitted, no user-provided custom fields are sent.

## Features

- Secure payment processing with Braintree.
- Support for 3D Secure authentication.
- Webhook handling for payment updates.
- Save payment methods for future transactions.

### Creating Custom Fields in Braintree Dashboard

- Navigate to: Account Settings → Transactions → Custom Fields.
- Add the fields you plan to send. API names must be lowercase.
- Set fields to "Store and Pass back" if you want them on the transaction record.

Common examples:

- `medusa_payment_session_id`: Medusa Session Id
- `cart_id`: Cart Id
- `customer_id`: Customer Id

Only fields listed in `options.customFields` and supplied in `data.custom_fields` are forwarded.

### Supplying Custom Fields and Order ID

- `data.custom_fields`: object map of API name → value. Values are coerced to strings; only whitelisted keys are sent.
- `data.order_id`: string forwarded as Braintree `orderId` in the sale request.

Update behavior: `updatePayment` merges `custom_fields` by overwriting existing keys but keeping unspecified ones.

## License

This plugin is licensed under the [MIT License](LICENSE).

For more information, visit the [Braintree Documentation](https://developer.paypal.com/braintree/docs).  
