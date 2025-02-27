import { WebhookService } from "../modules/webhooks/service";
import { GetWebhooksSubscriptionsWorkflow } from "./workflow";

export type WebhooksModuleService = WebhookService;

export type { GetWebhooksSubscriptionsWorkflow };

// Export workflow types for plugin consumers
export * from "./workflow";
