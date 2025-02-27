import { validator, type MedusaRequest, type MedusaResponse } from '@medusajs/medusa';
import { TestWebhookReq } from '../../../validators';
import { WebhookService } from '../../../../services';

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const validated = await validator(TestWebhookReq, req.body);

  const webhookService = req.scope.resolve<WebhookService>('webhookService');

  const response = await webhookService.testWebhookSubscription(validated);

  res.status(200).json({ response });
};
