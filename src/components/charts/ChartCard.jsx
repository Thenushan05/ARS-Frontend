import { ResponsiveContainer } from 'recharts'
import { Card, CardHeader } from '@/components/common/Card'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'

/**
 * Standard wrapper for every dashboard/report chart (§8, §36): title,
 * optional actions (e.g. a period switcher), and consistent
 * loading/empty handling around a Recharts ResponsiveContainer.
 *
 *   <ChartCard title="Monthly Revenue" isLoading={isLoading} isEmpty={!data.length}>
 *     <BarChart data={data}>...</BarChart>
 *   </ChartCard>
 */
export function ChartCard({ title, description, actions, height = 280, isLoading, isEmpty, children }) {
  return (
    <Card>
      <CardHeader title={title} description={description} actions={actions} />
      <div className="p-4" style={{ height }}>
        {isLoading ? (
          <LoadingSkeleton className="h-full w-full" />
        ) : isEmpty ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState title="No data for this period" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
