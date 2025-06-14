import { HttpTypes } from "@medusajs/framework/types";
/**
 * The CSV file content to parse.
 */
export type NormalizeProductCsvStepInput = string;
export declare const normalizeCsvStepId = "normalize-product-csv";
/**
 * This step parses a CSV file holding products to import, returning the products as
 * objects that can be imported.
 *
 * @example
 * const data = parseProductCsvStep("products.csv")
 */
export declare const normalizeCsvStep: import("@medusajs/framework/workflows-sdk").StepFunction<string, {
    create: HttpTypes.AdminCreateProduct[];
    update: HttpTypes.AdminUpdateProduct & {
        id: string;
    }[];
}>;
//# sourceMappingURL=normalize-products.d.ts.map