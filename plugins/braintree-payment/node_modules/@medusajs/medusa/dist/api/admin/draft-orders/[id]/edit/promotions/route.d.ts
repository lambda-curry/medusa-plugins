import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { HttpTypes } from "@medusajs/types";
import { AdminAddDraftOrderPromotionsType, AdminRemoveDraftOrderPromotionsType } from "../../../validators";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminAddDraftOrderPromotionsType>, res: MedusaResponse<HttpTypes.AdminDraftOrderPreviewResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest<AdminRemoveDraftOrderPromotionsType>, res: MedusaResponse<HttpTypes.AdminDraftOrderPreviewResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map