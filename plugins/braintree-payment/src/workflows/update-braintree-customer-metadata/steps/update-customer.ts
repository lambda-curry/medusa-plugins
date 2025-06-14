import type { ICustomerModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import type { UpdateBraintreeCustomerMetadataInput } from '..';

export const updateCustomerMetadataStep = createStep(
  'create-customer-step',
  async (input: UpdateBraintreeCustomerMetadataInput, { container }) => {
    const customerService: ICustomerModuleService = container.resolve(Modules.CUSTOMER);

    // 1. create customer
    const customer = await customerService.retrieveCustomer(input.medusa_customer_id);

    // 2. update customer metadata with Braintree information
    const { medusa_customer_id, ...rest } = input;
    const { braintree } = rest as Record<string, unknown>;
    if (!braintree || typeof braintree !== 'object') {
      throw new Error('Missing or invalid Braintree data in the input');
    }
    const registerResponse = await customerService.updateCustomers(medusa_customer_id, {
      metadata: {
        ...customer.metadata,
        braintree: {
          ...(braintree as Record<string, unknown>),
        },
      },
    });

    return new StepResponse({ customer: customer, registerResponse }, customer.id);
  }
);
