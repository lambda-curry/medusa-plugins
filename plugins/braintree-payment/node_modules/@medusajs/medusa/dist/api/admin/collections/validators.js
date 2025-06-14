"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdateCollection = exports.UpdateCollection = exports.AdminCreateCollection = exports.CreateCollection = exports.AdminGetCollectionsParams = exports.AdminGetCollectionsParamsFields = exports.AdminGetCollectionParams = void 0;
const zod_1 = require("zod");
const common_validators_1 = require("../../utils/common-validators");
const validators_1 = require("../../utils/validators");
exports.AdminGetCollectionParams = (0, validators_1.createSelectParams)();
exports.AdminGetCollectionsParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    title: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    handle: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.AdminGetCollectionsParams = (0, validators_1.createFindParams)({
    offset: 0,
    limit: 10,
})
    .merge(exports.AdminGetCollectionsParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetCollectionsParamsFields));
exports.CreateCollection = zod_1.z.object({
    title: zod_1.z.string(),
    handle: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
exports.AdminCreateCollection = (0, validators_1.WithAdditionalData)(exports.CreateCollection);
exports.UpdateCollection = zod_1.z.object({
    title: zod_1.z.string().optional(),
    handle: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
exports.AdminUpdateCollection = (0, validators_1.WithAdditionalData)(exports.UpdateCollection);
//# sourceMappingURL=validators.js.map