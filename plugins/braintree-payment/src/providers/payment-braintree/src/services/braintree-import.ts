import { BraintreeConstructorArgs } from '../core/braintree-base';
import BraintreeImport from '../core/braintree-import';
import type { BraintreeOptions } from '../types';
import { PaymentProviderKeys } from '../types';

class BraintreeImportService extends BraintreeImport {
  static identifier = PaymentProviderKeys.IMPORTED;
  options: BraintreeOptions;

  constructor(container: BraintreeConstructorArgs, options: BraintreeOptions) {
    super(container, options);
    this.options = options;
  }
}

export default BraintreeImportService;
