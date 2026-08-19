import React, { useState } from 'react';
import {
  Users, UserCheck, Briefcase, FileCheck, Send, Hourglass, CheckCircle2, XCircle,
  Building2, Phone, MessageCircle, CalendarClock, Bell, AlertTriangle,
  DollarSign, TrendingUp, Wallet, Landmark, Clock,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import PermissionGuard from '../../components/common/PermissionGuard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import TodaysTasksWidget from '../../components/dashboard/TodaysTasksWidget';
import { useDashboard } from './hooks/useDashboardQuery';
import { normalizeApiError } from '../../api/errors';
import { DashboardFilters } from '../../types/api';

const PRESET_OPTIONS: { value: NonNullable<DashboardFilters['preset']>; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

function formatRangeDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const DashboardPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [preset, setPreset] = useState<NonNullable<DashboardFilters['preset']>>('today');

  const { data, isLoading, isError, error } = useDashboard({ preset });

  const hasFinance = hasPermission('dashboard.finance.view') && !!data && 'finance' in data && !!data.finance;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0]}!`}
        subtitle="ARS VISA Management Dashboard — Real-time Operations & Financial Overview"
        actions={
          <div className="flex items-center gap-3">
            {data?.range && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Showing: {formatRangeDate(data.range.from)} – {formatRangeDate(data.range.to)}
              </span>
            )}
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as NonNullable<DashboardFilters['preset']>)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {PRESET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        }
      />

      {isError && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 text-sm font-medium">
          {normalizeApiError(error).message}
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : data ? (
        <>
          {/* Operational KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="New Inquiries" value={data.customer.newInquiries} icon={Users} colorScheme="blue" subtitle="in selected range" />
            <StatCard title="New Registrations" value={data.customer.newRegistrations} icon={UserCheck} colorScheme="emerald" subtitle="new clients" />
            <StatCard title="Active Visa Cases" value={data.customer.activeCases} icon={Briefcase} colorScheme="purple" subtitle="in process" />
            <StatCard title="Documents Pending" value={data.customer.documentsPending} icon={FileCheck} colorScheme="amber" subtitle="action required" />
          </div>

          {/* Today's Tasks & Follow-ups Widget */}
          <TodaysTasksWidget />

          {/* Additional Customer Pipeline KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Total Customers" value={data.customer.totalCustomers} icon={Building2} colorScheme="slate" />
            <StatCard title="Applications Submitted" value={data.customer.applicationsSubmitted} icon={Send} colorScheme="blue" />
            <StatCard title="Decisions Pending" value={data.customer.decisionsPending} icon={Hourglass} colorScheme="amber" />
            <StatCard title="Visas Approved" value={data.customer.visasApproved} icon={CheckCircle2} colorScheme="emerald" />
            <StatCard title="Visas Refused" value={data.customer.visasRefused} icon={XCircle} colorScheme="rose" />
          </div>

          {/* Follow-up & Activity KPIs */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Follow-up & Activity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard title="Today's Calls" value={data.followUp.todayCalls} icon={Phone} colorScheme="blue" />
              <StatCard title="Today's WhatsApp" value={data.followUp.todayWhatsapp} icon={MessageCircle} colorScheme="emerald" />
              <StatCard title="Appointments Today" value={data.followUp.appointmentsToday} icon={CalendarClock} colorScheme="purple" />
              <StatCard title="Missing Document Reminders" value={data.followUp.missingDocumentReminders} icon={Bell} colorScheme="amber" />
              <StatCard title="Overdue Cases" value={data.followUp.overdueCases} icon={AlertTriangle} colorScheme="rose" />
            </div>
          </div>

          {/* Restricted Financial KPIs Guarded by backend permissions */}
          {hasFinance && (
            <PermissionGuard permission="dashboard.finance.view">
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                    <span>Financial Profitability KPIs</span>
                    <span className="text-[10px] bg-purple-950 px-2 py-0.5 rounded border border-purple-500/40 text-purple-300 font-mono">Restricted Access</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard title="Today's Income" value={data.finance!.todayIncome} isCurrency icon={DollarSign} colorScheme="emerald" guarded />
                  <StatCard title="Today's Expense" value={data.finance!.todayExpense} isCurrency icon={DollarSign} colorScheme="rose" guarded />
                  <StatCard title="Today's Profit" value={data.finance!.todayProfit} isCurrency icon={DollarSign} colorScheme="purple" guarded />
                  <StatCard title="Monthly Income" value={data.finance!.monthIncome} isCurrency icon={TrendingUp} colorScheme="emerald" guarded />
                  <StatCard title="Monthly Expense" value={data.finance!.monthExpense} isCurrency icon={DollarSign} colorScheme="rose" guarded />
                  <StatCard title="Net Profit (Month)" value={data.finance!.netProfitMonth} isCurrency icon={DollarSign} colorScheme="purple" guarded />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Customer Outstanding" value={data.finance!.customerOutstanding} isCurrency icon={Wallet} colorScheme="amber" guarded />
                  <StatCard title="Agent Payable" value={data.finance!.agentPayable} isCurrency icon={Landmark} colorScheme="rose" guarded />
                  <StatCard title="Upcoming Payments" value={data.finance!.upcomingPaymentsCount} icon={Clock} colorScheme="blue" guarded subtitle="count" />
                  <StatCard title="Upcoming Payments Amount" value={data.finance!.upcomingPaymentsAmount} isCurrency icon={DollarSign} colorScheme="blue" guarded />
                </div>
              </div>
            </PermissionGuard>
          )}

          {/* Detailed chart breakdowns (leads by source, cases by country, financial trend) are not
              yet exposed by GET /dashboard — they belong to the /reports/* endpoints landing in a
              later phase. Intentionally no fabricated charts here. */}
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30 p-5 text-center text-xs text-slate-500 dark:text-slate-400">
            Detailed breakdowns (leads by source, cases by country, financial trends) will be available under Reports.
          </div>
        </>
      ) : null}
    </div>
  );
};

export default DashboardPage;
