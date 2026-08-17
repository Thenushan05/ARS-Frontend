import React, { useState, useEffect } from 'react';
import { Truck, Lock, Phone } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import { Supplier } from '../../types';
import { suppliersApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();

  const canSeeCosts = hasPermission(['supplier.cost.view', 'finance.profit.view']);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await suppliersApi.getAll();
      setSuppliers(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const columns: Column<Supplier>[] = [
    { key: 'supplierName', header: 'Supplier / Agent', render: (s) => (
      <div>
        <div className="font-bold text-slate-100">{s.supplierName}</div>
        <div className="text-xs text-slate-400">{s.company} ({s.country})</div>
      </div>
    )},
    { key: 'services', header: 'Outsourced Services', render: (s) => (
      <div className="text-xs text-slate-300">
        {s.services.join(', ')}
      </div>
    )},
    { key: 'phone', header: 'Contact', render: (s) => (
      <div className="text-xs">
        <div>{s.phone}</div>
        <div className="text-emerald-400">WA: {s.whatsApp}</div>
      </div>
    )},
    { key: 'casesHandled', header: 'Cases Handled', render: (s) => <span className="font-semibold text-purple-400">{s.casesHandled} Cases</span> },

    ...(canSeeCosts ? [
      { key: 'amountPaid', header: 'Total Paid', render: (s: Supplier) => s.amountPaid ? <CurrencyDisplay amount={s.amountPaid} className="text-emerald-400 text-xs font-semibold" /> : '-' },
      { key: 'amountPayable', header: 'Outstanding Payable', render: (s: Supplier) => s.amountPayable ? <CurrencyDisplay amount={s.amountPayable} className="text-rose-400 text-xs font-bold" /> : '-' }
    ] : []),

    { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier & Overseas Agent Directory"
        subtitle="Manage VFS contractors, e-Visa fulfillment agents, translation bureaus, and payable balances."
        breadcrumbs={[{ label: 'Suppliers & Agents' }]}
      />

      <DataTable columns={columns} data={suppliers} isLoading={isLoading} />
    </div>
  );
};

export default SuppliersPage;
