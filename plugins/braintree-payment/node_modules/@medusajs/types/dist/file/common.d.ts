/**
 * The access level of the file.
 */
export type FileAccessPermission = "public" | "private";
/**
 * The File details.
 */
export interface FileDTO {
    /**
     * The ID of the file. You can use this ID later to
     * retrieve or delete the file.
     */
    id: string;
    /**
     * The URL of the file.
     */
    url: string;
}
/**
 * @interface
 *
 * Filters to apply on a currency.
 */
export interface FilterableFileProps {
    /**
     * The file ID to filter by.
     */
    id?: string;
}
export interface UploadFileUrlDTO {
    /**
     * The URL of the file.
     */
    url: string;
    /**
     * The file's key allowing you to later
     * identify the file in the third-party
     * system. For example, the S3 Module Provider
     * returns the file's key in S3, whereas the
     * Local File Module Provider returns the file's
     * path.
     */
    key: string;
}
//# sourceMappingURL=common.d.ts.map