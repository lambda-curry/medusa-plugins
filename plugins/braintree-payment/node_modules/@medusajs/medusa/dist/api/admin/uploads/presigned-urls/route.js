"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const ulid_1 = require("ulid");
const util_1 = require("util");
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    const fileProvider = req.scope.resolve(utils_1.Modules.FILE);
    let type;
    try {
        type = new util_1.MIMEType(req.validatedBody.mime_type);
    }
    catch {
        throw new utils_1.MedusaError(utils_1.MedusaErrorTypes.INVALID_DATA, `Invalid file type "${req.validatedBody.mime_type}"`, utils_1.MedusaErrorTypes.INVALID_DATA);
    }
    const extension = type.subtype;
    const uniqueFilename = `${(0, ulid_1.ulid)()}.${extension}`;
    const response = await fileProvider.getUploadFileUrls({
        filename: uniqueFilename,
        mimeType: req.validatedBody.mime_type,
        access: req.validatedBody.access ?? "private",
    });
    res.json({
        url: response.url,
        filename: response.key,
        mime_type: type.toString(),
        size: req.validatedBody.size,
        extension,
        originalname: req.validatedBody.originalname,
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map