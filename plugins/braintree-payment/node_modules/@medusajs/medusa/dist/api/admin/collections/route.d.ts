import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdditionalData, HttpTypes } from "@medusajs/framework/types";
import { AdminCreateCollectionType } from "./validators";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminCollectionListParams>, res: MedusaResponse<HttpTypes.AdminCollectionListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminCreateCollectionType & AdditionalData>, res: MedusaResponse<HttpTypes.AdminCollectionResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map