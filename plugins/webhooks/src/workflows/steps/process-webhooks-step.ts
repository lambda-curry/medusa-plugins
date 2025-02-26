import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";
import { WebhookModel } from "../../common";
import WebhooksService from "../../modules/webhooks/service";

type ProcessWebhooksStepInput = {
  webhooks: WebhookModel[];
  eventData: Record<string, unknown>;
};

export const processWebhooksStepId = "process-webhooks";

export const processWebhooksStep = createStep(
  processWebhooksStepId,
  async (data: ProcessWebhooksStepInput, { container }) => {
    const webhooksService = container.resolve<WebhooksService>("webhooks");

    const results = await webhooksService.sendWebhooksEvents(
      data.webhooks,
      data.eventData
    );

    return new StepResponse(results);
  }
);
