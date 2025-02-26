import {
  type WorkflowData,
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk";
import { WebhookModel } from "../common";
import { processWebhooksStep } from "./steps/process-webhooks-step";

type SendWebhooksEventsInput = {
  webhooks: WebhookModel[];
  eventData: Record<string, unknown>;
};

export const sendWebhooksEventsWorkflowId = "send-webhooks-events-workflow";

export const sendWebhooksEventsWorkflow = createWorkflow(
  sendWebhooksEventsWorkflowId,
  (input: WorkflowData<SendWebhooksEventsInput>) => {
    const result = processWebhooksStep({
      webhooks: input.webhooks,
      eventData: input.eventData,
    });

    return new WorkflowResponse(result);
  }
);
