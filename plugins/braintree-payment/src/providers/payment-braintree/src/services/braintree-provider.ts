import BraintreeBase from '../core/braintree-base';
import { PaymentProviderKeys } from '../types';
import type { BraintreeOptions } from '../types';
class BraintreeProviderService extends BraintreeBase {
  static identifier = PaymentProviderKeys.BRAINTREE;
  options: BraintreeOptions;
  constructor(container, options) {
    super(container, options);
    this.options = options;
  }
}

export default BraintreeProviderService;
