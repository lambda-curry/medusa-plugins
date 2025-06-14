"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryConvertToBoolean = tryConvertToBoolean;
function tryConvertToBoolean(value, defaultValue) {
    if (typeof value === "string") {
        const normalizedValue = value.toLowerCase();
        return normalizedValue === "true"
            ? true
            : normalizedValue === "false"
                ? false
                : defaultValue ?? undefined;
    }
    return defaultValue ?? undefined;
}
//# sourceMappingURL=try-convert-to-boolean.js.map