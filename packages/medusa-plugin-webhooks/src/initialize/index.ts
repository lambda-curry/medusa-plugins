import {
  ExternalModuleDeclaration,
  InternalModuleDeclaration,
  MedusaModule,
  MODULE_PACKAGE_NAMES,
  Modules,
} from "@medusajs/modules-sdk";
import { ModulesSdkTypes } from "@medusajs/types";

import { InitializeModuleInjectableDependencies } from "../types";
import { moduleDefinition } from "../module-definition";
import WebhookService from "../services/webhook";

export const initialize = async (
  options?:
    | ModulesSdkTypes.ModuleBootstrapDeclaration
    | ModulesSdkTypes.ModuleServiceInitializeOptions
    | ModulesSdkTypes.ModuleServiceInitializeCustomDataLayerOptions,
  injectedDependencies?: InitializeModuleInjectableDependencies
): Promise<WebhookService> => {
  const loaded = await MedusaModule.bootstrap<WebhookService>({
    moduleKey: "webhook",
    defaultPath: "@lambdacurry/medusa-plugin-webhooks",
    declaration: options as
      | InternalModuleDeclaration
      | ExternalModuleDeclaration,
    injectedDependencies,
    moduleExports: moduleDefinition,
  });

  return loaded["webhook"];
};
