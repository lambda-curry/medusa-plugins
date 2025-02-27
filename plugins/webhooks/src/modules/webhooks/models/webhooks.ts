import { model } from "@medusajs/framework/utils";

export const Webhook = model.define("webhook", {
  id: model
    .id({
      prefix: "wh",
    })
    .primaryKey(),
  event_type: model.text(),
  active: model.boolean().default(true),
  target_url: model.text(),
});
