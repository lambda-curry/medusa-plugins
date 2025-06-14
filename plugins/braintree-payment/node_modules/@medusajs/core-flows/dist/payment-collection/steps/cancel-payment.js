"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelPaymentStep = exports.cancelPaymentStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.cancelPaymentStepId = "cancel-payment";
/**
 * This step cancels one or more authorized payments.
 */
exports.cancelPaymentStep = (0, workflows_sdk_1.createStep)(exports.cancelPaymentStepId, async (input, { container }) => {
    const { ids = [] } = input;
    const deleted = [];
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const service = container.resolve(utils_1.Modules.PAYMENT);
    if (!ids?.length) {
        return new workflows_sdk_1.StepResponse([], null);
    }
    const promises = [];
    for (const id of ids) {
        const promise = service
            .cancelPayment(id)
            .then((res) => {
            deleted.push(id);
        })
            .catch((e) => {
            logger.error(`Encountered an error when trying to cancel a payment - ${id} - ${e}`);
        });
        promises.push(promise);
    }
    await (0, utils_1.promiseAll)(promises);
    return new workflows_sdk_1.StepResponse(deleted);
});
//# sourceMappingURL=cancel-payment.js.map