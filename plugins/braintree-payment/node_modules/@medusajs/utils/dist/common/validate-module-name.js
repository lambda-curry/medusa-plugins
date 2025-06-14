"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateModuleName = validateModuleName;
/**
 * Validates the module name to be variable safe. Since we generate
 * a lot of code, types under the hood using the module name we
 * have ensure that each module name is variable safe.
 *
 * Ofcourse, we can transform the module name to a variable safe value,
 * but that might result into naming conflicts. For example: There are
 * two module named as
 *
 * - sanity-products
 * - sanity_products
 *
 * After transforming them, they will endup with the same output. This is
 * a very simple example, but cases like these will lead to naming
 * conflicts, so its better to use the names as it is and restrict
 * them to be variable safe
 */
const RE = /^[a-zA-Z_][0-9a-zA-Z_]*$/;
function validateModuleName(name) {
    if (!RE.test(name)) {
        throw new Error(`Invalid module name "${name}". Module names must be alpha numeric and may contain an underscore`);
    }
}
//# sourceMappingURL=validate-module-name.js.map