"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectTransactionManager = InjectTransactionManager;
const context_parameter_1 = require("./context-parameter");
function InjectTransactionManager(managerProperty) {
    return function (target, propertyKey, descriptor) {
        if (!target.MedusaContextIndex_) {
            throw new Error(`An error occured applying decorator '@InjectTransactionManager' to method ${String(propertyKey)}: Missing parameter with flag @MedusaContext`);
        }
        const originalMethod = descriptor.value;
        managerProperty ??= "baseRepository_";
        const argIndex = target.MedusaContextIndex_[propertyKey];
        descriptor.value = async function (...args) {
            const originalContext = args[argIndex] ?? {};
            if (originalContext?.transactionManager) {
                return await originalMethod.apply(this, args);
            }
            return await (!managerProperty
                ? this
                : this[managerProperty]).transaction(async (transactionManager) => {
                const copiedContext = {};
                for (const key in originalContext) {
                    if (key === "manager" || key === "transactionManager") {
                        continue;
                    }
                    Object.defineProperty(copiedContext, key, {
                        enumerable: true,
                        get: function () {
                            return originalContext[key];
                        },
                        set: function (value) {
                            originalContext[key] = value;
                        },
                    });
                }
                copiedContext.transactionManager = transactionManager;
                if (originalContext?.manager) {
                    copiedContext.manager = originalContext?.manager;
                }
                copiedContext.__type = context_parameter_1.MedusaContextType;
                args[argIndex] = copiedContext;
                return await originalMethod.apply(this, args);
            }, {
                transaction: originalContext?.transactionManager,
                isolationLevel: originalContext?.isolationLevel,
                enableNestedTransactions: originalContext.enableNestedTransactions ?? false,
            });
        };
    };
}
//# sourceMappingURL=inject-transaction-manager.js.map