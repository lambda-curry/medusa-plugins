"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitSubscribersExecution = void 0;
// Allows you to wait for all subscribers to execute for a given event. Only works with the local event bus.
const waitSubscribersExecution = (eventName, eventBus, { timeout = 5000, } = {}) => {
    const eventEmitter = eventBus.eventEmitter_;
    const subscriberPromises = [];
    const originalListeners = eventEmitter.listeners(eventName);
    let timeoutId = null;
    // Create a promise that rejects after the timeout
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`Timeout of ${timeout}ms exceeded while waiting for event "${eventName}"`));
        }, timeout);
        timeoutId.unref();
    });
    // If there are no existing listeners, resolve once the event happens. Otherwise, wrap the existing subscribers in a promise and resolve once they are done.
    if (!eventEmitter.listeners(eventName).length) {
        let ok;
        const promise = new Promise((resolve) => {
            ok = resolve;
        });
        subscriberPromises.push(promise);
        eventEmitter.on(eventName, ok);
    }
    else {
        eventEmitter.listeners(eventName).forEach((listener) => {
            eventEmitter.removeListener(eventName, listener);
            let ok, nok;
            const promise = new Promise((resolve, reject) => {
                ok = resolve;
                nok = reject;
            });
            subscriberPromises.push(promise);
            const newListener = async (...args2) => {
                try {
                    const res = await listener.apply(eventBus, args2);
                    ok(res);
                    return res;
                }
                catch (error) {
                    nok(error);
                }
            };
            eventEmitter.on(eventName, newListener);
        });
    }
    const subscribersPromise = Promise.all(subscriberPromises).finally(() => {
        // Clear the timeout since events have been fired and handled
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        // Restore original event listeners
        eventEmitter.removeAllListeners(eventName);
        originalListeners.forEach((listener) => {
            eventEmitter.on(eventName, listener);
        });
    });
    // Race between the subscribers and the timeout
    return Promise.race([subscribersPromise, timeoutPromise]);
};
exports.waitSubscribersExecution = waitSubscribersExecution;
//# sourceMappingURL=events.js.map