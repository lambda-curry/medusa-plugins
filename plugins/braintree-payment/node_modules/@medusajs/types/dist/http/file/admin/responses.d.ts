import { DeleteResponse } from "../../common";
import { AdminFile } from "./entities";
export interface AdminFileResponse {
    /**
     * The file's details.
     */
    file: AdminFile;
}
export interface AdminFileListResponse {
    /**
     * The list of uploaded files.
     */
    files: AdminFile[];
}
export type AdminFileDeleteResponse = DeleteResponse<"file">;
export interface AdminUploadPreSignedUrlResponse {
    /**
     * The URL to be used for uploading the file
     */
    url: string;
    /**
     * The unique filename that can be used with the file provider
     * to fetch the file
     */
    filename: string;
    /**
     * The original name of the file on the user's computer (aka clientName)
     */
    originalname: string;
    /**
     * The mime type of the file.
     */
    mime_type: string;
    /**
     * Extension of the file to be uploaded
     */
    extension: string;
    /**
     * Size of the file to be uploaded (in bytes)
     */
    size: number;
}
//# sourceMappingURL=responses.d.ts.map