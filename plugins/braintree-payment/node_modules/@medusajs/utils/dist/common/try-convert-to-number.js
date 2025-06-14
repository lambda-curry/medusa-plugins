"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryConvertToNumber = tryConvertToNumber;
function tryConvertToNumber(value, defaultValue) {
    const transformedValue = Number(value);
    return Number.isNaN(transformedValue)
        ? defaultValue ?? undefined
        : transformedValue;
}
//# sourceMappingURL=try-convert-to-number.js.map