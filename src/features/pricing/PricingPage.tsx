import React, { useState, useEffect } from 'react';
import { Plus, Layers, Lock, Edit } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import { MasterPriceItem } from '../../types';
import { pricingApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export const PricingPage: React.FC = () => {
  const [items, setItems] = useState<MasterPriceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();

  const canSeeCosts = hasPermission(['pricing.cost.view', 'finance.profit.view']);

  const fetchPricing = async () => {
    setIsLoading(true);
    try {
      const data = await pricingApi.getAll();
      setItems(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const columns: Column<MasterPriceItem>[] = [
    { key: 'serviceName', header: 'Service Description', render: (p) => (
      <div>
        <div className="font-bold text-slate-100">{p.serviceName}</div>
        <div className="text-xs text-slate-500">{p.category}</div>
      </div>
    )},
    { key: 'sellingPrice', header: 'Customer Selling Price', render: (p) => <CurrencyDisplay amount={p.sellingPrice} className="text-sky-400 font-bold" /> },
    
    ...(canSeeCosts ? [
      { key: 'costPrice', header: 'Internal Cost', render: (p: MasterPriceItem) => p.costPrice ? <CurrencyDisplay amount={p.costPrice} className="text-slate-400 text-xs" /> : '-' },
      { key: 'serviceCharge', header: 'Service Fee Margin', render: (p: MasterPriceItem) => p.serviceCharge ? <CurrencyDisplay amount={p.serviceCharge} className="text-purple-400 font-semibold text-xs" /> : '-' },
      { key: 'profit', header: 'Net Service Profit', render: (p: MasterPriceItem) => p.profit ? <CurrencyDisplay amount={p.profit} className="text-emerald-400 font-bold text-xs" /> : '-' }
    ] : []),

    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Price Catalog"
        subtitle="Manage standard service rates, ancillary service fees, and financial fee structures."
        breadcrumbs={[{ label: 'Master Price List' }]}
        actions={
          <button
            onClick={() => alert('Add Service Modal')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service Rate</span>
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
      />
    </div>
  );
};

export default PricingPage;
