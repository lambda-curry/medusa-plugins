import {
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { createWorkflow } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";

import {
  GetWebhooksSubscriptionsInput,
  GetWebhooksSubscriptionsOutput,
} from "../types/workflow";
import { processWebhooksStep } from "./steps/process-webhooks-step";

export const getWebhooksSubscriptionsWorkflow = createWorkflow<
  GetWebhooksSubscriptionsInput,
  GetWebhooksSubscriptionsOutput,
  [{ eventName: string; eventData: Record<string, unknown> }]
>(
  "get-webhooks-subscriptions-workflow",
  (
    input
  ): WorkflowResponse<
    GetWebhooksSubscriptionsOutput,
    [{ eventName: string; eventData: Record<string, unknown> }]
  > => {
    const subscriptionsResult = useQueryGraphStep({
      entity: "webhooks",
      filters: {
        event_type: input.eventName,
        active: true,
      },
      fields: ["*"],
    });

    const processedWebhooks = processWebhooksStep({
      webhooks: subscriptionsResult.data,
      eventData: input.eventData,
    });

    return new WorkflowResponse({ results: processedWebhooks });
  }
);
