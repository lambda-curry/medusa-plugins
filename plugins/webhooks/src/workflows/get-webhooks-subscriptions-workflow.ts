import { WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createWorkflow } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";

import {
  GetWebhooksSubscriptionsInput,
  GetWebhooksSubscriptionsOutput,
} from "../types/workflow";

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

    return new WorkflowResponse({ results: subscriptionsResult.data });
  }
);
