import { BigNumberInput, ConfirmVariantInventoryWorkflowInputDTO } from "@medusajs/framework/types";
interface ConfirmInventoryItem {
    id?: string;
    inventory_item_id: string;
    required_quantity: number;
    allow_backorder: boolean;
    quantity: BigNumberInput;
    location_ids: string[];
}
/**
 * This function prepares the input for the confirm inventory workflow.
 * In essesnce, it maps a list of cart items to a list of inventory items,
 * serving as a bridge between the cart and inventory domains.
 *
 * @throws {MedusaError} INVALID_DATA if any cart item is for a variant that has no inventory items.
 * @throws {MedusaError} INVALID_DATA if any cart item is for a variant with no stock locations in the input.sales_channel_id. An exception is made for variants with allow_backorder set to true.
 *
 * @returns {ConfirmInventoryPreparationInput}
 * A list of inventory items to confirm. Only inventory items for variants with managed inventory are included.
 */
export declare const prepareConfirmInventoryInput: (data: {
    input: ConfirmVariantInventoryWorkflowInputDTO;
}) => {
    items: ConfirmInventoryItem[];
};
export {};
//# sourceMappingURL=prepare-confirm-inventory-input.d.ts.map