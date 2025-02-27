import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import WebhooksService from "../../../../modules/webhooks/service";
import { WebhookModel } from "../../../../common";

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const webhookService = req.scope.resolve<WebhooksService>("webhooks");

  const response = await webhookService.testWebhookSubscription(
    req.body as WebhookModel
  );

  res.status(200).json({ response });
}
