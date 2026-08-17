import React, { useState, useEffect } from 'react';
import { Award, UserCheck, Phone, Mail, TrendingUp, Shield, BarChart2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import { StaffMember, StaffPerformance } from '../../types';
import { staffApi } from '../../api';

export const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [performance, setPerformance] = useState<StaffPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'directory' | 'performance'>('directory');

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const [sData, pData] = await Promise.all([
        staffApi.getAll(),
        staffApi.getPerformance()
      ]);
      setStaff(sData);
      setPerformance(pData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const staffColumns: Column<StaffMember>[] = [
    { key: 'staffId', header: 'Staff ID', render: (s) => <span className="font-mono text-sky-400 font-semibold">{s.staffId}</span> },
    { key: 'name', header: 'Staff Name & Role', render: (s) => (
      <div>
        <div className="font-bold text-slate-100">{s.name}</div>
        <div className="text-xs text-purple-400 font-semibold">{s.role}</div>
      </div>
    )},
    { key: 'branch', header: 'Branch Location', render: (s) => <span className="text-xs text-slate-300">{s.branch}</span> },
    { key: 'email', header: 'Contact Email', render: (s) => <span className="text-xs text-slate-400">{s.email}</span> },
    { key: 'joinedDate', header: 'Joined', render: (s) => <span className="text-xs text-slate-500">{s.joinedDate}</span> },
    { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff & Consultant Performance Management"
        subtitle="Manage employee access roles, monitor lead conversion efficiency, and track financial collections per consultant."
        breadcrumbs={[{ label: 'Staff' }]}
        actions={
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('directory')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                viewMode === 'directory' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Staff Directory
            </button>
            <button
              onClick={() => setViewMode('performance')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                viewMode === 'performance' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Performance Metrics
            </button>
          </div>
        }
      />

      {viewMode === 'directory' ? (
        <DataTable columns={staffColumns} data={staff} isLoading={isLoading} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {performance.map((p) => (
            <div key={p.staffId} className="p-6 rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-md space-y-4">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-100">{p.name}</h3>
                  <p className="text-xs text-purple-400 font-mono">ID: {p.staffId}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  {p.conversionRate}% Conversion Rate
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <p className="text-slate-500 font-semibold">Leads Handled</p>
                  <p className="text-base font-bold text-slate-100">{p.leadsHandled}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <p className="text-slate-500 font-semibold">Calls Logged</p>
                  <p className="text-base font-bold text-sky-400">{p.callsCount}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <p className="text-slate-500 font-semibold">Registrations</p>
                  <p className="text-base font-bold text-emerald-400">{p.registrations}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <p className="text-slate-500 font-semibold">Active Cases</p>
                  <p className="text-base font-bold text-purple-400">{p.visaCases}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 sm:col-span-2">
                  <p className="text-slate-500 font-semibold">Payments Collected</p>
                  <CurrencyDisplay amount={p.paymentsCollected} className="text-base text-emerald-400 font-bold" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffPage;
