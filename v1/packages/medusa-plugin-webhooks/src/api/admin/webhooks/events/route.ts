import {
  CustomerService,
  OrderService,
  ProductService,
  type MedusaRequest,
  type MedusaResponse,
} from '@medusajs/medusa';
import { WebhookService } from '../../../../services';

interface EventOption {
  label: string;
  value: string;
}

export interface EventOptions {
  label: string;
  options: EventOption[];
}

const mapServiceToEvents = (service: typeof OrderService | typeof ProductService | typeof CustomerService) => {
  return Object.values(service.Events).map((event) => ({ label: event, value: event })) as EventOption[];
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const webhookService = req.scope.resolve<WebhookService>('webhookService');

  const options: EventOptions[] = [
    {
      label: 'Orders',
      options: mapServiceToEvents(OrderService),
    },
    {
      label: 'Products',
      options: mapServiceToEvents(ProductService),
    },
    {
      label: 'Customers',
      options: mapServiceToEvents(CustomerService),
    },
  ];

  if (webhookService.customSubscriptions.length > 0) {
    options.unshift({
      label: 'Custom',
      options: webhookService.customSubscriptions.map((subscription) => ({ label: subscription, value: subscription })),
    });
  }

  res.status(200).json({ options });
};
