export declare function applyEnvVarsToProcess(env?: Record<any, any>): void;
/**
 * Execute a function and return a promise that resolves when the function
 * resolves or rejects when the function rejects or the timeout is reached.
 * @param fn - The function to execute.
 * @param timeout - The timeout in milliseconds.
 * @returns A promise that resolves when the function resolves or rejects when the function rejects or the timeout is reached.
 */
export declare function execOrTimeout(fn: Promise<any> | (() => Promise<void>), timeout?: number): Promise<any>;
//# sourceMappingURL=utils.d.ts.map