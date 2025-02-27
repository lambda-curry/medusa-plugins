import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import WebhooksService from "../../../modules/webhooks/service";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const params = req.query;
  const webhookService = req.scope.resolve<WebhooksService>("webhooks");

  const limit = params.limit ? parseInt(params.limit as string) : 10;
  const offset = params.offset ? parseInt(params.offset as string) : 0;

  const [subscriptions, count] = await webhookService.listAndCountWebhooks(
    {},
    {
      take: limit,
      skip: offset,
    }
  );

  return res.json({
    subscriptions,
    count,
    limit,
    offset,
  });
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const webhookService = req.scope.resolve<WebhooksService>("webhooks");

  const subscription = await webhookService.createWebhooks(req.body);

  return res.json({ subscription });
}
