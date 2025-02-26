import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import WebhooksService from "../../../../modules/webhooks/service";
import { EventOptions } from "../../../../common";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const webhooksModule = req.scope.resolve<WebhooksService>("webhooks");

  const options: EventOptions[] = [];

  if (webhooksModule.subscriptions) {
    options.push({
      label: "Custom",
      options: webhooksModule.subscriptions.map((subscription) => ({
        label: subscription,
        value: subscription,
      })),
    });
  }

  res.status(200).json({ options });
};
