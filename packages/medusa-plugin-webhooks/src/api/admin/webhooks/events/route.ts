import { OrderService, ProductService, type MedusaRequest, type MedusaResponse } from '@medusajs/medusa';
import { WebhookService } from '../../../../services';

export interface EventOptions {
  label: string;
  options: { label: string; value: string }[];
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const webhookService = req.scope.resolve<WebhookService>('webhookService');

  const options: EventOptions[] = [
    {
      label: 'Orders',
      options: Object.values(OrderService.Events).map((event) => ({ label: event, value: event })),
    },
    {
      label: 'Products',
      options: Object.values(ProductService.Events).map((event) => ({ label: event, value: event })),
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
