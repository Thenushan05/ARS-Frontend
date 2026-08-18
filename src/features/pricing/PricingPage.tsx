import React, { useState, useEffect } from 'react';
import { 
  Plus, Layers, Lock, Edit, Shield, CheckCircle2, Search, Filter, 
  DollarSign, Calculator, ToggleLeft, ToggleRight, Tag, ArrowRight, Eye
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import { MasterPriceItem, ServiceCategory } from '../../types';
import { pricingApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export const PricingPage: React.FC = () => {
  const [items, setItems] = useState<MasterPriceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const { hasPermission } = useAuth();

  // Permission checks for financial columns
  const canSeeCostPrice = hasPermission('pricing.cost.view');
  const canSeeServiceCharge = hasPermission('pricing.cost.view');
  const canSeeProfit = hasPermission('finance.profit.view');
  const canSeeCosts = canSeeCostPrice || canSeeServiceCharge || canSeeProfit;

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterPriceItem | null>(null);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Categories list definitions (21 total categories under 2 main groups)
  const visaServiceSubcategories = [
    'Tourist Visa Processing',
    'Student Visa Processing',
    'Work Visa Processing',
    'Business Visa',
    'Sponsor Visa',
    'Refusal/Reapplication Support'
  ];

  const additionalServiceSubcategories = [
    'VFS Appointment',
    'Application Form Filling',
    'Cover Letter',
    'SOP',
    'Document Preparation',
    'Translation',
    'Travel Insurance',
    'Hotel Reservation',
    'Flight Reservation',
    'Air Ticket',
    'Land Valuation',
    'Courier',
    'Other Services'
  ];

  const allSubcategories = [...visaServiceSubcategories, ...additionalServiceSubcategories];

  // Professional Price Editor Form State
  const [formData, setFormData] = useState({
    serviceName: '',
    category: 'Visa Services' as ServiceCategory,
    subcategory: 'Tourist Visa Processing',
    sellingPrice: 50000,
    currency: 'LKR',
    status: 'Active' as 'Active' | 'Inactive',
    costPrice: 15000,
    serviceCharge: 35000,
    profit: 35000
  });

  const fetchPricing = async () => {
    setIsLoading(true);
    try {
      const data = await pricingApi.getAll();
      let filtered = [...data];
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(i => 
          i.serviceName.toLowerCase().includes(q) || 
          (i.subcategory && i.subcategory.toLowerCase().includes(q))
        );
      }
      if (groupFilter) {
        filtered = filtered.filter(i => i.category === groupFilter);
      }
      if (subcategoryFilter) {
        filtered = filtered.filter(i => i.subcategory === subcategoryFilter);
      }
      setItems(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, [searchTerm, groupFilter, subcategoryFilter]);

  const handleOpenAddEditModal = (item?: MasterPriceItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        serviceName: item.serviceName,
        category: item.category,
        subcategory: item.subcategory || (item.category === 'Visa Services' ? 'Tourist Visa Processing' : 'Document Preparation'),
        sellingPrice: item.sellingPrice,
        currency: item.currency || 'LKR',
        status: item.status,
        costPrice: item.costPrice || 0,
        serviceCharge: item.serviceCharge || (item.sellingPrice - (item.costPrice || 0)),
        profit: item.profit || (item.sellingPrice - (item.costPrice || 0))
      });
    } else {
      setEditingItem(null);
      setFormData({
        serviceName: '',
        category: 'Visa Services',
        subcategory: 'Tourist Visa Processing',
        sellingPrice: 50000,
        currency: 'LKR',
        status: 'Active',
        costPrice: 15000,
        serviceCharge: 35000,
        profit: 35000
      });
    }
    setIsAddEditModalOpen(true);
  };

  // Live financial margin calculation handler
  const handlePriceChange = (field: 'sellingPrice' | 'costPrice', value: number) => {
    const selling = field === 'sellingPrice' ? value : formData.sellingPrice;
    const cost = field === 'costPrice' ? value : formData.costPrice;
    const margin = Math.max(0, selling - cost);

    setFormData(prev => ({
      ...prev,
      [field]: value,
      serviceCharge: margin,
      profit: margin
    }));
  };

  const handleAddEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceName) return;

    if (editingItem) {
      const updated = await pricingApi.update(editingItem.id, formData);
      setNotification({
        message: `Successfully updated rate for "${updated.serviceName}" in Professional Price Editor!`,
        type: 'success'
      });
    } else {
      const created = await pricingApi.create(formData);
      setNotification({
        message: `Successfully created new service rate "${created.serviceName}"!`,
        type: 'success'
      });
    }

    setIsAddEditModalOpen(false);
    fetchPricing();
    setTimeout(() => setNotification(null), 5000);
  };

  const handleToggleStatus = async (item: MasterPriceItem) => {
    const updated = await pricingApi.toggleStatus(item.id);
    fetchPricing();
    setNotification({
      message: `Service "${item.serviceName}" status changed to ${updated.status}.`,
      type: 'info'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  // Standard 5 Columns + 3 Guarded Financial Columns
  const columns: Column<MasterPriceItem>[] = [
    { 
      key: 'serviceName', 
      header: 'Service Name', 
      render: (p) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{p.serviceName}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">{p.subcategory || p.category}</div>
        </div>
      )
    },
    { 
      key: 'category', 
      header: 'Category', 
      render: (p) => (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
          p.category === 'Visa Services'
            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
        }`}>
          {p.category}
        </span>
      )
    },
    { 
      key: 'sellingPrice', 
      header: 'Selling Price', 
      render: (p) => <CurrencyDisplay amount={p.sellingPrice} currency={p.currency} className="text-blue-600 dark:text-sky-400 font-bold text-sm" /> 
    },
    { 
      key: 'currency', 
      header: 'Currency', 
      render: (p) => <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">{p.currency || 'LKR'}</span> 
    },

    // Guarded Columns (Authorized Users Only)
    ...(canSeeCostPrice ? [{
      key: 'costPrice',
      header: 'Cost Price',
      render: (p: MasterPriceItem) => p.costPrice ? <CurrencyDisplay amount={p.costPrice} currency={p.currency} className="text-slate-600 dark:text-slate-400 text-xs font-medium" /> : <span className="text-slate-400">-</span>
    }] : []),

    ...(canSeeServiceCharge ? [{
      key: 'serviceCharge',
      header: 'Service Charge',
      render: (p: MasterPriceItem) => p.serviceCharge ? <CurrencyDisplay amount={p.serviceCharge} currency={p.currency} className="text-purple-600 dark:text-purple-400 font-bold text-xs" /> : <span className="text-slate-400">-</span>
    }] : []),

    ...(canSeeProfit ? [{
      key: 'profit',
      header: 'Profit',
      render: (p: MasterPriceItem) => p.profit ? <CurrencyDisplay amount={p.profit} currency={p.currency} className="text-emerald-600 dark:text-emerald-400 font-bold text-xs" /> : <span className="text-slate-400">-</span>
    }] : []),

    { 
      key: 'status', 
      header: 'Status', 
      render: (p) => <StatusBadge status={p.status} /> 
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Price List & Catalog"
        subtitle="Manage official service pricing, ancillary fees, cost structures, and profit margins."
        breadcrumbs={[{ label: 'Master Price List' }]}
        actions={
          <PermissionGuard permission="pricing.edit">
            <button
              onClick={() => handleOpenAddEditModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service Rate</span>
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
      {!canSeeCosts ? (
        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="font-medium">
              Cost Price, Service Fee Margins, and Net Profit columns are restricted based on your active role permissions.
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 uppercase">
            Standard View
          </span>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              Authorized Financial Access Active — Cost Price, Service Charge, and Profit columns are visible.
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 uppercase">
            Financial Management View
          </span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <SearchInput 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Search by service name or category..." 
          className="w-full md:w-80" 
        />

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Main Group Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={groupFilter}
              onChange={(e) => {
                setGroupFilter(e.target.value);
                setSubcategoryFilter('');
              }}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Main Groups (2 Groups)</option>
              <option value="Visa Services">Visa Services</option>
              <option value="Additional Services">Additional Services</option>
            </select>
          </div>

          {/* Subcategory Filter (21 total categories) */}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400" />
            <select
              value={subcategoryFilter}
              onChange={(e) => setSubcategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All 21 Categories</option>
              <optgroup label="Visa Services (6 Categories)">
                {visaServiceSubcategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </optgroup>
              <optgroup label="Additional Services (13 Categories)">
                {additionalServiceSubcategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        emptyText="No price catalog rates matching query."
        actions={(p) => (
          <div className="flex items-center gap-2 justify-end">
            <PermissionGuard permission="pricing.edit">
              <button
                onClick={() => handleOpenAddEditModal(p)}
                className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 text-xs font-semibold hover:bg-amber-100 flex items-center gap-1 transition-all"
                title="Open Professional Price Editor"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Price Editor</span>
              </button>

              <button
                onClick={() => handleToggleStatus(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all ${
                  p.status === 'Active'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
                title={p.status === 'Active' ? 'Deactivate Rate' : 'Activate Rate'}
              >
                {p.status === 'Active' ? <ToggleRight className="w-3.5 h-3.5 text-rose-600" /> : <ToggleLeft className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{p.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
              </button>
            </PermissionGuard>
          </div>
        )}
      />

      {/* Professional Price Editor Form Modal */}
      {isAddEditModalOpen && (
        <FormModal
          isOpen={isAddEditModalOpen}
          onClose={() => setIsAddEditModalOpen(false)}
          title={editingItem ? `Professional Price Editor — ${editingItem.serviceName}` : 'Add New Service Rate'}
          maxWidth="2xl"
        >
          <form onSubmit={handleAddEditSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Service Name / Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  placeholder="e.g. Schengen Tourist Visa Full Processing Fee"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Main Group Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const cat = e.target.value as ServiceCategory;
                    setFormData({
                      ...formData,
                      category: cat,
                      subcategory: cat === 'Visa Services' ? 'Tourist Visa Processing' : 'VFS Appointment'
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Visa Services">Visa Services</option>
                  <option value="Additional Services">Additional Services</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Specific Subcategory (21 Categories)</label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
                >
                  {formData.category === 'Visa Services' ? (
                    visaServiceSubcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))
                  ) : (
                    additionalServiceSubcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Selling Price *</label>
                <input
                  type="number"
                  required
                  value={formData.sellingPrice}
                  onChange={(e) => handlePriceChange('sellingPrice', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-blue-600 dark:text-sky-400 font-black text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="LKR">LKR (Sri Lankan Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Service Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Financial Calculator Box (Authorized Users Only) */}
            <PermissionGuard permission="pricing.cost.view">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-purple-700 dark:text-purple-400 uppercase text-[11px] flex items-center gap-1.5">
                    <Calculator className="w-4 h-4" />
                    <span>Financial Margin & Profit Calculator</span>
                  </p>

                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-[10px]">
                    Margin: {formData.sellingPrice > 0 ? ((formData.profit / formData.sellingPrice) * 100).toFixed(1) : 0}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cost Price (Supplier/Gov)</label>
                    <input
                      type="number"
                      value={formData.costPrice}
                      onChange={(e) => handlePriceChange('costPrice', Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Service Fee Margin</label>
                    <input
                      type="number"
                      readOnly
                      value={formData.serviceCharge}
                      className="w-full px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Net Service Profit</label>
                    <input
                      type="number"
                      readOnly
                      value={formData.profit}
                      className="w-full px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-extrabold"
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
                {editingItem ? 'Save Price Changes' : 'Create Service Rate'}
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default PricingPage;
