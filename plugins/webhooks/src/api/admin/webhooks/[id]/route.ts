import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import WebhooksService from "../../../../modules/webhooks/service";
export async function PUT(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const webhookService = req.scope.resolve<WebhooksService>("webhooks");
  const subscription = await webhookService.updateWebhooks(req.body);

  res.status(200).json({ subscription });
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const webhookService = req.scope.resolve<WebhooksService>("webhooks");

  const subscription = await webhookService.deleteWebhooks(req.params.id);

  res.status(200).json({ subscription });
}
