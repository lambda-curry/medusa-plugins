import type Braintree from 'braintree';

export interface BraintreeOptions extends Braintree.ClientGatewayConfig {
  environment: 'production' | 'sandbox' | 'development' | 'qa';
  merchantId: string;
  publicKey: string;
  privateKey: string;
  enable3DSecure: boolean;
  savePaymentMethod: boolean;
  webhookSecret: string;
  autoCapture: boolean;
}

export const PaymentProviderKeys = {
  BRAINTREE: 'braintree',
};

export interface CustomFields {
  medusa_payment_session_id?: string;
  cart_id?: string;
  customer_id: string;
}
