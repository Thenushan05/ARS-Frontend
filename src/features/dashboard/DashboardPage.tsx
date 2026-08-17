import React from 'react';
import { 
  Users, UserCheck, Briefcase, FileCheck, Calendar, 
  CheckSquare, Clock, TrendingUp, DollarSign, ArrowUpRight, 
  ArrowDownRight, PieChart as PieIcon, ShieldAlert 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend 
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import PermissionGuard from '../../components/common/PermissionGuard';
import { useAuth } from '../../context/AuthContext';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';

export const DashboardPage: React.FC = () => {
  const { user, hasPermission } = useAuth();

  // Mock Analytics Data
  const leadsBySource = [
    { name: 'Facebook', value: 45, color: '#3b82f6' },
    { name: 'TikTok', value: 30, color: '#ec4899' },
    { name: 'Instagram', value: 25, color: '#a855f7' },
    { name: 'Google', value: 20, color: '#eab308' },
    { name: 'Walk-in', value: 15, color: '#10b981' },
  ];

  const casesByCountry = [
    { country: 'France', cases: 38 },
    { country: 'UK', cases: 42 },
    { country: 'Canada', cases: 29 },
    { country: 'UAE', cases: 54 },
    { country: 'Australia', cases: 18 },
  ];

  const financialOverview = [
    { month: 'Mar', revenue: 2400000, expense: 1100000, profit: 1300000 },
    { month: 'Apr', revenue: 3100000, expense: 1400000, profit: 1700000 },
    { month: 'May', revenue: 2800000, expense: 1200000, profit: 1600000 },
    { month: 'Jun', revenue: 4200000, expense: 1800000, profit: 2400000 },
    { month: 'Jul', revenue: 3900000, expense: 1650000, profit: 2250000 },
    { month: 'Aug', revenue: 4850000, expense: 1950000, profit: 2900000 },
  ];

  const approvalRateData = [
    { name: 'Approved', value: 82, color: '#10b981' },
    { name: 'Refused', value: 18, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0]}!`}
        subtitle="ARS VISA Management Dashboard — Real-time Operations & Financial Overview"
      />

      {/* Operational KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Leads" value={14} icon={Users} trend="12%" colorScheme="blue" subtitle="vs yesterday" />
        <StatCard title="Today's Registrations" value={5} icon={UserCheck} trend="8%" colorScheme="emerald" subtitle="new clients" />
        <StatCard title="Active Visa Cases" value={68} icon={Briefcase} colorScheme="purple" subtitle="in process" />
        <StatCard title="Pending Documents" value={12} icon={FileCheck} colorScheme="amber" subtitle="action required" />
        <StatCard title="Upcoming Appointments" value={7} icon={Calendar} colorScheme="blue" subtitle="scheduled today" />
        <StatCard title="Today's Tasks" value={9} icon={CheckSquare} colorScheme="emerald" subtitle="4 completed" />
        <StatCard title="Payments Due" value={8} icon={Clock} colorScheme="rose" subtitle="invoices pending" />
        <StatCard title="Total Receivable" value={4250000} isCurrency icon={TrendingUp} colorScheme="purple" subtitle="outstanding" />
      </div>

      {/* Restricted Financial KPIs Guarded by backend permissions */}
      <PermissionGuard permission="finance.profit.view">
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <span>Financial Profitability KPIs</span>
              <span className="text-[10px] bg-purple-950 px-2 py-0.5 rounded border border-purple-500/40 text-purple-300 font-mono">Restricted Access</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Today's Income" value={255000} isCurrency icon={DollarSign} colorScheme="emerald" guarded />
            <StatCard title="Today's Expense" value={60500} isCurrency icon={DollarSign} colorScheme="rose" guarded />
            <StatCard title="Today's Profit" value={194500} isCurrency icon={DollarSign} colorScheme="purple" trend="24%" guarded />
            <StatCard title="Monthly Revenue" value={4850000} isCurrency icon={TrendingUp} colorScheme="emerald" guarded />
            <StatCard title="Monthly Expense" value={1950000} isCurrency icon={DollarSign} colorScheme="rose" guarded />
            <StatCard title="Monthly Profit" value={2900000} isCurrency icon={DollarSign} colorScheme="purple" trend="31%" guarded />
          </div>
        </div>
      </PermissionGuard>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Country */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Active Visa Cases by Country</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={casesByCountry}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="country" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="cases" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads by Source */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Leads by Marketing Source</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadsBySource} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {leadsBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Protected Revenue & Expense Trend Chart */}
      <PermissionGuard permission="finance.profit.view">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Financial Growth & Profit Margins (Monthly)</h3>
            <span className="text-xs text-emerald-400 font-semibold">+31% Profit YoY</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialOverview}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue (LKR)" />
                <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} name="Expense (LKR)" />
                <Line type="monotone" dataKey="profit" stroke="#a855f7" strokeWidth={3} name="Net Profit (LKR)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </PermissionGuard>
    </div>
  );
};

export default DashboardPage;
