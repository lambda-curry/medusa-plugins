"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const calculate_order_change_1 = require("../calculate-order-change");
calculate_order_change_1.OrderChangeProcessing.registerActionType(utils_1.ChangeActionType.PROMOTION_REMOVE, {
    operation({ action, currentOrder, options }) {
        // no-op
    },
    validate({ action }) {
        if (!action.reference_id) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Reference ID is required.");
        }
    },
});
//# sourceMappingURL=promotion-remove.js.map