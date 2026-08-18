import React, { useState, useEffect } from 'react';
import { 
  Building2, Lock, Phone, MessageSquare, Plus, Search, Eye, Filter, 
  CheckCircle2, Globe, ShieldCheck, FileText, Briefcase, DollarSign, Calendar, AlertCircle
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { Supplier } from '../../types';
import { suppliersApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

type DetailTab = 'Overview' | 'Services' | 'Cases' | 'Transactions' | 'Payments' | 'Notes';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Detail Modal State
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('Overview');

  // Form Modal State (Add/Edit)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newCountry, setNewCountry] = useState('United Arab Emirates');
  const [newPhone, setNewPhone] = useState('');
  const [newWhatsApp, setNewWhatsApp] = useState('');
  const [newServices, setNewServices] = useState('e-Visa Processing, Document Translation');

  // Toast Notification
  const [notification, setNotification] = useState<string | null>(null);

  const { hasPermission } = useAuth();

  // Permission Guard for Cost-Related Information
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

  // Filter & Search Logic
  useEffect(() => {
    let result = [...suppliers];

    if (statusFilter !== 'All') {
      result = result.filter(s => s.status === statusFilter);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.supplierName.toLowerCase().includes(q) ||
        s.company.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.services.some(srv => srv.toLowerCase().includes(q))
      );
    }

    setFilteredSuppliers(result);
  }, [suppliers, statusFilter, searchTerm]);

  // Handle Add Supplier
  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await suppliersApi.create({
        supplierName: newSupplierName,
        company: newCompany,
        country: newCountry,
        phone: newPhone,
        whatsApp: newWhatsApp,
        services: newServices.split(',').map(s => s.trim()),
        status: 'Active',
        casesHandled: 0,
        amountPaid: 0,
        amountPayable: 0
      });

      setNotification(`New Supplier "${created.supplierName}" registered successfully!`);
      setTimeout(() => setNotification(null), 5000);
      setIsAddModalOpen(false);
      fetchSuppliers();

      setNewSupplierName('');
      setNewCompany('');
      setNewPhone('');
      setNewWhatsApp('');
    } catch {
      alert('Error registering supplier.');
    }
  };

  // 10 Required Columns
  const columns: Column<Supplier>[] = [
    { 
      key: 'supplierName', 
      header: 'Supplier Name', 
      render: (s) => (
        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{s.supplierName}</span>
      ) 
    },
    { 
      key: 'company', 
      header: 'Company', 
      render: (s) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{s.company}</span>
      ) 
    },
    { 
      key: 'country', 
      header: 'Country', 
      render: (s) => (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{s.country}</span>
      ) 
    },
    { 
      key: 'phone', 
      header: 'Phone', 
      render: (s) => <span className="text-xs font-mono text-slate-700 dark:text-slate-300">{s.phone}</span> 
    },
    { 
      key: 'whatsApp', 
      header: 'WhatsApp', 
      render: (s) => (
        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{s.whatsApp}</span>
      ) 
    },
    { 
      key: 'services', 
      header: 'Services', 
      render: (s) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {s.services.map((srv, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {srv}
            </span>
          ))}
        </div>
      ) 
    },
    // 7. Amount Paid (Permission Guarded)
    { 
      key: 'amountPaid', 
      header: 'Amount Paid', 
      render: (s) => (
        canSeeCosts ? (
          <CurrencyDisplay amount={s.amountPaid || 0} className="text-emerald-600 dark:text-emerald-400 font-bold text-xs" />
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-semibold">
            <Lock className="w-3 h-3" /> Locked
          </span>
        )
      ) 
    },
    // 8. Amount Payable (Permission Guarded)
    { 
      key: 'amountPayable', 
      header: 'Amount Payable', 
      render: (s) => (
        canSeeCosts ? (
          <CurrencyDisplay amount={s.amountPayable || 0} className="text-rose-600 dark:text-rose-400 font-black text-xs" />
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-semibold">
            <Lock className="w-3 h-3" /> Locked
          </span>
        )
      ) 
    },
    { 
      key: 'casesHandled', 
      header: 'Cases Handled', 
      render: (s) => (
        <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
          {s.casesHandled} Cases
        </span>
      ) 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (s) => <StatusBadge status={s.status} /> 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          title="Supplier / Overseas Agent Management"
          subtitle="Directory of e-Visa processing agents, translation bureaus, and VFS fulfillment contractors."
          breadcrumbs={[{ label: 'Suppliers' }]}
          actions={
            <PermissionGuard permission="supplier.create">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Register New Supplier</span>
              </button>
            </PermissionGuard>
          }
        />

        {/* Toast Notification */}
        {notification && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 text-xs font-bold flex items-center justify-between shadow-xs">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-blue-600 font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Search & Status Filter */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search by Supplier, Company, Country, or Service..." 
            className="w-full sm:w-80" 
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredSuppliers}
          isLoading={isLoading}
          emptyText="No suppliers or agents recorded."
          onRowClick={(s) => {
            setSelectedSupplier(s);
            setActiveTab('Overview');
          }}
          actions={(s) => (
            <button
              onClick={() => {
                setSelectedSupplier(s);
                setActiveTab('Overview');
              }}
              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-sky-500/30 text-xs font-semibold hover:bg-blue-100 flex items-center gap-1 transition-all"
              title="View Supplier Detail Tabs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Detail</span>
            </button>
          )}
        />
      </div>

      {/* Supplier Detail Modal (6 Interactive Tabs) */}
      {selectedSupplier && (
        <FormModal
          isOpen={!!selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
          title={`Supplier File — ${selectedSupplier.supplierName}`}
          subtitle={`${selectedSupplier.company} | ${selectedSupplier.country}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* 6 Tabs Navigation Header */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-0.5">
              {(['Overview', 'Services', 'Cases', 'Transactions', 'Payments', 'Notes'] as DetailTab[]).map(tab => {
                const isCostTab = tab === 'Payments' || tab === 'Transactions';
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    <span>{tab}</span>
                    {isCostTab && !canSeeCosts && <Lock className="w-3 h-3 text-slate-400" />}
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'Overview' && (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 font-bold block mb-0.5">Supplier / Contact Person</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{selectedSupplier.supplierName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block mb-0.5">Company Name</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedSupplier.company}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-slate-500 font-bold block mb-0.5">Country & Location</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedSupplier.country}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block mb-0.5">Status</span>
                      <StatusBadge status={selectedSupplier.status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800 font-mono">
                    <div>
                      <span className="text-slate-500 font-bold block mb-0.5">Direct Telephone</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedSupplier.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block mb-0.5">WhatsApp Hotline</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedSupplier.whatsApp}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
                    <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 uppercase block mb-0.5">CASES HANDLED</span>
                    <span className="text-xl font-black font-mono text-purple-600 dark:text-purple-400">{selectedSupplier.casesHandled} Visa Cases</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                    <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase block mb-0.5">FULFILLMENT RATING</span>
                    <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">98.5% Success</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Services */}
            {activeTab === 'Services' && (
              <div className="space-y-3 pt-2">
                <p className="text-slate-600 dark:text-slate-400 font-semibold">Contracted Services & SLAs:</p>
                <div className="space-y-2">
                  {selectedSupplier.services.map((srv, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{srv}</span>
                        <span className="text-[10px] text-slate-500">Service SLA: 24-48 Hours SLA</span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        Active Provider
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Cases */}
            {activeTab === 'Cases' && (
              <div className="space-y-3 pt-2">
                <p className="text-slate-600 dark:text-slate-400 font-semibold">Assigned Client Visa Cases:</p>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">Sanduni De Silva</span>
                      <span className="font-mono text-purple-600 text-[10px]">CAS-9002 (France Schengen Visa)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">In Progress</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">Kamal Gunaratne</span>
                      <span className="font-mono text-purple-600 text-[10px]">CAS-9003 (UK Student Visa)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Approved & Issued</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Transactions */}
            {activeTab === 'Transactions' && (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <p className="text-slate-600 dark:text-slate-400 font-semibold">Work Order Ledger Log:</p>
                  {!canSeeCosts && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Cost Figures Masked
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">Work Order #WO-8012</span>
                      <span className="text-slate-500 text-[10px]">Date: 2026-08-10 | Dubai 30-Day Express e-Visa</span>
                    </div>
                    <span className="font-mono font-bold text-rose-600">
                      {canSeeCosts ? 'LKR 45,000' : '*** HIDDEN ***'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Payments (Strictly Permission Protected) */}
            {activeTab === 'Payments' && (
              <div className="space-y-3 pt-2">
                {canSeeCosts ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
                      <div>
                        <span className="text-slate-500 text-[10px] block">TOTAL OUTSTANDING PAYABLE</span>
                        <span className="text-xl font-black font-mono text-rose-600">LKR {(selectedSupplier.amountPayable || 0).toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] block">CUMULATIVE PAID</span>
                        <span className="text-lg font-bold font-mono text-emerald-600">LKR {(selectedSupplier.amountPaid || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 font-semibold">Payment Remittance History:</p>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">Bank Transfer Payout — Ref #PMT-9002</span>
                        <span className="text-slate-500 text-[10px]">Date: 2026-08-01 | Paid From: Commercial Bank Operating Acc</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600">LKR 120,000</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-center space-y-2">
                    <Lock className="w-8 h-8 text-amber-600 mx-auto" />
                    <h4 className="font-bold text-amber-900 dark:text-amber-100 text-sm">Financial Access Restricted</h4>
                    <p className="text-amber-800 dark:text-amber-200 text-xs">
                      You do not have the required permission (<code className="font-mono text-purple-700">supplier.cost.view</code>) to view cost rates and payout amounts for this supplier.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 6: Notes */}
            {activeTab === 'Notes' && (
              <div className="space-y-3 pt-2">
                <p className="text-slate-600 dark:text-slate-400 font-semibold">Internal Compliance & Operational Notes:</p>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    Verified supplier for e-Visa and document translation services. High reliability SLA score with quick turnaround on urgent application requests. SLA agreement renewed for FY 2026.
                  </p>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 flex justify-between">
                    <span>Verified By: Super Admin</span>
                    <span>Last Updated: 2026-08-15</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
              >
                Close Supplier File
              </button>
            </div>
          </div>
        </FormModal>
      )}

      {/* Register New Supplier Form Modal */}
      {isAddModalOpen && (
        <FormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Register New Supplier / Overseas Agent"
          subtitle="Add contractor profile for outsourced visa services"
          maxWidth="lg"
        >
          <form onSubmit={handleAddSupplier} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Contact Person <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dilshan Mendis"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gulf Express Visa Services"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Country</label>
                <input
                  type="text"
                  required
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+971 4 333 4455"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp</label>
                <input
                  type="text"
                  required
                  placeholder="+971 50 123 4567"
                  value={newWhatsApp}
                  onChange={(e) => setNewWhatsApp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Services Provided (Comma Separated)</label>
              <input
                type="text"
                required
                value={newServices}
                onChange={(e) => setNewServices(e.target.value)}
                placeholder="e-Visa Processing, Document Translation, VFS Booking"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
              >
                Register Supplier
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default SuppliersPage;
