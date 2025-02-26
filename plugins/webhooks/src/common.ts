import type { InferTypeOf } from "@medusajs/framework/types";
import type { Webhook } from "./modules/webhooks/models/webhooks";

export type WebhookModel = InferTypeOf<typeof Webhook>;

export interface EventOption {
  label: string;
  value: string;
}

export interface EventOptions {
  label: string;
  options: EventOption[];
}
