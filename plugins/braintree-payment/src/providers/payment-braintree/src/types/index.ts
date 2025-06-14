import type braintree from 'braintree';

export interface BraintreeOptions extends braintree.ClientGatewayConfig {
  private_key: string;
  public_key: string;
  environment: 'production' | 'sandbox' | 'development' | 'qa';
  enable_3d_secure: boolean;
  save_payment_method: boolean;
  braintree_merchant_id: string;
  webhook_secret: string;
  auto_capture: boolean;
  // maybe removed later
  // automatic_expiry_period: number;
  // manual_expiry_period: number;
  // refund_speed: "normal" | "optimum";
}

export const PaymentProviderKeys = {
  BRAINTREE: 'braintree',
};

export interface CustomFields {
  medusa_payment_session_id?: string;
  cart_id?: string;
  customer_id: string;
}
