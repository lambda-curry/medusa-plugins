import WebhookService from "./services/webhook";
import { ModuleExports } from "@medusajs/types";
import { Webhook } from "./models/webhook";
import { ModulesSdkUtils } from "@medusajs/utils";
import { initialize } from "./initialize";
import loadPlugin from "./loaders";

const migrationScriptOptions = {
  moduleName: WebhookService.name,
  models: [Webhook],
  pathToMigrations: __dirname + "/migrations",
};

export const runMigrations = ModulesSdkUtils.buildMigrationScript(
  migrationScriptOptions
);
export const revertMigration = ModulesSdkUtils.buildRevertMigrationScript(
  migrationScriptOptions
);

const service = WebhookService;

export const moduleDefinition: ModuleExports = {
  service,
  runMigrations,
  revertMigration,
};

export { initialize };
export * from "./models/webhook";
export * from "./services/webhook";
export default loadPlugin;
