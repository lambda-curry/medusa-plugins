import {
  type MiddlewareRoute,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http";
import { z } from "zod";

const webhookBaseSchema = {
  event_type: z.string(),
  active: z.boolean().default(true),
  target_url: z.string().url(),
};

export const createWebhookDTOSchema = z.object(webhookBaseSchema);

export const updateWebhookDTOSchema = z.object({
  id: z.string(),
  ...webhookBaseSchema,
});

export const adminWebhooksRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/webhooks",
    method: "POST",
    middlewares: [validateAndTransformBody(createWebhookDTOSchema)],
  },
  {
    matcher: "/admin/webhooks/:id",
    method: "PUT",
    middlewares: [validateAndTransformBody(updateWebhookDTOSchema)],
  },
];
