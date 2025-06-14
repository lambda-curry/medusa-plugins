"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const _types_1 = require("../types");
class FileProviderService {
    constructor(container) {
        const fileProviderKeys = Object.keys(container).filter((k) => k.startsWith(_types_1.FileProviderRegistrationPrefix));
        if (fileProviderKeys.length !== 1) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `File module should be initialized with exactly one provider`);
        }
        this.fileProvider_ = container[fileProviderKeys[0]];
    }
    static getRegistrationIdentifier(providerClass, optionName) {
        return `${providerClass.identifier}_${optionName}`;
    }
    upload(file) {
        return this.fileProvider_.upload(file);
    }
    delete(fileData) {
        return this.fileProvider_.delete(fileData);
    }
    getPresignedDownloadUrl(fileData) {
        return this.fileProvider_.getPresignedDownloadUrl(fileData);
    }
    getPresignedUploadUrl(fileData) {
        if (!this.fileProvider_.getPresignedUploadUrl) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Provider does not support presigned upload URLs");
        }
        if (!fileData.filename) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "File name is required to get a presigned upload URL");
        }
        return this.fileProvider_.getPresignedUploadUrl(fileData);
    }
    getDownloadStream(fileData) {
        return this.fileProvider_.getDownloadStream(fileData);
    }
    getAsBuffer(fileData) {
        return this.fileProvider_.getAsBuffer(fileData);
    }
}
exports.default = FileProviderService;
//# sourceMappingURL=file-provider-service.js.map