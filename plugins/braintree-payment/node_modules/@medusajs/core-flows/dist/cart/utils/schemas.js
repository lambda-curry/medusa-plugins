"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pricingContextResult = void 0;
const zod_1 = __importDefault(require("zod"));
exports.pricingContextResult = zod_1.default.record(zod_1.default.string(), zod_1.default.any()).optional();
//# sourceMappingURL=schemas.js.map