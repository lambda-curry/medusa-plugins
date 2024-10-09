import {
  InternalModuleDeclaration,
  LoaderOptions,
} from "@medusajs/modules-sdk";
import { DataSource, DataSourceOptions } from "typeorm";
import { DatabaseType } from "typeorm";
import migrations from "./index";

export type WebhookServiceInitializeOptions = {
  database?: {
    type?: DatabaseType | string;
    url?: string;
    database?: string;
    extra?: Record<string, any>;
    schema?: string;
    logging?: boolean;
  };
};

function getDataSource(
  dbData: WebhookServiceInitializeOptions["database"]
): DataSource {
  return new DataSource({
    type: dbData!.type,
    url: dbData!.url,
    database: dbData!.database,
    extra: dbData!.extra || {},
    migrations: migrations,
    schema: dbData!.schema,
    logging: dbData!.logging,
  } as DataSourceOptions);
}

export async function runMigrations(
  { options, logger }: Omit<LoaderOptions, "container">,
  moduleDeclaration?: InternalModuleDeclaration
) {
  const dbData =
    options?.database as WebhookServiceInitializeOptions["database"];

  try {
    const dataSource = getDataSource(dbData);
    await dataSource.initialize();
    await dataSource.runMigrations();
    await dataSource.destroy();

    logger?.info("Webhook module migration executed");
  } catch (error) {
    logger?.error(`Webhook module migration failed to run - Error: ${error}`);
  }
}

export async function revertMigration(
  { options, logger }: Omit<LoaderOptions, "container">,
  moduleDeclaration?: InternalModuleDeclaration
) {
  const dbData =
    options?.database as WebhookServiceInitializeOptions["database"];

  try {
    const dataSource = getDataSource(dbData);
    await dataSource.initialize();
    await dataSource.undoLastMigration();
    await dataSource.destroy();

    logger?.info("Webhook module migration reverted");
  } catch (error) {
    logger?.error(
      `Webhook module migration failed to revert - Error: ${error}`
    );
  }
}
