import React, { useState, useEffect } from 'react';
import { AlertCircle, CreditCard, Bell, TrendingUp } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import StatCard from '../../components/common/StatCard';
import { Invoice } from '../../types';
import { invoicesApi } from '../../api';

export const OutstandingPage: React.FC = () => {
  const [outstandingInvoices, setOutstandingInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOutstanding = async () => {
    setIsLoading(true);
    try {
      const data = await invoicesApi.getAll();
      setOutstandingInvoices(data.filter(i => i.balance > 0));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOutstanding();
  }, []);

  const totalReceivable = outstandingInvoices.reduce((acc, curr) => acc + curr.balance, 0);

  const columns: Column<Invoice>[] = [
    { key: 'customerName', header: 'Customer', render: (i) => (
      <div>
        <div className="font-bold text-slate-100">{i.customerName}</div>
        <div className="text-xs text-slate-400">Inv: {i.invoiceNumber}</div>
      </div>
    )},
    { key: 'caseId', header: 'Case ID', render: (i) => <span className="font-mono text-purple-400 font-semibold">{i.caseId || 'Direct'}</span> },
    { key: 'total', header: 'Total Fee', render: (i) => <CurrencyDisplay amount={i.total} className="text-slate-300" /> },
    { key: 'paid', header: 'Amount Paid', render: (i) => <CurrencyDisplay amount={i.paid} className="text-emerald-400 font-semibold" /> },
    { key: 'balance', header: 'Outstanding Balance', render: (i) => <CurrencyDisplay amount={i.balance} className="text-rose-400 font-bold text-sm" /> },
    { key: 'dueDate', header: 'Due Date', render: (i) => <span className="text-xs text-amber-400 font-medium">{i.dueDate}</span> },
    { key: 'status', header: 'Payment Status', render: (i) => <StatusBadge status={i.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outstanding Receivables & Overdue Tracking"
        subtitle="Monitor pending balances, days overdue, and issue payment collection reminders."
        breadcrumbs={[{ label: 'Outstanding Pay' }]}
      />

      {/* Top KPI Card */}
      <div className="max-w-md">
        <StatCard
          title="Total Outstanding Receivable"
          value={totalReceivable}
          isCurrency
          icon={TrendingUp}
          colorScheme="rose"
          subtitle={`${outstandingInvoices.length} accounts pending collection`}
        />
      </div>

      <DataTable
        columns={columns}
        data={outstandingInvoices}
        isLoading={isLoading}
        actions={(i) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => alert(`Payment reminder notice created for ${i.customerName}`)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/25 flex items-center gap-1"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Send Reminder</span>
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default OutstandingPage;
