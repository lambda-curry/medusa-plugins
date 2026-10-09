import { MedusaError } from '@medusajs/framework/utils';

/**
 * Formats a number or string to a two-decimal string representation.
 * Validates the input is parseable to a number and throws MedusaError on NaN.
 *
 * @param amount - The amount to format (number or string)
 * @returns A string representation with exactly 2 decimal places
 * @throws MedusaError if the amount is not a valid number
 */
export function formatToTwoDecimalString(amount: number | string): string {
  if (typeof amount !== 'string') {
    amount = amount.toString();
  }

  const num = Number.parseFloat(amount);

  if (Number.isNaN(num)) {
    throw new MedusaError(MedusaError.Types.INVALID_ARGUMENT, 'Invalid amount');
  }

  return num.toFixed(2);
}

/**
 * True when a refund covers the whole Braintree sale. A missing or non-positive
 * sale amount is not a full refund, so callers keep rejecting the void.
 */
export function isFullSaleRefund(refundAmount: number, saleAmount: string | number | null | undefined): boolean {
  if (saleAmount == null || saleAmount === '') {
    return false;
  }

  const sale = typeof saleAmount === 'number' ? saleAmount : Number.parseFloat(saleAmount);
  if (!Number.isFinite(sale) || sale <= 0) {
    return false;
  }

  return formatToTwoDecimalString(refundAmount) === formatToTwoDecimalString(sale);
}
