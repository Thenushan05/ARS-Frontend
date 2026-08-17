import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { BadgeDollarSign, Briefcase, FileText, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { ChartCard } from '@/components/charts/ChartCard'
import { ErrorState } from '@/components/common/ErrorState'
import { DateRangePicker, presetToRange } from '@/components/tables/DateRangePicker'
import { dashboardApi } from '@/api/dashboardApi'
import { PERMISSIONS } from '@/constants/permissions'

/**
 * §8 Main Dashboard. The full KPI/chart set is built out in Phase 2 — this
 * wires the real data-fetching + permission-gated layout against the
 * eventual /dashboard/summary contract so the pattern is proven before the
 * backend exists. Until the API is live this correctly renders the error
 * state below (with retry) rather than fabricated numbers (§47).
 */
export default function DashboardPage() {
  const [range, setRange] = useState({ preset: 'month', ...presetToRange('month', new Date()) })

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard', 'summary', range.from, range.to],
    queryFn: () => dashboardApi.getSummary(range),
    retry: 1,
  })

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Customer, visa, finance and follow-up overview."
        actions={<DateRangePicker value={range} onChange={setRange} />}
      />

      {isError ? (
        <ErrorState
          title="Couldn't load dashboard data"
          description={error?.message ?? 'The dashboard API is not available yet.'}
          onRetry={refetch}
        />
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Customer / Visa</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Customers" value={data?.totalCustomers ?? '—'} icon={UserPlus} tone="info" isLoading={isLoading} />
              <StatCard label="Active Visa Cases" value={data?.activeCases ?? '—'} icon={Briefcase} tone="info" isLoading={isLoading} />
              <StatCard label="Documents Pending" value={data?.documentsPending ?? '—'} icon={FileText} tone="warning" isLoading={isLoading} />
              <StatCard label="Visa Approved" value={data?.visaApproved ?? '—'} icon={Briefcase} tone="success" isLoading={isLoading} />
            </div>
          </section>

          <PermissionGuard permission={PERMISSIONS.DASHBOARD_FINANCE_VIEW}>
            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Finance</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="This Month Income" value={data?.monthIncome ?? '—'} icon={BadgeDollarSign} tone="success" isLoading={isLoading} />
                <StatCard label="This Month Expense" value={data?.monthExpense ?? '—'} icon={BadgeDollarSign} tone="danger" isLoading={isLoading} />
                <StatCard label="Net Profit" value={data?.netProfit ?? '—'} icon={BadgeDollarSign} tone="info" isLoading={isLoading} />
                <StatCard label="Customer Outstanding" value={data?.outstanding ?? '—'} icon={BadgeDollarSign} tone="warning" isLoading={isLoading} />
              </div>
            </section>
          </PermissionGuard>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Monthly Revenue" isLoading={isLoading} isEmpty={!data?.monthlyRevenue?.length}>
              <BarChart data={data?.monthlyRevenue ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Bar dataKey="amount" fill="var(--color-brand-500)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>

            <ChartCard title="Visa Cases by Country" isLoading={isLoading} isEmpty={!data?.casesByCountry?.length}>
              <BarChart data={data?.casesByCountry ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="country" tickLine={false} axisLine={false} width={90} />
                <Bar dataKey="count" fill="var(--color-status-info)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  )
}
