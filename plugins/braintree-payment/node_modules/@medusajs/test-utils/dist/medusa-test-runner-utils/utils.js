"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyEnvVarsToProcess = applyEnvVarsToProcess;
exports.execOrTimeout = execOrTimeout;
const utils_1 = require("@medusajs/framework/utils");
function applyEnvVarsToProcess(env) {
    if ((0, utils_1.isObject)(env)) {
        Object.entries(env).forEach(([k, v]) => (process.env[k] = v));
    }
}
/**
 * Execute a function and return a promise that resolves when the function
 * resolves or rejects when the function rejects or the timeout is reached.
 * @param fn - The function to execute.
 * @param timeout - The timeout in milliseconds.
 * @returns A promise that resolves when the function resolves or rejects when the function rejects or the timeout is reached.
 */
async function execOrTimeout(fn, timeout = 5000) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), timeout).unref();
    });
    const fnPromise = typeof fn === "function" ? fn() : fn;
    return Promise.race([fnPromise, timeoutPromise]);
}
//# sourceMappingURL=utils.js.map