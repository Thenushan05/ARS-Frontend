import React, { useState, useEffect } from 'react';
import { 
  Plus, Globe, Shield, Lock, CheckCircle2, Search, Filter, Edit, Eye, 
  ToggleLeft, ToggleRight, DollarSign, Clock, Calendar, AlertCircle, ExternalLink, Trash2
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import { EVisaService } from '../../types';
import { eVisaApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export const EVisaPage: React.FC = () => {
  const [evisas, setEvisas] = useState<EVisaService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { hasPermission } = useAuth();

  // Permissions for financial columns
  const canSeeGovFee = hasPermission('pricing.cost.view');
  const canSeeSupplierCost = hasPermission('supplier.cost.view');
  const canSeeOtherCost = hasPermission('pricing.cost.view');
  const canSeeServiceCharge = hasPermission('pricing.cost.view');
  const canSeeProfit = hasPermission('finance.profit.view');
  const canSeeFinancialCosts = canSeeGovFee || canSeeSupplierCost || canSeeProfit;

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingEVisa, setEditingEVisa] = useState<EVisaService | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingEVisa, setViewingEVisa] = useState<EVisaService | null>(null);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    country: 'United Arab Emirates',
    visaName: '30 Days Tourist e-Visa',
    entryType: 'Single Entry' as 'Single Entry' | 'Double Entry' | 'Multiple Entry',
    validity: '60 Days',
    stayPeriod: '30 Days',
    processingTime: '24-48 Hours',
    customerSellingPrice: 35000,
    currency: 'LKR',
    status: 'Active' as 'Active' | 'Inactive',
    applicationLink: '',
    // Guarded fields
    governmentFee: 18000,
    supplierCost: 5000,
    otherCost: 2000,
    arsServiceCharge: 10000,
    estimatedProfit: 12000
  });

  const fetchEVisas = async () => {
    setIsLoading(true);
    try {
      const data = await eVisaApi.getAll();
      let filtered = [...data];
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(e => e.country.toLowerCase().includes(q) || e.visaName.toLowerCase().includes(q));
      }
      if (statusFilter) {
        filtered = filtered.filter(e => e.status === statusFilter);
      }
      setEvisas(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEVisas();
  }, [searchTerm, statusFilter]);

  const handleOpenAddEditModal = (evisa?: EVisaService) => {
    if (evisa) {
      setEditingEVisa(evisa);
      setFormData({
        country: evisa.country,
        visaName: evisa.visaName,
        entryType: evisa.entryType,
        validity: evisa.validity,
        stayPeriod: evisa.stayPeriod,
        processingTime: evisa.processingTime,
        customerSellingPrice: evisa.customerSellingPrice,
        currency: evisa.currency || 'LKR',
        status: evisa.status,
        applicationLink: evisa.applicationLink || '',
        governmentFee: evisa.governmentFee || 0,
        supplierCost: evisa.supplierCost || 0,
        otherCost: evisa.otherCost || 0,
        arsServiceCharge: evisa.arsServiceCharge || 0,
        estimatedProfit: evisa.estimatedProfit || 0
      });
    } else {
      setEditingEVisa(null);
      setFormData({
        country: 'United Arab Emirates',
        visaName: '30 Days Tourist e-Visa',
        entryType: 'Single Entry',
        validity: '60 Days',
        stayPeriod: '30 Days',
        processingTime: '24-48 Hours',
        customerSellingPrice: 35000,
        currency: 'LKR',
        status: 'Active',
        applicationLink: '',
        governmentFee: 18000,
        supplierCost: 5000,
        otherCost: 2000,
        arsServiceCharge: 10000,
        estimatedProfit: 12000
      });
    }
    setIsAddEditModalOpen(true);
  };

  const handleAddEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.country || !formData.visaName) return;

    if (editingEVisa) {
      const updated = await eVisaApi.update(editingEVisa.id, formData);
      if (viewingEVisa && viewingEVisa.id === editingEVisa.id) {
        setViewingEVisa(updated);
      }
      setNotification({
        message: `Successfully updated e-Visa product "${updated.country} — ${updated.visaName}"!`,
        type: 'success'
      });
    } else {
      const created = await eVisaApi.create(formData);
      setNotification({
        message: `Successfully created new e-Visa product for ${created.country}!`,
        type: 'success'
      });
    }

    setIsAddEditModalOpen(false);
    fetchEVisas();
    setTimeout(() => setNotification(null), 5000);
  };

  const handleToggleStatus = async (evisa: EVisaService) => {
    const updated = await eVisaApi.toggleStatus(evisa.id);
    fetchEVisas();
    if (viewingEVisa && viewingEVisa.id === evisa.id) {
      setViewingEVisa(updated);
    }
    setNotification({
      message: `e-Visa "${evisa.country} — ${evisa.visaName}" status changed to ${updated.status}.`,
      type: 'info'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDelete = async (evisa: EVisaService) => {
    if (window.confirm(`Are you sure you want to delete ${evisa.country} — ${evisa.visaName}?`)) {
      await eVisaApi.delete(evisa.id);
      fetchEVisas();
      setNotification({
        message: `Successfully deleted e-Visa product "${evisa.country} — ${evisa.visaName}".`,
        type: 'info'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Standard 10 Fields + 5 Guarded Financial Columns
  const columns: Column<EVisaService>[] = [
    { 
      key: 'country', 
      header: 'Country', 
      render: (ev) => (
        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-blue-600 dark:text-sky-400" />
          <span>{ev.country}</span>
        </div>
      )
    },
    { 
      key: 'visaName', 
      header: 'Visa Name', 
      render: (ev) => <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{ev.visaName}</span> 
    },
    {
      key: 'applicationLink',
      header: 'Application Link',
      render: (ev) => ev.applicationLink ? (
        <a 
          href={ev.applicationLink} 
          target="_blank" 
          rel="noreferrer"
          className="text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3 h-3" />
          Apply Now
        </a>
      ) : <span className="text-slate-400 text-xs">-</span>
    },
    { 
      key: 'entryType', 
      header: 'Entry Type', 
      render: (ev) => <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">{ev.entryType}</span> 
    },
    { 
      key: 'validity', 
      header: 'Validity', 
      render: (ev) => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{ev.validity}</span> 
    },
    { 
      key: 'stayPeriod', 
      header: 'Stay Period', 
      render: (ev) => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{ev.stayPeriod}</span> 
    },
    { 
      key: 'processingTime', 
      header: 'Processing Time', 
      render: (ev) => <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{ev.processingTime}</span> 
    },
    { 
      key: 'customerSellingPrice', 
      header: 'Customer Selling Price', 
      render: (ev) => <CurrencyDisplay amount={ev.customerSellingPrice} currency={ev.currency} className="text-blue-600 dark:text-sky-400 font-bold" /> 
    },
    { 
      key: 'currency', 
      header: 'Currency', 
      render: (ev) => <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">{ev.currency || 'LKR'}</span> 
    },

    // Guarded Columns (Authorized Users Only)
    ...(canSeeGovFee ? [{
      key: 'governmentFee',
      header: 'Government Fee',
      render: (ev: EVisaService) => ev.governmentFee ? <CurrencyDisplay amount={ev.governmentFee} currency={ev.currency} className="text-slate-600 dark:text-slate-400 text-xs" /> : <span className="text-slate-400">-</span>
    }] : []),

    ...(canSeeSupplierCost ? [{
      key: 'supplierCost',
      header: 'Supplier Cost',
      render: (ev: EVisaService) => ev.supplierCost ? <CurrencyDisplay amount={ev.supplierCost} currency={ev.currency} className="text-slate-600 dark:text-slate-400 text-xs" /> : <span className="text-slate-400">-</span>
    }] : []),

    ...(canSeeOtherCost ? [{
      key: 'otherCost',
      header: 'Other Cost',
      render: (ev: EVisaService) => ev.otherCost ? <CurrencyDisplay amount={ev.otherCost} currency={ev.currency} className="text-slate-600 dark:text-slate-400 text-xs" /> : <span className="text-slate-400">-</span>
    }] : []),

    ...(canSeeServiceCharge ? [{
      key: 'arsServiceCharge',
      header: 'ARS Service Charge',
      render: (ev: EVisaService) => ev.arsServiceCharge ? <CurrencyDisplay amount={ev.arsServiceCharge} currency={ev.currency} className="text-blue-600 font-bold text-xs" /> : <span className="text-slate-400">-</span>
    }] : []),

    ...(canSeeProfit ? [{
      key: 'estimatedProfit',
      header: 'Estimated Profit',
      render: (ev: EVisaService) => ev.estimatedProfit ? <CurrencyDisplay amount={ev.estimatedProfit} currency={ev.currency} className="text-emerald-600 dark:text-emerald-400 font-bold text-xs" /> : <span className="text-slate-400">-</span>
    }] : []),

    { 
      key: 'lastUpdated', 
      header: 'Last Updated', 
      render: (ev) => <span className="text-xs text-slate-500">{ev.lastUpdated}</span> 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (ev) => <StatusBadge status={ev.status} /> 
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="e-Visa Service Catalog"
        subtitle="Manage instant e-Visa products, processing turnaround times, selling rates, and supplier costs."
        breadcrumbs={[{ label: 'e-Visa Catalog' }]}
        actions={
          <PermissionGuard permission="evisa.manage">
            <button
              onClick={() => handleOpenAddEditModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add e-Visa Product</span>
            </button>
          </PermissionGuard>
        }
      />

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Financial Privacy Notice */}
      {!canSeeFinancialCosts ? (
        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="font-medium">
              Internal supplier costs, government fees, and profit margins are hidden based on your current role permissions.
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 uppercase">
            Normal User View
          </span>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              Authorized Financial Access Active — Government fees, supplier costs, and profit calculations are visible.
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 uppercase">
            Authorized Financial Role
          </span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <SearchInput 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Search by country or visa product name..." 
          className="w-full sm:w-80" 
        />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={evisas}
        isLoading={isLoading}
        emptyText="No e-Visa products matching query."
        onRowClick={(ev) => {
          setViewingEVisa(ev);
          setIsViewModalOpen(true);
        }}
        actions={(ev) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => {
                setViewingEVisa(ev);
                setIsViewModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-sky-500/30 hover:bg-blue-100 transition-all"
              title="View e-Visa Details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <PermissionGuard permission="evisa.manage">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAddEditModal(ev);
                }}
                className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 transition-all"
                title="Edit e-Visa Product"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStatus(ev);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all ${
                  ev.status === 'Active'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
                title={ev.status === 'Active' ? 'Deactivate Product' : 'Activate Product'}
              >
                {ev.status === 'Active' ? <ToggleRight className="w-3.5 h-3.5 text-rose-600" /> : <ToggleLeft className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{ev.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(ev);
                }}
                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-100 transition-all"
                title="Delete e-Visa Product"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </PermissionGuard>
          </div>
        )}
      />

      {/* Add / Edit e-Visa Form Modal */}
      {isAddEditModalOpen && (
        <FormModal
          isOpen={isAddEditModalOpen}
          onClose={() => setIsAddEditModalOpen(false)}
          title={editingEVisa ? `Edit e-Visa Product — ${editingEVisa.country}` : 'Add New e-Visa Product'}
          maxWidth="2xl"
        >
          <form onSubmit={handleAddEditSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Destination Country <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g. United Arab Emirates"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Visa Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.visaName}
                  onChange={(e) => setFormData({ ...formData, visaName: e.target.value })}
                  placeholder="e.g. 30 Days Tourist e-Visa"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Entry Type</label>
                <select
                  value={formData.entryType}
                  onChange={(e) => setFormData({ ...formData, entryType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Single Entry">Single Entry</option>
                  <option value="Double Entry">Double Entry</option>
                  <option value="Multiple Entry">Multiple Entry</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Validity Duration</label>
                <input
                  type="text"
                  value={formData.validity}
                  onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                  placeholder="e.g. 60 Days"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Stay Period</label>
                <input
                  type="text"
                  value={formData.stayPeriod}
                  onChange={(e) => setFormData({ ...formData, stayPeriod: e.target.value })}
                  placeholder="e.g. 30 Days"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Processing Time</label>
                <input
                  type="text"
                  value={formData.processingTime}
                  onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                  placeholder="e.g. 24-48 Hours"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Selling Price *</label>
                <input
                  type="number"
                  required
                  value={formData.customerSellingPrice}
                  onChange={(e) => setFormData({ ...formData, customerSellingPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="LKR">LKR (Sri Lankan Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="AED">AED (UAE Dirham)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Application Link
                </label>
                <input
                  type="url"
                  value={formData.applicationLink}
                  onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Financial Cost Fields (Authorized User Only) */}
            <PermissionGuard permission="pricing.cost.view">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 mt-2">
                <p className="font-bold text-purple-700 dark:text-purple-400 uppercase text-[11px] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Authorized Financial Cost & Profit Parameters</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Government Fee</label>
                    <input
                      type="number"
                      value={formData.governmentFee}
                      onChange={(e) => setFormData({ ...formData, governmentFee: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Supplier Cost</label>
                    <input
                      type="number"
                      value={formData.supplierCost}
                      onChange={(e) => setFormData({ ...formData, supplierCost: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Other Cost</label>
                    <input
                      type="number"
                      value={formData.otherCost}
                      onChange={(e) => setFormData({ ...formData, otherCost: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ARS Service Charge</label>
                    <input
                      type="number"
                      value={formData.arsServiceCharge}
                      onChange={(e) => setFormData({ ...formData, arsServiceCharge: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimated Profit</label>
                    <input
                      type="number"
                      value={formData.estimatedProfit}
                      onChange={(e) => setFormData({ ...formData, estimatedProfit: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 font-bold"
                    />
                  </div>
                </div>
              </div>
            </PermissionGuard>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20"
              >
                {editingEVisa ? 'Update Product' : 'Save e-Visa Product'}
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {/* View e-Visa Details Modal */}
      {isViewModalOpen && viewingEVisa && (
        <FormModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`e-Visa Product — ${viewingEVisa.country} (${viewingEVisa.visaName})`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-sky-400" />
                  <span className="font-black text-sm text-slate-900 dark:text-slate-100">{viewingEVisa.country}</span>
                  <StatusBadge status={viewingEVisa.status} />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">{viewingEVisa.visaName}</p>
              </div>

              <CurrencyDisplay amount={viewingEVisa.customerSellingPrice} currency={viewingEVisa.currency} className="text-base font-black text-blue-600 dark:text-sky-400" />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px]">Product Specifications</p>
              <div><span className="text-slate-500">Entry Type:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{viewingEVisa.entryType}</span></div>
              <div><span className="text-slate-500">Validity Duration:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{viewingEVisa.validity}</span></div>
              <div><span className="text-slate-500">Max Stay Period:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{viewingEVisa.stayPeriod}</span></div>
              <div><span className="text-slate-500">Processing Time:</span> <span className="font-bold text-amber-600 dark:text-amber-400">{viewingEVisa.processingTime}</span></div>
              {viewingEVisa.applicationLink && (
                <div>
                  <span className="text-slate-500">Application Link:</span>{' '}
                  <a href={viewingEVisa.applicationLink} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-sky-400 hover:underline font-medium">
                    {viewingEVisa.applicationLink}
                  </a>
                </div>
              )}
              <div><span className="text-slate-500">Last Updated:</span> <span className="text-slate-800 dark:text-slate-200">{viewingEVisa.lastUpdated}</span></div>
            </div>

            {/* Financial Breakdown for Authorized Users */}
            {canSeeFinancialCosts ? (
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
                <p className="font-bold text-purple-900 dark:text-purple-300 uppercase text-[11px] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Authorized Financial Cost & Profit Analysis</span>
                </p>
                <div className="divide-y divide-purple-200 dark:divide-purple-900/60 font-medium">
                  {canSeeGovFee && <div className="py-1 flex justify-between"><span>Government Fee</span><span>LKR {(viewingEVisa.governmentFee || 0).toLocaleString()}</span></div>}
                  {canSeeSupplierCost && <div className="py-1 flex justify-between"><span>Supplier Cost</span><span>LKR {(viewingEVisa.supplierCost || 0).toLocaleString()}</span></div>}
                  {canSeeOtherCost && <div className="py-1 flex justify-between"><span>Other Operational Cost</span><span>LKR {(viewingEVisa.otherCost || 0).toLocaleString()}</span></div>}
                  {canSeeServiceCharge && <div className="py-1 flex justify-between"><span>ARS Service Charge</span><span className="font-bold text-blue-600">LKR {(viewingEVisa.arsServiceCharge || 0).toLocaleString()}</span></div>}
                  {canSeeProfit && <div className="py-1.5 flex justify-between font-bold text-emerald-700 dark:text-emerald-400 border-t border-purple-200 pt-1.5"><span>Estimated Net Profit</span><span>LKR {(viewingEVisa.estimatedProfit || 0).toLocaleString()}</span></div>}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 text-[11px] flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Supplier cost and margin details are restricted to authorized financial roles.</span>
              </div>
            )}
          </div>
        </FormModal>
      )}
    </div>
  );
};

export default EVisaPage;
