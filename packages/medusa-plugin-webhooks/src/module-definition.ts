import { ModuleExports } from "@medusajs/modules-sdk";
import { Webhook } from "./models/webhook";
import WebhookService from "./services/webhook";
import { runMigrations, revertMigration } from "./migrations/run-migration";

export const moduleDefinition: ModuleExports = {
  service: WebhookService,
  models: [Webhook],
  migrations: [runMigrations, revertMigration],
};
