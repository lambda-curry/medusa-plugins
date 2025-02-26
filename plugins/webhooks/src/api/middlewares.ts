import { defineMiddlewares } from "@medusajs/medusa";
import { adminWebhooksRoutesMiddlewares } from "./admin/webhooks/middlewares";

export default defineMiddlewares({
  routes: [...adminWebhooksRoutesMiddlewares],
});
