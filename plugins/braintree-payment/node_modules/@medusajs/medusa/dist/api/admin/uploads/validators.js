"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUploadPreSignedUrl = exports.AdminGetUploadParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
exports.AdminGetUploadParams = (0, validators_1.createSelectParams)();
exports.AdminUploadPreSignedUrl = zod_1.z.object({
    originalname: zod_1.z.string(),
    mime_type: zod_1.z.string(),
    size: zod_1.z.number(),
    access: zod_1.z.enum(["public", "private"]).optional(),
});
//# sourceMappingURL=validators.js.map