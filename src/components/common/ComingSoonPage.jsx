import { Construction } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { EmptyState } from './EmptyState'

/**
 * Placeholder rendered for menu destinations not yet built. Every route in
 * routes/AppRoutes.jsx that belongs to a later implementation phase (§48)
 * points here so navigation/permissions can be exercised end-to-end before
 * the feature itself exists — swap for the real page as each phase lands.
 */
export function ComingSoonPage({ title, phase }) {
  return (
    <div>
      <PageHeader title={title} breadcrumbItems={[{ label: title }]} />
      <EmptyState
        icon={Construction}
        title={`${title} is coming soon`}
        description={phase ? `Scheduled for ${phase} of the implementation plan (§48).` : 'This module has not been built yet.'}
      />
    </div>
  )
}
