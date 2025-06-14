import { CreateOrderCreditLineDTO, OrderDTO } from "@medusajs/framework/types";
export declare const validateOrderCreditLinesStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    order: OrderDTO;
    creditLines: Omit<CreateOrderCreditLineDTO, "order_id">[];
}, unknown>;
export declare const createOrderCreditLinesWorkflowId = "create-order-credit-lines";
export declare const createOrderCreditLinesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<{
    id: string;
    credit_lines: Omit<CreateOrderCreditLineDTO, "order_id">[];
}, import("@medusajs/framework/types").OrderCreditLineDTO[], []>;
//# sourceMappingURL=create-order-credit-lines.d.ts.map