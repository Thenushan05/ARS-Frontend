import React, { useState, useEffect } from 'react';
import { Award, UserCheck, Phone, Mail, TrendingUp, Shield, BarChart2, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import FormModal from '../../components/modals/FormModal';
import { StaffMember, StaffPerformance } from '../../types';
import { staffApi } from '../../api';

export const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [performance, setPerformance] = useState<StaffPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'directory' | 'performance'>('directory');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<StaffMember>>({});

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete staff member "${name}"?`)) {
      try {
        await staffApi.delete(id);
        fetchStaff();
      } catch {
        alert('Error deleting staff.');
      }
    }
  };

  const handleOpenEdit = (e: React.MouseEvent, s: StaffMember) => {
    e.stopPropagation();
    setEditingId(s.id);
    setFormData({ ...s });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await staffApi.update(editingId, formData);
      } else {
        await staffApi.create(formData);
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch {
      alert('Error saving staff.');
    }
  };

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
    { key: 'staffId', header: 'Staff ID', render: (s) => <span className="font-mono text-sky-600 dark:text-sky-400 font-semibold">{s.staffId}</span> },
    { key: 'name', header: 'Staff Name & Role', render: (s) => (
      <div>
        <div className="font-bold text-slate-900 dark:text-slate-100">{s.name}</div>
        <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{s.role}</div>
      </div>
    )},
    { key: 'branch', header: 'Branch Location', render: (s) => <span className="text-xs text-slate-600 dark:text-slate-300">{s.branch}</span> },
    { key: 'email', header: 'Contact Email', render: (s) => <span className="text-xs text-slate-500 dark:text-slate-400">{s.email}</span> },
    { key: 'joinedDate', header: 'Joined', render: (s) => <span className="text-xs text-slate-500">{s.joinedDate}</span> },
    { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
    { key: 'actions', header: '', render: (s) => (
        <div className="flex items-center gap-2 justify-end">
          <button onClick={(e) => handleOpenEdit(e, s)} className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/30 transition-all" title="Edit Staff">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={(e) => handleDelete(e, s.id, s.name)} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/30 transition-all" title="Delete Staff">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
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

      {isModalOpen && (
        <FormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Staff Member" : "Add Staff Member"}
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Staff Name</label>
              <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input type="email" required value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select required value={formData.role || ''} onChange={(e) => setFormData({...formData, role: e.target.value as any})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500">
                  <option value="Super Admin">Super Admin</option>
                  <option value="Visa Consultant">Visa Consultant</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Branch</label>
                <input type="text" required value={formData.branch || ''} onChange={(e) => setFormData({...formData, branch: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md">{editingId ? 'Update' : 'Save'}</button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default StaffPage;
