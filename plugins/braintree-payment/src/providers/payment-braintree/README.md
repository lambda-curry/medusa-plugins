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
    braintree_merchant_id: process.env.BRAINTREE_MERCHANT_ID,
    public_key: process.env.BRAINTREE_PUBLIC_KEY,
    private_key: process.env.BRAINTREE_PRIVATE_KEY,
    webhook_secret: process.env.BRAINTREE_WEBHOOK_SECRET,
    enable_3d_secure: process.env.BRAINTREE_ENABLE_3D_SECURE === 'true',
    save_payment_method: true,
    auto_capture: true,
  }
}
```

### Options

- **braintree_merchant_id**: Your Braintree Merchant ID.
- **public_key**: Your Braintree Public Key.
- **private_key**: Your Braintree Private Key.
- **webhook_secret**: Secret for validating Braintree webhooks.
- **enable_3d_secure**: Enable 3D Secure authentication (`true` or `false`).
- **save_payment_method**: Save payment methods for future use (default: `true`).
- **auto_capture**: Automatically capture payments (default: `true`).

## Features

- Secure payment processing with Braintree.
- Support for 3D Secure authentication.
- Webhook handling for payment updates.
- Save payment methods for future transactions.

###

in the braintree dashboard add these custom fields in here

account-settings->Transactions->Custom Fields

click the options button
click the add button
* medusa_payment_session_id
  Api Name : medusa_payment_session_id
  Description: Medusa Session Id
  Options: Store and Pass back


* cart_id
  Api Name : cart_id
  Description: Cart Id
  Options: Store and Pass back

* customer_id

  Api Name : customer_id
  Description: Customer Id 
  Options: Store and Pass back

Note api_names must be in lower case

## License

This plugin is licensed under the [MIT License](LICENSE).

For more information, visit the [Braintree Documentation](https://developer.paypal.com/braintree/docs).  