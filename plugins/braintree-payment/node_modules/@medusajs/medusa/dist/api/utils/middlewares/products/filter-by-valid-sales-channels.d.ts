import { MedusaStoreRequest } from "@medusajs/framework/http";
import { NextFunction } from "express";
/**
 * Transforms and validates the sales channel ids
 * @param req
 * @returns The transformed and validated sales channel ids
 */
export declare function transformAndValidateSalesChannelIds(req: MedusaStoreRequest): string[];
export declare function filterByValidSalesChannels(): (req: MedusaStoreRequest, _: any, next: NextFunction) => Promise<void>;
//# sourceMappingURL=filter-by-valid-sales-channels.d.ts.map