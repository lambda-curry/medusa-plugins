import { z } from "zod";
export type AdminGetUploadParamsType = z.infer<typeof AdminGetUploadParams>;
export declare const AdminGetUploadParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const AdminUploadPreSignedUrl: z.ZodObject<{
    originalname: z.ZodString;
    mime_type: z.ZodString;
    size: z.ZodNumber;
    access: z.ZodOptional<z.ZodEnum<["public", "private"]>>;
}, "strip", z.ZodTypeAny, {
    originalname: string;
    size: number;
    mime_type: string;
    access?: "private" | "public" | undefined;
}, {
    originalname: string;
    size: number;
    mime_type: string;
    access?: "private" | "public" | undefined;
}>;
export type AdminUploadPreSignedUrlType = z.infer<typeof AdminUploadPreSignedUrl>;
//# sourceMappingURL=validators.d.ts.map