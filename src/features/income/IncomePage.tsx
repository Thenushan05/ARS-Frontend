import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, Filter } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import { Income } from '../../types';
import { incomeApi } from '../../api';

export const IncomePage: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIncome = async () => {
    setIsLoading(true);
    try {
      const data = await incomeApi.getAll();
      setIncomes(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);

  const columns: Column<Income>[] = [
    { key: 'transactionId', header: 'Transaction ID', render: (inc) => <span className="font-mono text-emerald-400 font-semibold">{inc.transactionId}</span> },
    { key: 'customerName', header: 'Customer & Category', render: (inc) => (
      <div>
        <div className="font-bold text-slate-100">{inc.customerName}</div>
        <div className="text-xs text-purple-400 font-medium">{inc.category}</div>
      </div>
    )},
    { key: 'amount', header: 'Amount', render: (inc) => <CurrencyDisplay amount={inc.amount} className="text-emerald-400 font-bold" /> },
    { key: 'paymentMethod', header: 'Method', render: (inc) => <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">{inc.paymentMethod}</span> },
    { key: 'account', header: 'Deposited Account', render: (inc) => <span className="text-xs text-slate-400">{inc.account}</span> },
    { key: 'date', header: 'Date', render: (inc) => <span className="text-xs text-slate-500">{inc.date}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income Management"
        subtitle="Track revenue breakdown by Visa Service, e-Visa, Consultation fees, and Air Ticket / Insurance commissions."
        breadcrumbs={[{ label: 'Income' }]}
      />

      <DataTable columns={columns} data={incomes} isLoading={isLoading} />
    </div>
  );
};

export default IncomePage;
