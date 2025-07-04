import type { MedusaContainer } from '@medusajs/medusa';
import BraintreeBase from '../core/braintree-base';
import { PaymentProviderKeys } from '../types';
import type { BraintreeOptions } from '../types';

class BraintreeProviderService extends BraintreeBase {
  static identifier = PaymentProviderKeys.BRAINTREE;
  options: BraintreeOptions;

  constructor(container: MedusaContainer, options: BraintreeOptions) {
    super(container, options);
    this.options = options;
  }
}

export default BraintreeProviderService;
