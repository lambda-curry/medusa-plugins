import type { Readable } from "stream";
import { Context, CreateFileDTO, GetUploadFileUrlDTO, FileDTO, UploadFileUrlDTO, FileTypes, FilterableFileProps, FindConfig, ModuleJoinerConfig } from "@medusajs/framework/types";
import FileProviderService from "./file-provider-service";
type InjectedDependencies = {
    fileProviderService: FileProviderService;
};
export default class FileModuleService implements FileTypes.IFileModuleService {
    protected readonly fileProviderService_: FileProviderService;
    constructor({ fileProviderService }: InjectedDependencies);
    __joinerConfig(): ModuleJoinerConfig;
    getProvider(): FileProviderService;
    createFiles(data: CreateFileDTO[], sharedContext?: Context): Promise<FileDTO[]>;
    createFiles(data: CreateFileDTO, sharedContext?: Context): Promise<FileDTO>;
    getUploadFileUrls(data: GetUploadFileUrlDTO[], sharedContext?: Context): Promise<UploadFileUrlDTO[]>;
    getUploadFileUrls(data: GetUploadFileUrlDTO, sharedContext?: Context): Promise<UploadFileUrlDTO>;
    deleteFiles(ids: string[], sharedContext?: Context): Promise<void>;
    deleteFiles(id: string, sharedContext?: Context): Promise<void>;
    retrieveFile(id: string): Promise<FileDTO>;
    listFiles(filters?: FilterableFileProps, config?: FindConfig<FileDTO>, sharedContext?: Context): Promise<FileDTO[]>;
    listAndCountFiles(filters?: FilterableFileProps, config?: FindConfig<FileDTO>, sharedContext?: Context): Promise<[FileDTO[], number]>;
    /**
     * Get the file contents as a readable stream.
     *
     * @example
     * const stream = await fileModuleService.getAsStream("file_123")
     * writeable.pipe(stream)
     */
    getDownloadStream(id: string): Promise<Readable>;
    /**
     * Get the file contents as a Node.js Buffer
     *
     * @example
     * const contents = await fileModuleService.getAsBuffer("file_123")
     * contents.toString('utf-8')
     */
    getAsBuffer(id: string): Promise<Buffer>;
}
export {};
//# sourceMappingURL=file-module-service.d.ts.map