import React, { useState, useEffect } from 'react';
import { Plus, Globe, Shield, Lock, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PermissionGuard from '../../components/common/PermissionGuard';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import { EVisaService } from '../../types';
import { eVisaApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export const EVisaPage: React.FC = () => {
  const [evisas, setEvisas] = useState<EVisaService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();

  const canSeeFinancialCosts = hasPermission(['pricing.cost.view', 'finance.profit.view']);

  const fetchEVisas = async () => {
    setIsLoading(true);
    try {
      const data = await eVisaApi.getAll();
      setEvisas(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEVisas();
  }, []);

  const columns: Column<EVisaService>[] = [
    { key: 'country', header: 'Country & Service', render: (ev) => (
      <div>
        <div className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-sky-400" />
          <span>{ev.country}</span>
        </div>
        <div className="text-xs text-slate-400">{ev.visaName}</div>
      </div>
    )},
    { key: 'entryType', header: 'Entry & Validity', render: (ev) => (
      <div className="text-xs">
        <span className="font-medium text-slate-200">{ev.entryType}</span>
        <div className="text-slate-400">Validity: {ev.validity} | Stay: {ev.stayPeriod}</div>
      </div>
    )},
    { key: 'processingTime', header: 'Processing', render: (ev) => <span className="text-xs text-amber-400 font-semibold">{ev.processingTime}</span> },
    { key: 'customerSellingPrice', header: 'Selling Price', render: (ev) => <CurrencyDisplay amount={ev.customerSellingPrice} className="text-sky-400 font-bold" /> },
    
    // Guarded Columns strictly controlled by backend permissions
    ...(canSeeFinancialCosts ? [
      { key: 'governmentFee', header: 'Gov Fee', render: (ev: EVisaService) => ev.governmentFee ? <CurrencyDisplay amount={ev.governmentFee} className="text-slate-400 text-xs" /> : '-' },
      { key: 'supplierCost', header: 'Supplier Cost', render: (ev: EVisaService) => ev.supplierCost ? <CurrencyDisplay amount={ev.supplierCost} className="text-slate-400 text-xs" /> : '-' },
      { key: 'estimatedProfit', header: 'Estimated Profit', render: (ev: EVisaService) => ev.estimatedProfit ? <CurrencyDisplay amount={ev.estimatedProfit} className="text-emerald-400 font-bold text-xs" /> : '-' }
    ] : []),

    { key: 'status', header: 'Status', render: (ev) => <StatusBadge status={ev.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="e-Visa Service Catalog"
        subtitle="Manage instant e-Visa products, validity periods, processing turnaround times, and selling rates."
        breadcrumbs={[{ label: 'e-Visa Catalog' }]}
        actions={
          <PermissionGuard permission="evisa.manage">
            <button
              onClick={() => alert('Add e-Visa product modal')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add e-Visa Product</span>
            </button>
          </PermissionGuard>
        }
      />

      {/* Financial Privacy Notice */}
      {!canSeeFinancialCosts && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Internal supplier costs and profit margins are hidden based on your current role permissions.</span>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={evisas}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EVisaPage;
