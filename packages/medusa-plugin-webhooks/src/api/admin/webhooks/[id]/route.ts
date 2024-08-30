import { validator, type MedusaRequest, type MedusaResponse } from '@medusajs/medusa';
import { EditWebhookReq } from '../../../validators';
import { WebhookService } from '../../../../services';

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const validated = await validator(EditWebhookReq, req.body);

  const webhookService = req.scope.resolve<WebhookService>('webhookService');

  const subscription = await webhookService.updateWebhookSubscription(req.params.id, validated);

  res.status(200).json({ subscription });
};

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const webhookService = req.scope.resolve<WebhookService>('webhookService');

  console.log('DELETE', req.params.id);

  const subscription = await webhookService.deleteWebhookSubscription(req.params.id);

  res.status(200).json({ subscription });
}
