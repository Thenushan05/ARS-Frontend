import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

/**
 * Renders a currency amount the backend already computed. Never derives
 * the number itself — see §7 / §20 ("do not perform authoritative balance
 * calculations only in frontend").
 */
export function CurrencyDisplay({ amount, currency = 'LKR', tone, className }) {
  const toneClass =
    tone === 'danger'
      ? 'text-status-danger'
      : tone === 'success'
        ? 'text-status-success'
        : tone === 'warning'
          ? 'text-status-warning'
          : 'text-slate-900'

  return <span className={cn('font-medium tabular-nums', toneClass, className)}>{formatCurrency(amount, currency)}</span>
}
