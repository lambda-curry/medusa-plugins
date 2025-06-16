import { WorkflowResponse, createWorkflow } from '@medusajs/framework/workflows-sdk';

import { MedusaError } from '@medusajs/framework/utils';
import { updateCustomerMetadataStep } from './steps/update-customer';

export type UpdateBraintreeCustomerMetadataInput = {
  medusa_customer_id: string;
} & Record<string, unknown>;

export const updateBraintreeCustomerMetadataWorkflow = createWorkflow(
  'update-braintree-customer-metadata',
  (input: UpdateBraintreeCustomerMetadataInput) => {
    try {
      const { customer, registerResponse } = updateCustomerMetadataStep(input);

      return new WorkflowResponse({
        customer,
        registerResponse,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : JSON.stringify(error);
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Failed to update Braintree customer metadata: ${msg}`);
    }
  },
);
