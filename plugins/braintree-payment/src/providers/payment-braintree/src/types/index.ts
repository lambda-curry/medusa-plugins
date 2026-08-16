import type Braintree from 'braintree';
import type { Agent } from 'http';
import type { Agent as HttpsAgent } from 'https';

export interface HttpAgentConfig {
  keepAlive?: boolean;
  keepAliveMsecs?: number;
  maxSockets?: number;
  maxFreeSockets?: number;
  timeout?: number;
  rejectUnauthorized?: boolean;
}

export interface BraintreeOptions extends Braintree.ClientGatewayConfig {
  defaultCurrencyCode?: string;
  environment: 'production' | 'sandbox' | 'development' | 'qa';
  merchantId: string;
  publicKey: string;
  privateKey: string;
  enable3DSecure: boolean;
  savePaymentMethod: boolean;
  webhookSecret: string;
  autoCapture: boolean;
  allowRefundOnRefunded?: boolean;
  /** Lowest precedence agent config, used to create a standard https.Agent. */
  httpAgent?: HttpAgentConfig;
  /** Optional proxy URL used to create an HTTPS proxy agent. */
  proxyUrl?: string;
  /** Highest precedence: pass a fully constructed Node HTTP(S) agent directly. */
  customHttpAgent?: Agent | HttpsAgent;
  /**
   * When true, refundPayment never voids. Only settled/settling transactions may be refunded.
   * Late requirement so future partial order refunds and order edits can be supported
   * (void cancels the full authorization).
   */
  disableVoidTransactions?: boolean;
  /** When true, logs important operations to the console for debugging. */
  logging?: boolean;
  /**
   * Sandbox only. When true, refundPayment settles the transaction via the
   * Braintree testing API before refunding (exercises refund vs void path).
   * Ignored outside sandbox. Default: false.
   */
  testForceSettled?: boolean;
}

export const PaymentProviderKeys = {
  BRAINTREE: 'braintree',
  IMPORTED: 'imported',
};

// Flexible map of custom fields returned by Braintree.
// Values are represented as strings by the API.
export type CustomFields = Record<string, string>;

export interface DecodedClientToken {
  version: number;
  authorizationFingerprint: string;
  configUrl: string;
  graphQL: GraphQl;
  clientApiUrl: string;
  environment: string;
  merchantId: string;
  assetsUrl: string;
  authUrl: string;
  venmo: string;
  challenges: string[];
  threeDSecureEnabled: boolean;
  analytics: Analytics;
  paypalEnabled: boolean;
  paypal: Paypal;
}

export interface GraphQl {
  url: string;
  date: string;
  features: string[];
}

export interface Analytics {
  url: string;
}

export interface Paypal {
  billingAgreementsEnabled: boolean;
  environmentNoNetwork: boolean;
  unvettedMerchant: boolean;
  allowHttp: boolean;
  displayName: string;
  clientId: string;
  baseUrl: string;
  assetsUrl: string;
  directBaseUrl: string;
  environment: string;
  braintreeClientId: string;
  merchantAccountId: string;
  currencyIsoCode: string;
}

export interface DecodedClientTokenAuthorization {
  exp: number;
  jti: string;
  sub: string;
  iss: string;
  merchant: Merchant;
  rights: string[];
  scope: string[];
  options: Options;
}

export interface Merchant {
  public_id: string;
  verify_card_by_default: boolean;
  verify_wallet_by_default: boolean;
}

export interface Options {}
