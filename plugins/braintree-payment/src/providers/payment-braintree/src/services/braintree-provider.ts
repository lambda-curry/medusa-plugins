import BraintreeBase, { BraintreeConstructorArgs } from '../core/braintree-base';
import type { BraintreeOptions } from '../types';
import { PaymentProviderKeys } from '../types';

class BraintreeProviderService extends BraintreeBase {
  static identifier = PaymentProviderKeys.BRAINTREE;
  options: BraintreeOptions;

  constructor(container: BraintreeConstructorArgs, options: BraintreeOptions) {
    super(container, options);
    this.options = options;
  }
}

export default BraintreeProviderService;
