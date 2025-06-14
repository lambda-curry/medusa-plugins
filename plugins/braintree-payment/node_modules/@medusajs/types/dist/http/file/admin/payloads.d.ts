import { BaseUploadFile } from "../common";
export type AdminUploadFile = BaseUploadFile;
export interface AdminUploadPreSignedUrlRequest {
    /**
     * The original name of the file on the user's computer (aka clientName)
     */
    originalname: string;
    /**
     * The mime type of the file.
     */
    mime_type: string;
    /**
     * The size of the file in bytes.
     */
    size: number;
    /**
     * The access level of the file.
     */
    access?: "public" | "private";
}
//# sourceMappingURL=payloads.d.ts.map