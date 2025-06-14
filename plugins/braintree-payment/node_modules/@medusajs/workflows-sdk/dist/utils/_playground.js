"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const composer_1 = require("./composer");
const create_hook_1 = require("./composer/create-hook");
const workflow_response_1 = require("./composer/helpers/workflow-response");
const step1 = (0, composer_1.createStep)("step1", () => {
    return new composer_1.StepResponse("step1");
}, () => {
    console.log("compensate step1");
});
const step2 = (0, composer_1.createStep)("step2", (input) => {
    return new composer_1.StepResponse(input);
}, (input) => {
    console.log("compensate step2", input);
});
const workflow = (0, composer_1.createWorkflow)("workflow", () => {
    const step1Result = step1();
    const step2Input = (0, composer_1.transform)({ step1Result }, (input) => {
        return input;
    });
    const step2Result = step2(step2Input);
    const hook = (0, create_hook_1.createHook)("hook", {
        step2Result,
    });
    return new workflow_response_1.WorkflowResponse(void 0, {
        hooks: [hook],
    });
});
workflow.hooks.hook(() => {
    throw new Error("hook failed");
});
workflow()
    .run()
    .then((res) => {
    console.log(res);
})
    .catch((e) => {
    console.log(e);
});
//# sourceMappingURL=_playground.js.map