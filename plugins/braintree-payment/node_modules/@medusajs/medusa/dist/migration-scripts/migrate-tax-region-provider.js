"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = assignTaxSystemProviderToTaxRegions;
const core_flows_1 = require("@medusajs/core-flows");
const modules_sdk_1 = require("@medusajs/framework/modules-sdk");
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const assignSystemProviderToTaxRegionsWorkflow = (0, workflows_sdk_1.createWorkflow)("assign-system-provider-to-tax-regions", () => {
    const { data: taxRegions } = (0, core_flows_1.useQueryGraphStep)({
        entity: "tax_region",
        fields: ["id", "provider_id", "province_code"],
    });
    const updateData = (0, workflows_sdk_1.transform)({ taxRegions }, ({ taxRegions }) => {
        /**
         * Update only parent regions that don't have a provider set.
         */
        return taxRegions
            .filter((taxRegion) => !taxRegion.province_code && !taxRegion.provider_id)
            .map((taxRegion) => ({
            id: taxRegion.id,
            provider_id: "tp_system",
        }));
    });
    (0, core_flows_1.updateTaxRegionsStep)(updateData);
    return new workflows_sdk_1.WorkflowResponse(void 0);
});
async function assignTaxSystemProviderToTaxRegions({ container, }) {
    if (!modules_sdk_1.MedusaModule.isInstalled(utils_1.Modules.TAX)) {
        return;
    }
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    logger.info("Assigning tax system provider to tax regions");
    try {
        await assignSystemProviderToTaxRegionsWorkflow(container).run();
        logger.info("System provider assigned to tax regions");
    }
    catch (e) {
        logger.error(e);
        throw e;
    }
}
//# sourceMappingURL=migrate-tax-region-provider.js.map