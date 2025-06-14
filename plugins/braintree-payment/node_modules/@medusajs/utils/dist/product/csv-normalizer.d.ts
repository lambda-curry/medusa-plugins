import { AdminCreateProduct } from "@medusajs/types";
/**
 * CSV normalizer processes all the allowed columns from a CSV file and remaps
 * them into a new object with properties matching the "AdminCreateProduct".
 *
 * However, further validations must be performed to validate the format and
 * the required fields in the normalized output.
 */
export declare class CSVNormalizer {
    #private;
    constructor(rows: Record<string, string | boolean | number>[]);
    /**
     * Process CSV rows. The return value is a tree of products
     */
    proccess(): {
        toCreate: {
            [handle: string]: { [K in keyof AdminCreateProduct]?: any; };
        };
        toUpdate: {
            [id: string]: { [K in keyof AdminCreateProduct]?: any; };
        };
    };
}
//# sourceMappingURL=csv-normalizer.d.ts.map