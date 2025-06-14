"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenObjectToKeyValuePairs = flattenObjectToKeyValuePairs;
const is_object_1 = require("./is-object");
/*
  Given a deeply nested object that can be arrays or objects, this function will flatten
  it to an object that is 1 level deep.

  Given an object: testObject = {
    product: {
      id: "test-product",
      name: "Test Product",
      categories: [{
        id: "test-category",
        name: "Test Category"
      }]
    }
  }

  flattenObjectToKeyValuePairs(testObject) will return

  {
    "product.id": "test-product",
    "product.name": "Test Product",
    "product.categories.id": ["test-category"],
    "product.categories.name": ["Test Category"]
  }

  Null and undefined values are excluded from the result.
*/
function flattenObjectToKeyValuePairs(obj) {
    const result = {};
    function shouldPreserveArray(value, path) {
        if (!Array.isArray(value) || value.length === 0) {
            return false;
        }
        if (value.some((item) => (0, is_object_1.isObject)(item) && !Array.isArray(item))) {
            return true;
        }
        if (value.some((item) => Array.isArray(item))) {
            return true;
        }
        if (path.length > 1) {
            return true;
        }
        if (value.length > 1) {
            const firstType = typeof value[0];
            const allSameType = value.every((item) => typeof item === firstType && !(0, is_object_1.isObject)(item) && !Array.isArray(item));
            if (allSameType) {
                return true;
            }
        }
        return false;
    }
    /**
     * Normalize array values - unwrap single-item arrays and handle empty arrays
     */
    function normalizeArrayValue(value, path) {
        if (!Array.isArray(value)) {
            return value;
        }
        if (value.length === 1 &&
            Array.isArray(value[0]) &&
            value[0].length === 0) {
            return [];
        }
        if (shouldPreserveArray(value, path)) {
            return value;
        }
        if (value.length === 1 && !(0, is_object_1.isObject)(value[0]) && !Array.isArray(value[0])) {
            return value[0];
        }
        return value;
    }
    /**
     * Recursively process an object/array and flatten it
     */
    function processPath(value, currentPath = []) {
        // Handle null, undefined, or primitive values
        if (!value || typeof value !== "object") {
            if (value !== null && value !== undefined && currentPath.length > 0) {
                result[currentPath.join(".")] = value;
            }
            return;
        }
        if (Array.isArray(value)) {
            if (value.length === 0) {
                if (currentPath.length > 0) {
                    result[currentPath.join(".")] = [];
                }
                return;
            }
            if (value.some((item) => (0, is_object_1.isObject)(item) && !Array.isArray(item))) {
                extractPropertiesFromArray(value, currentPath);
            }
            else if (value.some((item) => Array.isArray(item))) {
                const allValues = [];
                const flattenedObjects = [];
                const flattenArray = (arr, collector = []) => {
                    arr.forEach((item) => {
                        if (Array.isArray(item)) {
                            flattenArray(item, collector);
                        }
                        else if ((0, is_object_1.isObject)(item)) {
                            collector.push(item);
                        }
                        else if (item !== null && item !== undefined) {
                            allValues.push(item);
                        }
                    });
                };
                flattenArray(value, flattenedObjects);
                if (flattenedObjects.length > 0) {
                    extractPropertiesFromArray(flattenedObjects, currentPath);
                }
                else if (allValues.length > 0) {
                    result[currentPath.join(".")] = normalizeArrayValue(allValues, currentPath);
                }
            }
            else {
                const cleanedValues = value.filter((v) => v !== null && v !== undefined);
                if (cleanedValues.length > 0) {
                    result[currentPath.join(".")] = normalizeArrayValue(cleanedValues, currentPath);
                }
            }
            return;
        }
        Object.entries(value).forEach(([key, propValue]) => {
            const newPath = [...currentPath, key];
            if (propValue === null || propValue === undefined) {
                return;
            }
            else if (Array.isArray(propValue)) {
                if (propValue.length === 0) {
                    result[newPath.join(".")] = [];
                }
                else {
                    processPath(propValue, newPath);
                }
            }
            else if ((0, is_object_1.isObject)(propValue)) {
                processPath(propValue, newPath);
            }
            else {
                result[newPath.join(".")] = propValue;
            }
        });
    }
    /**
     * Extract all properties from an array of objects and store them
     */
    function extractPropertiesFromArray(array, basePath = []) {
        if (!array.length)
            return;
        // Collect all unique keys from all objects in the array
        const allKeys = new Set();
        array.forEach((item) => {
            if ((0, is_object_1.isObject)(item) && !Array.isArray(item)) {
                Object.keys(item).forEach((key) => allKeys.add(key));
            }
        });
        allKeys.forEach((key) => {
            const valuePath = [...basePath, key];
            const values = [];
            array.forEach((item) => {
                if ((0, is_object_1.isObject)(item) && !Array.isArray(item) && key in item) {
                    const itemValue = item[key];
                    if (itemValue !== null && itemValue !== undefined) {
                        values.push(itemValue);
                    }
                }
            });
            if (values.length === 0)
                return;
            if (values.every((v) => (0, is_object_1.isObject)(v) && !Array.isArray(v))) {
                extractNestedObjectProperties(values, valuePath);
            }
            else if (values.some((v) => Array.isArray(v))) {
                if (values.every((v) => Array.isArray(v) && v.length === 0)) {
                    result[valuePath.join(".")] = [];
                }
                else {
                    const flattenedArray = [];
                    for (const arrayValue of values) {
                        if (Array.isArray(arrayValue)) {
                            if (arrayValue.some((v) => (0, is_object_1.isObject)(v) && !Array.isArray(v))) {
                                extractPropertiesFromArray(arrayValue, valuePath);
                            }
                            else {
                                flattenedArray.push(...arrayValue);
                            }
                        }
                        else {
                            flattenedArray.push(arrayValue);
                        }
                    }
                    if (flattenedArray.length > 0 &&
                        !flattenedArray.some((v) => (0, is_object_1.isObject)(v) && !Array.isArray(v))) {
                        result[valuePath.join(".")] = normalizeArrayValue(flattenedArray, valuePath);
                    }
                }
            }
            else {
                result[valuePath.join(".")] = normalizeArrayValue(values, valuePath);
            }
        });
    }
    /**
     * Extract properties from nested objects and add them to the result
     */
    function extractNestedObjectProperties(objects, basePath = []) {
        if (!objects.length)
            return;
        // Collect all unique keys from all objects
        const allNestedKeys = new Set();
        objects.forEach((obj) => {
            if ((0, is_object_1.isObject)(obj) && !Array.isArray(obj)) {
                Object.keys(obj).forEach((key) => allNestedKeys.add(key));
            }
        });
        allNestedKeys.forEach((nestedKey) => {
            const nestedPath = [...basePath, nestedKey];
            const nestedValues = [];
            objects.forEach((obj) => {
                if ((0, is_object_1.isObject)(obj) && !Array.isArray(obj) && nestedKey in obj) {
                    const nestedValue = obj[nestedKey];
                    if (nestedValue !== null && nestedValue !== undefined) {
                        nestedValues.push(nestedValue);
                    }
                }
            });
            if (nestedValues.length === 0)
                return;
            if (nestedValues.every((v) => (0, is_object_1.isObject)(v) && !Array.isArray(v))) {
                extractNestedObjectProperties(nestedValues, nestedPath);
            }
            else if (nestedValues.some((v) => Array.isArray(v))) {
                if (nestedValues.every((v) => Array.isArray(v) && v.length === 0)) {
                    result[nestedPath.join(".")] = [];
                }
                else {
                    const allArrayItems = [];
                    for (const arrayValue of nestedValues) {
                        if (Array.isArray(arrayValue)) {
                            allArrayItems.push(...arrayValue);
                        }
                        else {
                            allArrayItems.push(arrayValue);
                        }
                    }
                    if (allArrayItems.some((item) => (0, is_object_1.isObject)(item) && !Array.isArray(item))) {
                        extractPropertiesFromArray(allArrayItems, nestedPath);
                    }
                    else {
                        result[nestedPath.join(".")] = normalizeArrayValue(allArrayItems, nestedPath);
                    }
                }
            }
            else {
                result[nestedPath.join(".")] = normalizeArrayValue(nestedValues, nestedPath);
            }
        });
    }
    processPath(obj);
    return result;
}
//# sourceMappingURL=flatten-object-to-key-value-pairs.js.map