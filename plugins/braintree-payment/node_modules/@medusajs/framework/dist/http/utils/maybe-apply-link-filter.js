"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeApplyLinkFilter = maybeApplyLinkFilter;
const utils_1 = require("@medusajs/utils");
function maybeApplyLinkFilter({ entryPoint, resourceId, filterableField, filterByField = "id", }) {
    return async function linkFilter(req, _, next) {
        const filterableFields = req.filterableFields;
        if (!filterableFields?.[filterableField]) {
            return next();
        }
        const filterFields = filterableFields[filterableField];
        const idsToFilterBy = Array.isArray(filterFields)
            ? filterFields
            : [filterFields];
        delete filterableFields[filterableField];
        let existingFilters = filterableFields[filterByField];
        const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
        const filters = {
            [filterableField]: idsToFilterBy,
        };
        if (existingFilters) {
            filters[resourceId] = existingFilters;
        }
        const { data: resources } = await query.graph({
            entity: entryPoint,
            fields: [resourceId],
            filters,
        });
        filterableFields[filterByField] = resources.map((p) => p[resourceId]);
        req.filterableFields = transformFilterableFields(filterableFields);
        return next();
    };
}
/*
  Transforms an object key string into nested objects
  before = {
    "test.something.another": []
  }

  after = {
    test: {
      something: {
        another: []
      }
    }
  }
*/
function transformFilterableFields(filterableFields) {
    const result = {};
    for (const key of Object.keys(filterableFields)) {
        const value = filterableFields[key];
        const keys = key.split(".");
        let current = result;
        // Iterate over the keys, creating nested objects as needed
        for (let i = 0; i < keys.length; i++) {
            const part = keys[i];
            current[part] ??= {};
            if (i === keys.length - 1) {
                // If its the last key, assign the value
                current[part] = value;
                break;
            }
            current = current[part];
        }
    }
    return result;
}
//# sourceMappingURL=maybe-apply-link-filter.js.map