"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGetTaxProvidersParams = exports.AdminGetTaxProvidersParamsFields = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.AdminGetTaxProvidersParamsFields = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    is_enabled: zod_1.z.boolean().optional(),
});
exports.AdminGetTaxProvidersParams = (0, validators_1.createFindParams)({
    limit: 20,
    offset: 0,
})
    .merge(exports.AdminGetTaxProvidersParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetTaxProvidersParamsFields));
//# sourceMappingURL=validators.js.map