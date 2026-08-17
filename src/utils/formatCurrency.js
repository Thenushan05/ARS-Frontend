/**
 * Display-only currency formatting. This NEVER computes a value (balance,
 * profit, totals) — it only formats numbers the backend already returned.
 * See CurrencyDisplay component for the standard UI usage.
 */
export function formatCurrency(amount, currency = 'LKR') {
  const value = Number(amount ?? 0)
  try {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency,
      currencyDisplay: 'code',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(value)
      .replace(currency, currency) // keep the ISO code prefix, e.g. "LKR 12,000.00"
  } catch {
    return `${currency} ${value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
  }
}
