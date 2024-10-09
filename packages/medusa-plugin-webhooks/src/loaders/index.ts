import { AwilixContainer } from "awilix";
import { Logger } from "@medusajs/medusa";
import { WebhookServiceInitializeOptions } from "../migrations/run-migration";
import { runMigrations } from "../migrations/run-migration";
import WebhookService from "../services/webhook";

export default async (
  container: AwilixContainer,
  options: WebhookServiceInitializeOptions = {}
): Promise<void> => {
  const logger: Logger = container.resolve("logger");

  try {
    const webhookService: WebhookService = container.resolve("webhookService");

    await runMigrations({ options, logger });

    logger.info("Webhooks plugin initialized");
  } catch (error) {
    logger.error("Failed to initialize webhooks plugin", error);
    throw error;
  }
};
