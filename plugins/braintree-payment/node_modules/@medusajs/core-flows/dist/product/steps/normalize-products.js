"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCsvStep = exports.normalizeCsvStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_2 = require("../utils");
exports.normalizeCsvStepId = "normalize-product-csv";
/**
 * This step parses a CSV file holding products to import, returning the products as
 * objects that can be imported.
 *
 * @example
 * const data = parseProductCsvStep("products.csv")
 */
exports.normalizeCsvStep = (0, workflows_sdk_1.createStep)(exports.normalizeCsvStepId, async (fileContent) => {
    const csvProducts = (0, utils_2.convertCsvToJson)(fileContent);
    const normalizer = new utils_1.CSVNormalizer(csvProducts);
    const products = normalizer.proccess();
    const create = Object.keys(products.toCreate).reduce((result, toCreateHandle) => {
        result.push(utils_1.productValidators.CreateProduct.parse(products.toCreate[toCreateHandle]));
        return result;
    }, []);
    const update = Object.keys(products.toUpdate).reduce((result, toUpdateId) => {
        result.push(utils_1.productValidators.UpdateProduct.parse(products.toUpdate[toUpdateId]));
        return result;
    }, []);
    return new workflows_sdk_1.StepResponse({
        create,
        update,
    });
});
//# sourceMappingURL=normalize-products.js.map