/**
 * Indian Rupee Number Formatter
 * e.g. 500000 -> "₹ 5,00,000"
 */
export function formatCurrencyINR(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `₹ ${formatted}`;
}

/**
 * Compact Rupee Formatter for metrics
 * e.g. 50,000,000 -> "₹ 5.00 Cr", 500,000 -> "₹ 5.00 L"
 */
export function formatCompactINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹ ${(amount / 100000).toFixed(1)} L`;
  }
  return `₹ ${amount.toLocaleString('en-IN')}`;
}
