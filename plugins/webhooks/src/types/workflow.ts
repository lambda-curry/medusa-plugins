import { WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { WebhookSendResponse } from "../modules/webhooks/service";

export type GetWebhooksSubscriptionsInput = {
  eventName: string;
  eventData: Record<string, unknown>;
};

export type GetWebhooksSubscriptionsOutput = {
  results: WebhookSendResponse[];
};

export type GetWebhooksSubscriptionsWorkflow = {
  input: GetWebhooksSubscriptionsInput;
  output: GetWebhooksSubscriptionsOutput;
};
