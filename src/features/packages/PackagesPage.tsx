import React, { useState, useEffect } from 'react';
import { 
  Plus, Package as PackageIcon, CheckCircle2, Tag, Shield, Lock, Search, 
  Filter, Edit, Eye, ToggleLeft, ToggleRight, DollarSign, Calculator, UserCheck, Check
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { PackageItem } from '../../types';
import { packagesApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

interface AvailableServiceOption {
  id: string;
  name: string;
  category: string;
  standardPrice: number;
  internalCost: number;
}

export const PackagesPage: React.FC = () => {
  const [packagesList, setPackagesList] = useState<PackageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { user, hasPermission } = useAuth();

  // Permission checks
  const canSeeInternalCost = hasPermission('pricing.cost.view');
  const canSeeProfit = hasPermission('finance.profit.view');
  const canAuthorizeDiscount = hasPermission(['package.discount', 'pricing.cost.view']);
  const canSeeCosts = canSeeInternalCost || canSeeProfit;

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingPackage, setViewingPackage] = useState<PackageItem | null>(null);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Available Services for multi-selection
  const availableServices: AvailableServiceOption[] = [
    { id: 'srv-1', name: 'Visa Processing', category: 'Visa Services', standardPrice: 75000, internalCost: 25000 },
    { id: 'srv-2', name: 'Appointment Support', category: 'Additional Services', standardPrice: 15000, internalCost: 5000 },
    { id: 'srv-3', name: 'Cover Letter', category: 'Additional Services', standardPrice: 10000, internalCost: 2500 },
    { id: 'srv-4', name: 'Itinerary', category: 'Additional Services', standardPrice: 10000, internalCost: 3000 },
    { id: 'srv-5', name: 'Hotel Reservation', category: 'Additional Services', standardPrice: 12000, internalCost: 4000 },
    { id: 'srv-6', name: 'Travel Insurance', category: 'Additional Services', standardPrice: 25000, internalCost: 15000 },
    { id: 'srv-7', name: 'SOP Drafting', category: 'Additional Services', standardPrice: 15000, internalCost: 4000 },
    { id: 'srv-8', name: 'Translation Service', category: 'Additional Services', standardPrice: 12000, internalCost: 3000 }
  ];

  // Package Creation / Editing Form State
  const [formData, setFormData] = useState({
    packageName: 'France Tourist Visa All-Inclusive Package',
    country: 'France',
    visaType: 'Tourist Visa',
    status: 'Active' as 'Active' | 'Inactive',
    selectedServices: [
      'Visa Processing',
      'Appointment Support',
      'Cover Letter',
      'Itinerary',
      'Hotel Reservation',
      'Travel Insurance'
    ],
    discountType: 'percentage' as 'percentage' | 'amount',
    discountValue: 10, // 10% or fixed amount
    discountReason: 'France Summer Promotional Special Package',
    authorizedBy: user?.name || 'Saman Jayasinghe (Super Admin)'
  });

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const data = await packagesApi.getAll();
      let filtered = [...data];
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
          p.packageName.toLowerCase().includes(q) || 
          p.country.toLowerCase().includes(q) ||
          p.packageId.toLowerCase().includes(q)
        );
      }
      if (statusFilter) {
        filtered = filtered.filter(p => p.status === statusFilter);
      }
      setPackagesList(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [searchTerm, statusFilter]);

  // Dynamic calculations for selected services
  const calculatePackageTotals = () => {
    const selectedObjs = availableServices.filter(s => formData.selectedServices.includes(s.name));
    const normalTotal = selectedObjs.reduce((sum, s) => sum + s.standardPrice, 0);
    const internalCost = selectedObjs.reduce((sum, s) => sum + s.internalCost, 0);

    let calculatedDiscount = 0;
    if (canAuthorizeDiscount && formData.discountValue > 0) {
      if (formData.discountType === 'percentage') {
        calculatedDiscount = Math.round((normalTotal * formData.discountValue) / 100);
      } else {
        calculatedDiscount = formData.discountValue;
      }
    }

    const packagePrice = Math.max(0, normalTotal - calculatedDiscount);
    const estimatedProfit = Math.max(0, packagePrice - internalCost);

    return {
      normalTotal,
      calculatedDiscount,
      packagePrice,
      internalCost,
      estimatedProfit
    };
  };

  const totals = calculatePackageTotals();

  const handleToggleService = (serviceName: string) => {
    setFormData(prev => {
      const exists = prev.selectedServices.includes(serviceName);
      const updated = exists 
        ? prev.selectedServices.filter(s => s !== serviceName)
        : [...prev.selectedServices, serviceName];
      return { ...prev, selectedServices: updated };
    });
  };

  const handleOpenAddEditModal = (pkg?: PackageItem) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        packageName: pkg.packageName,
        country: pkg.country,
        visaType: pkg.visaType,
        status: pkg.status,
        selectedServices: pkg.servicesIncluded || [],
        discountType: pkg.discountType || 'amount',
        discountValue: pkg.discountValue || pkg.discount || 0,
        discountReason: pkg.discountReason || '',
        authorizedBy: pkg.authorizedBy || user?.name || 'Saman Jayasinghe'
      });
    } else {
      setEditingPackage(null);
      setFormData({
        packageName: 'France Tourist Visa Package',
        country: 'France',
        visaType: 'Tourist Visa',
        status: 'Active',
        selectedServices: [
          'Visa Processing',
          'Appointment Support',
          'Cover Letter',
          'Itinerary',
          'Hotel Reservation',
          'Travel Insurance'
        ],
        discountType: 'percentage',
        discountValue: 10,
        discountReason: 'France Summer Promotional Special Package',
        authorizedBy: user?.name || 'Saman Jayasinghe'
      });
    }
    setIsAddEditModalOpen(true);
  };

  const handleAddEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.packageName || formData.selectedServices.length === 0) {
      alert('Please select at least 1 bundled service for this package.');
      return;
    }

    if (totals.calculatedDiscount > 0 && !formData.discountReason.trim()) {
      alert('Discount reason is mandatory when applying package discounts.');
      return;
    }

    const payload: Partial<PackageItem> = {
      packageName: formData.packageName,
      country: formData.country,
      visaType: formData.visaType,
      status: formData.status,
      servicesIncluded: formData.selectedServices,
      normalTotal: totals.normalTotal,
      packagePrice: totals.packagePrice,
      discount: totals.calculatedDiscount,
      finalPrice: totals.packagePrice,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      discountReason: totals.calculatedDiscount > 0 ? formData.discountReason : undefined,
      authorizedBy: totals.calculatedDiscount > 0 ? (formData.authorizedBy || user?.name || 'Super Admin') : undefined,
      internalCost: totals.internalCost,
      estimatedProfit: totals.estimatedProfit
    };

    if (editingPackage) {
      const updated = await packagesApi.update(editingPackage.id, payload);
      if (viewingPackage && viewingPackage.id === editingPackage.id) {
        setViewingPackage(updated);
      }
      setNotification({
        message: `Successfully updated package "${updated.packageName}"!`,
        type: 'success'
      });
    } else {
      const created = await packagesApi.create(payload);
      setNotification({
        message: `Successfully created new package "${created.packageName}" (${created.packageId})!`,
        type: 'success'
      });
    }

    setIsAddEditModalOpen(false);
    fetchPackages();
    setTimeout(() => setNotification(null), 5000);
  };

  const handleToggleStatus = async (pkg: PackageItem) => {
    const updated = await packagesApi.toggleStatus(pkg.id);
    fetchPackages();
    if (viewingPackage && viewingPackage.id === pkg.id) {
      setViewingPackage(updated);
    }
    setNotification({
      message: `Package "${pkg.packageName}" status changed to ${updated.status}.`,
      type: 'info'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  // 9 Standard Columns + 2 Guarded Financial Columns
  const columns: Column<PackageItem>[] = [
    { 
      key: 'packageName', 
      header: 'Package Name', 
      render: (p) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <PackageIcon className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
            <span>{p.packageName}</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-0.5">{p.packageId}</div>
        </div>
      )
    },
    { 
      key: 'country', 
      header: 'Country', 
      render: (p) => <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{p.country}</span> 
    },
    { 
      key: 'visaType', 
      header: 'Visa Type', 
      render: (p) => <span className="text-slate-600 dark:text-slate-400 text-xs">{p.visaType}</span> 
    },
    { 
      key: 'servicesIncluded', 
      header: 'Services Count', 
      render: (p) => (
        <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold">
          {p.servicesIncluded.length} Services Included
        </span>
      )
    },
    { 
      key: 'normalTotal', 
      header: 'Normal Total', 
      render: (p) => <CurrencyDisplay amount={p.normalTotal} className="text-slate-400 text-xs line-through" /> 
    },
    { 
      key: 'packagePrice', 
      header: 'Package Price', 
      render: (p) => <CurrencyDisplay amount={p.packagePrice} className="text-blue-600 dark:text-sky-400 font-bold text-sm" /> 
    },
    { 
      key: 'discount', 
      header: 'Discount', 
      render: (p) => (
        p.discount > 0 ? (
          <div>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">- LKR {p.discount.toLocaleString()}</span>
            <div className="text-[10px] text-slate-500 font-medium">{Math.round((p.discount / p.normalTotal) * 100)}% Off</div>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">No Discount</span>
        )
      )
    },
    { 
      key: 'finalPrice', 
      header: 'Final Price', 
      render: (p) => <CurrencyDisplay amount={p.finalPrice} className="text-slate-900 dark:text-slate-100 font-black text-sm" /> 
    },

    // Guarded Columns (Authorized Users Only)
    ...(canSeeInternalCost ? [{
      key: 'internalCost',
      header: 'Internal Cost',
      render: (p: PackageItem) => p.internalCost ? <CurrencyDisplay amount={p.internalCost} className="text-slate-600 dark:text-slate-400 text-xs font-medium" /> : <span className="text-slate-400">-</span>
    }] : []),

    ...(canSeeProfit ? [{
      key: 'estimatedProfit',
      header: 'Estimated Profit',
      render: (p: PackageItem) => p.estimatedProfit ? <CurrencyDisplay amount={p.estimatedProfit} className="text-emerald-600 dark:text-emerald-400 font-bold text-xs" /> : <span className="text-slate-400">-</span>
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
        title="Package Management"
        subtitle="Configure multi-service visa packages, dynamic price summaries, and authorized discount approvals."
        breadcrumbs={[{ label: 'Packages' }]}
        actions={
          <PermissionGuard permission="package.create">
            <button
              onClick={() => handleOpenAddEditModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Package</span>
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
              Internal supplier cost and estimated net profit columns are hidden based on your current role permissions.
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
              Authorized Financial Access Active — Internal costs, margin analysis, and estimated net profit are visible.
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 uppercase">
            Financial Management View
          </span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <SearchInput 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Search by package name, country, or code..." 
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
        data={packagesList}
        isLoading={isLoading}
        emptyText="No packages matching criteria."
        onRowClick={(p) => {
          setViewingPackage(p);
          setIsViewModalOpen(true);
        }}
        actions={(p) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => {
                setViewingPackage(p);
                setIsViewModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-sky-500/30 hover:bg-blue-100 transition-all"
              title="View Package Details & Services"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <PermissionGuard permission="package.create">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAddEditModal(p);
                }}
                className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 transition-all"
                title="Edit Package"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStatus(p);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all ${
                  p.status === 'Active'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
                title={p.status === 'Active' ? 'Deactivate Package' : 'Activate Package'}
              >
                {p.status === 'Active' ? <ToggleRight className="w-3.5 h-3.5 text-rose-600" /> : <ToggleLeft className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{p.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
              </button>
            </PermissionGuard>
          </div>
        )}
      />

      {/* Create / Edit Package Modal with Multi-Service Selection & Dynamic Calculator */}
      {isAddEditModalOpen && (
        <FormModal
          isOpen={isAddEditModalOpen}
          onClose={() => setIsAddEditModalOpen(false)}
          title={editingPackage ? `Edit Package — ${editingPackage.packageName}` : 'Build New Visa Package'}
          maxWidth="3xl"
        >
          <form onSubmit={handleAddEditSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Package Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.packageName}
                  onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                  placeholder="e.g. France Tourist Visa All-Inclusive Package"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
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
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Country</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Visa Type</label>
                <input
                  type="text"
                  required
                  value={formData.visaType}
                  onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Multi-Service Selection Checkbox Grid */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Select Services to Bundle ({formData.selectedServices.length} Selected)</span>
                </label>
                <span className="text-[11px] text-slate-500 font-medium">Check multiple services to combine</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto">
                {availableServices.map(srv => {
                  const isChecked = formData.selectedServices.includes(srv.name);
                  return (
                    <label 
                      key={srv.id}
                      onClick={() => handleToggleService(srv.name)}
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer select-none transition-all ${
                        isChecked 
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-bold text-xs">{srv.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">LKR {srv.standardPrice.toLocaleString()}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Package Summary Calculation Card */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <p className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <span>Dynamic Package Summary Calculation</span>
                </span>
                <span className="text-blue-600 font-bold font-mono">
                  Standard Sum: LKR {totals.normalTotal.toLocaleString()}
                </span>
              </p>

              {/* Discount Authorization Manager */}
              {canAuthorizeDiscount ? (
                <div className="space-y-3 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-700 dark:text-purple-400 text-xs flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Authorized Discount Manager</span>
                    </span>
                    <span className="text-[11px] text-slate-500">Recorded with Authorizer Signature</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Discount Type</label>
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="amount">Fixed Amount (LKR)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {formData.discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (LKR)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Authorizer Name</label>
                      <input
                        type="text"
                        readOnly
                        value={formData.authorizedBy}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-purple-700 dark:text-purple-300 font-bold"
                      />
                    </div>
                  </div>

                  {totals.calculatedDiscount > 0 && (
                    <div>
                      <label className="block text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-1">
                        Discount Justification Reason * (Mandatory for Audit Trail)
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.discountReason}
                        onChange={(e) => setFormData({ ...formData, discountReason: e.target.value })}
                        placeholder="Reason for concession (e.g. Managing Director approved promotional special)..."
                        className="w-full px-3 py-1.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 text-[11px] flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Discount entry is restricted to authorized financial managers.</span>
                </div>
              )}

              {/* Dynamic Rates Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Normal Sum</span>
                  <span className="text-xs font-bold text-slate-600 line-through">LKR {totals.normalTotal.toLocaleString()}</span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-emerald-600 block uppercase font-sans">Discount Off</span>
                  <span className="text-xs font-bold text-emerald-600">- LKR {totals.calculatedDiscount.toLocaleString()}</span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-blue-600 block uppercase font-sans">Package Price</span>
                  <span className="text-sm font-black text-blue-600">LKR {totals.packagePrice.toLocaleString()}</span>
                </div>

                {canSeeProfit && (
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-emerald-600 block uppercase font-sans">Net Est. Profit</span>
                    <span className="text-xs font-bold text-emerald-600">LKR {totals.estimatedProfit.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

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
                {editingPackage ? 'Save Package Changes' : 'Save & Activate Package'}
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {/* View Package Detail Modal */}
      {isViewModalOpen && viewingPackage && (
        <FormModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Package Details — ${viewingPackage.packageName} (${viewingPackage.packageId})`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <PackageIcon className="w-5 h-5 text-blue-600 dark:text-sky-400" />
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{viewingPackage.packageName}</span>
                  <StatusBadge status={viewingPackage.status} />
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">{viewingPackage.country} — {viewingPackage.visaType}</p>
              </div>

              <div className="text-right">
                <CurrencyDisplay amount={viewingPackage.packagePrice} className="text-base font-black text-blue-600 dark:text-sky-400" />
                {viewingPackage.normalTotal > viewingPackage.packagePrice && (
                  <div className="text-[11px] text-slate-400 line-through">LKR {viewingPackage.normalTotal.toLocaleString()}</div>
                )}
              </div>
            </div>

            {/* Bundled Services List */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Included Services ({viewingPackage.servicesIncluded.length} Bundled Items)</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {viewingPackage.servicesIncluded.map((srv, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount Authorization Audit Trail */}
            {viewingPackage.discount > 0 && (
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
                <p className="font-bold text-purple-900 dark:text-purple-300 uppercase text-[11px] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Discount Authorization Audit Log</span>
                </p>
                <div className="space-y-1 text-slate-800 dark:text-slate-200">
                  <div><span className="text-slate-500">Discount Concession:</span> <span className="font-bold text-emerald-600">LKR {viewingPackage.discount.toLocaleString()} Off</span></div>
                  <div><span className="text-slate-500">Authorization Reason:</span> <span className="font-semibold italic text-purple-800 dark:text-purple-300">{viewingPackage.discountReason || 'Promotional Special'}</span></div>
                  <div><span className="text-slate-500">Authorized By Staff:</span> <span className="font-bold text-slate-900 dark:text-slate-100">{viewingPackage.authorizedBy || 'Super Admin'}</span></div>
                </div>
              </div>
            )}

            {/* Financial Analysis for Authorized Users */}
            {canSeeCosts && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 font-mono">
                <p className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] font-sans">Financial Profit Summary</p>
                {canSeeInternalCost && <div className="flex justify-between text-xs"><span>Internal Supplier Cost:</span><span className="font-bold">LKR {(viewingPackage.internalCost || 0).toLocaleString()}</span></div>}
                {canSeeProfit && <div className="flex justify-between text-xs font-bold text-emerald-600 pt-1 border-t border-slate-200 dark:border-slate-800"><span>Estimated Net Profit:</span><span>LKR {(viewingPackage.estimatedProfit || 0).toLocaleString()}</span></div>}
              </div>
            )}
          </div>
        </FormModal>
      )}
    </div>
  );
};

export default PackagesPage;
