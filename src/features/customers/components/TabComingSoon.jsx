import { Construction } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'

/** Same voice as <ComingSoonPage> (§48) but sized for a tab panel rather
 * than a full page — used by every Customer Profile tab whose backing
 * module hasn't landed yet (Visa Cases, Documents, Payments, Appointments,
 * Quotations, Invoices). Real plumbing, honest empty state — no fabricated
 * numbers or placeholder rows. */
export function TabComingSoon({ label, phase }) {
  return (
    <EmptyState
      icon={Construction}
      title={`${label} is coming soon`}
      description={phase ? `Scheduled for ${phase} of the implementation plan.` : 'This module has not been built yet.'}
    />
  )
}
