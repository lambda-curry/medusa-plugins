import { FindPaginationParams, validator, type MedusaRequest, type MedusaResponse } from '@medusajs/medusa';
import { WebhookService } from '../../../services';
import { CreateWebhookReq } from '../../validators';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const validatedConfig = await validator(FindPaginationParams, req.query);

  const webhookService = req.scope.resolve<WebhookService>('webhookService');

  const subscriptions = await webhookService.listAndCount({}, validatedConfig);

  res.status(200).json({ subscriptions });
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const validated = await validator(CreateWebhookReq, req.body);

  const webhookService = req.scope.resolve<WebhookService>('webhookService');

  const subscription = await webhookService.createWebhookSubscription(validated);

  res.status(200).json({ subscription });
};
