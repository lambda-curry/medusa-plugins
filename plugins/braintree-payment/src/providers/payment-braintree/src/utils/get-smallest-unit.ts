import type { BigNumberInput } from '@medusajs/framework/types';
import { BigNumber, MathBN } from '@medusajs/framework/utils';

function getCurrencyMultiplier(currency: string): number {
  const currencyMultipliers = {
    0: ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'],
    3: ['BHD', 'IQD', 'JOD', 'KWD', 'OMR', 'TND'],
  };

  const uppercaseCurrency = currency.toUpperCase();
  let power = 2;
  for (const [key, value] of Object.entries(currencyMultipliers)) {
    if (value.includes(uppercaseCurrency)) {
      power = Number.parseInt(key, 10);
      break;
    }
  }
  return 10 ** power;
}

/**
 * Converts an amount to the format required by Stripe based on currency.
 * https://docs.stripe.com/currencies
 * @param {BigNumberInput} amount - The amount to be converted.
 * @param {string} currency - The currency code (e.g., 'USD', 'JOD').
 * @returns {number} - The converted amount in the smallest currency unit.
 */
export function getSmallestUnit(amount: BigNumberInput, currency: string): number {
  const multiplier = getCurrencyMultiplier(currency);

  const amount_ = Math.round(new BigNumber(MathBN.mult(amount, multiplier)).numeric) / multiplier;

  const smallestAmount = new BigNumber(MathBN.mult(amount_, multiplier));

  let numeric = smallestAmount.numeric;
  // Check if the currency requires rounding to the nearest ten
  if (multiplier === 1e3) {
    numeric = Math.ceil(numeric / 10) * 10;
  }

  // return parseInt(numeric.toString().split(".").shift()!, 10);
  const splitResult = numeric.toString().split('.');
  const integerPart = splitResult.shift();

  if (!integerPart) {
    throw new Error(`Failed to parse numeric value: ${numeric}`);
  }

  return Number.parseInt(integerPart, 10);
}

/**
 * Converts an amount from the smallest currency unit to the standard unit based on currency.
 * @param {BigNumberInput} amount - The amount in the smallest currency unit.
 * @param {string} currency - The currency code (e.g., 'USD', 'JOD').
 * @returns {number} - The converted amount in the standard currency unit.
 */
export function getAmountFromSmallestUnit(amount: BigNumberInput, currency: string): number {
  const multiplier = getCurrencyMultiplier(currency);
  const standardAmount = new BigNumber(MathBN.div(amount, multiplier));
  return standardAmount.numeric;
}

/**
 * Formats an amount provided in the smallest currency unit into a decimal string
 * suitable for providers (e.g., Braintree) that expect standard unit decimal strings.
 *
 * Examples:
 * - USD: 1234 -> "12.34"
 * - JPY: 1234 -> "1234"
 * - JOD (3 decimals): 12340 -> "12.340"
 */
export function formatSmallestUnitToDecimalString(amount: BigNumberInput, currency: string): string {
  const multiplier = getCurrencyMultiplier(currency);

  // Determine number of fraction digits based on multiplier (10^digits)
  let fractionDigits = 0;
  if (multiplier === 1000) {
    fractionDigits = 3;
  } else if (multiplier === 100) {
    fractionDigits = 2;
  } else if (multiplier === 1) {
    fractionDigits = 0;
  } else {
    // Fallback: infer by counting zeros in multiplier
    fractionDigits = Math.max(0, Math.round(Math.log10(multiplier)));
  }

  const standardAmount = getAmountFromSmallestUnit(amount, currency);
  return standardAmount.toFixed(fractionDigits);
}
