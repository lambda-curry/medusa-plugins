import { FileTypes, LocalFileServiceOptions } from "@medusajs/framework/types";
import { AbstractFileProviderService } from "@medusajs/framework/utils";
import type { Readable } from "stream";
export declare class LocalFileService extends AbstractFileProviderService {
    static identifier: string;
    protected uploadDir_: string;
    protected privateUploadDir_: string;
    protected backendUrl_: string;
    constructor(_: any, options: LocalFileServiceOptions);
    upload(file: FileTypes.ProviderUploadFileDTO): Promise<FileTypes.ProviderFileResultDTO>;
    delete(file: FileTypes.ProviderDeleteFileDTO): Promise<void>;
    getDownloadStream(file: FileTypes.ProviderGetFileDTO): Promise<Readable>;
    getAsBuffer(file: FileTypes.ProviderGetFileDTO): Promise<Buffer>;
    getPresignedDownloadUrl(file: FileTypes.ProviderGetFileDTO): Promise<string>;
    /**
     * Returns the pre-signed URL that the client (frontend) can use to trigger
     * a file upload. In this case, the Medusa backend will implement the
     * "/upload" endpoint to perform the file upload.
     *
     * Since, we do not want the client to perform link detection on the frontend
     * and then prepare a different kind of request for cloud providers and different
     * request for the local server, we will have to make these URLs self sufficient.
     *
     * What is a self sufficient URL
     *
     * - There should be no need to specify the MIME type or filename separately in request body (cloud providers don't allow it).
     * - There should be no need to pass auth headers like cookies. Again cloud providers
     *   won't allow it and will likely result in a CORS error.
     */
    getPresignedUploadUrl(fileData: FileTypes.ProviderGetPresignedUploadUrlDTO): Promise<FileTypes.ProviderFileResultDTO>;
    private getUploadFilePath;
    private getUploadFileUrl;
    private ensureDirExists;
}
//# sourceMappingURL=local-file.d.ts.map