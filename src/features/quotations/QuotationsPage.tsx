import React, { useState, useEffect } from 'react';
import { 
  Plus, FileText, Printer, Download, CheckCircle, CheckCircle2, Send, XCircle, 
  Search, Filter, Share2, Check, ArrowRight, Eye, Trash2, Globe, Clock, RefreshCw, Copy
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { Quotation, QuotationStatus, Customer, PackageItem } from '../../types';
import { quotationsApi, customersApi, packagesApi } from '../../api';

interface LineItem {
  serviceName: string;
  price: number;
}

export const QuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Quotation for Preview & Share Modals
  const [selectedQuo, setSelectedQuo] = useState<Quotation | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Quotation Builder Form State
  const [builderData, setBuilderData] = useState({
    customerId: '',
    customerName: 'Sanduni De Silva',
    country: 'France',
    visaType: 'Tourist Visa',
    selectedPackageId: '',
    packageName: '',
    services: [
      { serviceName: 'Tourist Visa Processing Fee', price: 75000 },
      { serviceName: 'VFS Appointment Support', price: 15000 },
      { serviceName: 'Cover Letter & SOP Drafting', price: 20000 },
      { serviceName: 'Travel Insurance Premium Policy', price: 25000 }
    ] as LineItem[],
    discount: 22000,
    validityDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    paymentTerms: '50% advance upon registration, 50% prior to VFS appointment submission.',
    termsAndConditions: '1. All government and VFS fees are subject to official embassy rate updates.\n2. Service fees are non-refundable once document processing has commenced.'
  });

  const quotationStatuses: QuotationStatus[] = [
    'Draft',
    'Sent',
    'Accepted',
    'Rejected',
    'Expired',
    'Converted'
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [quoRes, custRes, pkgRes] = await Promise.all([
        quotationsApi.getAll(),
        customersApi.getAll(),
        packagesApi.getAll()
      ]);

      let filtered = [...quoRes];
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(item => 
          item.quotationNumber.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.country.toLowerCase().includes(q)
        );
      }
      if (statusFilter) {
        filtered = filtered.filter(item => item.status === statusFilter);
      }

      setQuotations(filtered);
      setCustomers(custRes.data);
      setPackages(pkgRes);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, statusFilter]);

  // Calculate Subtotal & Total
  const subtotal = builderData.services.reduce((sum, item) => sum + (item.price || 0), 0);
  const total = Math.max(0, subtotal - (builderData.discount || 0));

  const handleAddLineItem = () => {
    setBuilderData(prev => ({
      ...prev,
      services: [...prev.services, { serviceName: '', price: 10000 }]
    }));
  };

  const handleRemoveLineItem = (index: number) => {
    setBuilderData(prev => ({
      ...prev,
      services: prev.services.filter((_, idx) => idx !== index)
    }));
  };

  const handleLineItemChange = (index: number, field: 'serviceName' | 'price', value: any) => {
    setBuilderData(prev => {
      const updated = [...prev.services];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, services: updated };
    });
  };

  const handleSelectPackage = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      const packageServices: LineItem[] = pkg.servicesIncluded.map(srv => ({
        serviceName: srv,
        price: Math.round(pkg.normalTotal / pkg.servicesIncluded.length)
      }));

      setBuilderData(prev => ({
        ...prev,
        selectedPackageId: packageId,
        packageName: pkg.packageName,
        country: pkg.country,
        visaType: pkg.visaType,
        services: packageServices,
        discount: pkg.discount
      }));
    }
  };

  const handleSaveQuotation = async (status: QuotationStatus) => {
    if (!builderData.customerName || builderData.services.length === 0) {
      alert('Please fill in customer name and add at least 1 service item.');
      return;
    }

    const payload: Partial<Quotation> = {
      customerName: builderData.customerName,
      customerId: builderData.customerId || 'cust-1',
      country: builderData.country,
      visaType: builderData.visaType,
      services: builderData.services,
      packageName: builderData.packageName || undefined,
      subtotal,
      discount: builderData.discount,
      total,
      validityDate: builderData.validityDate,
      paymentTerms: builderData.paymentTerms,
      termsAndConditions: builderData.termsAndConditions,
      status: status
    };

    const created = await quotationsApi.create(payload);
    setIsBuilderModalOpen(false);
    fetchData();
    setNotification({
      message: `Quotation ${created.quotationNumber} saved with status "${status}"!`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleConvertQuotation = async (quo: Quotation) => {
    if (confirm(`Convert accepted quotation ${quo.quotationNumber} into Invoice & Active Case?`)) {
      const updated = await quotationsApi.convert(quo.id);
      fetchData();
      if (selectedQuo && selectedQuo.id === quo.id) {
        setSelectedQuo(updated);
      }
      setNotification({
        message: `Quotation ${quo.quotationNumber} converted to Status: Converted!`,
        type: 'success'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleUpdateStatus = async (quoId: string, status: QuotationStatus) => {
    const updated = await quotationsApi.updateStatus(quoId, status);
    fetchData();
    if (selectedQuo && selectedQuo.id === quoId) {
      setSelectedQuo(updated);
    }
    setNotification({
      message: `Quotation ${updated.quotationNumber} status updated to ${status}.`,
      type: 'info'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  // 8 Required Columns
  const columns: Column<Quotation>[] = [
    { 
      key: 'quotationNumber', 
      header: 'Quotation Number', 
      render: (q) => <span className="font-mono text-blue-600 dark:text-sky-400 font-bold">{q.quotationNumber}</span> 
    },
    { 
      key: 'customerName', 
      header: 'Customer', 
      render: (q) => <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{q.customerName}</span> 
    },
    { 
      key: 'country', 
      header: 'Country', 
      render: (q) => <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{q.country}</span> 
    },
    { 
      key: 'visaType', 
      header: 'Visa Type', 
      render: (q) => <span className="text-slate-600 dark:text-slate-400 text-xs">{q.visaType}</span> 
    },
    { 
      key: 'total', 
      header: 'Total', 
      render: (q) => <CurrencyDisplay amount={q.total} className="text-blue-600 dark:text-sky-400 font-bold text-sm" /> 
    },
    { 
      key: 'validityDate', 
      header: 'Validity', 
      render: (q) => (
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{q.validityDate}</span>
        </span>
      ) 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (q) => <StatusBadge status={q.status} /> 
    },
    { 
      key: 'createdAt', 
      header: 'Created Date', 
      render: (q) => <span className="text-xs text-slate-500">{q.createdAt}</span> 
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotation Management"
        subtitle="Create custom client estimates, bundled package proposals, and convert accepted quotes to official invoices."
        breadcrumbs={[{ label: 'Quotations' }]}
        actions={
          <PermissionGuard permission="quotation.create">
            <button
              onClick={() => setIsBuilderModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quotation</span>
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

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <SearchInput 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Search by quote # (QT-2026-0045), customer, or country..." 
          className="w-full sm:w-80" 
        />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All 6 Statuses</option>
            {quotationStatuses.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={quotations}
        isLoading={isLoading}
        emptyText="No quotations matching query."
        onRowClick={(q) => setSelectedQuo(q)}
        actions={(q) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setSelectedQuo(q)}
              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-sky-500/30 text-xs font-semibold hover:bg-blue-100 flex items-center gap-1 transition-all"
              title="Live Document Preview & Print"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedQuo(q);
                setIsShareModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 hover:bg-purple-100 transition-all"
              title="Share via WhatsApp / Email"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {q.status !== 'Converted' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleConvertQuotation(q);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1 transition-all"
                title="Convert to Invoice & Case"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Convert</span>
              </button>
            )}
          </div>
        )}
      />

      {/* Interactive Quotation Builder Modal */}
      {isBuilderModalOpen && (
        <FormModal
          isOpen={isBuilderModalOpen}
          onClose={() => setIsBuilderModalOpen(false)}
          title="Interactive Quotation Builder"
          maxWidth="4xl"
        >
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Input Side */}
              <div className="space-y-4">
                <p className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] border-b border-slate-200 dark:border-slate-800 pb-1">
                  1. Client & Country Configuration
                </p>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Customer <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={builderData.customerId}
                    onChange={(e) => {
                      const cust = customers.find(c => c.id === e.target.value);
                      if (cust) {
                        setBuilderData({
                          ...builderData,
                          customerId: cust.id,
                          customerName: cust.name,
                          country: cust.applyingCountry || builderData.country
                        });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Choose Registered Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.customerId}) — {c.phone}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Destination Country</label>
                    <input
                      type="text"
                      value={builderData.country}
                      onChange={(e) => setBuilderData({ ...builderData, country: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Visa Type</label>
                    <input
                      type="text"
                      value={builderData.visaType}
                      onChange={(e) => setBuilderData({ ...builderData, visaType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Auto-populate Package Selection */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Auto-Populate From Package (Optional)
                  </label>
                  <select
                    value={builderData.selectedPackageId}
                    onChange={(e) => handleSelectPackage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 font-semibold focus:outline-none"
                  >
                    <option value="">-- Custom Individual Services --</option>
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.packageName} (LKR {p.packagePrice.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                {/* Service Line Items */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px]">
                      2. Service Line Items & Individual Pricing
                    </p>
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 font-bold text-[11px] hover:bg-blue-100 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {builderData.services.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.serviceName}
                          onChange={(e) => handleLineItemChange(idx, 'serviceName', e.target.value)}
                          placeholder="Service title..."
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
                        />
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleLineItemChange(idx, 'price', Number(e.target.value))}
                          placeholder="Price"
                          className="w-28 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 font-bold text-right"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discount, Terms & Validity */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Package Concession / Discount (LKR)</label>
                    <input
                      type="number"
                      value={builderData.discount}
                      onChange={(e) => setBuilderData({ ...builderData, discount: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-emerald-600 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Validity Date (Valid Until)</label>
                    <input
                      type="date"
                      value={builderData.validityDate}
                      onChange={(e) => setBuilderData({ ...builderData, validityDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={builderData.paymentTerms}
                    onChange={(e) => setBuilderData({ ...builderData, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Terms & Conditions</label>
                  <textarea
                    rows={2}
                    value={builderData.termsAndConditions}
                    onChange={(e) => setBuilderData({ ...builderData, termsAndConditions: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Dynamic Live Document Preview Side */}
              <div className="space-y-4">
                <p className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center justify-between">
                  <span>Dynamic Live Document Preview</span>
                  <span className="font-mono text-blue-600 font-bold text-[10px]">QT-2026-LIVE</span>
                </p>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-lg text-slate-900 space-y-4">
                  {/* Letterhead Header */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                    <div>
                      <div className="font-black text-lg text-blue-900 tracking-tight">ARS VISA & CONSULTANTS</div>
                      <p className="text-[10px] text-slate-500">Access Towers, Colombo 02 | Hotline: +94 11 234 5678</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-blue-600">OFFICIAL ESTIMATE</span>
                      <p className="text-[10px] text-slate-500">Valid Until: {builderData.validityDate}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Prepared For:</p>
                    <p className="font-bold text-slate-900">{builderData.customerName}</p>
                    <p className="text-[11px] text-slate-600">{builderData.country} — {builderData.visaType}</p>
                  </div>

                  {/* Line Items Table Preview */}
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                        <th className="py-1">Service Description</th>
                        <th className="py-1 text-right">Amount (LKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {builderData.services.map((s, idx) => (
                        <tr key={idx}>
                          <td className="py-1 text-slate-800 font-medium">{s.serviceName || 'Untitled Service'}</td>
                          <td className="py-1 text-right font-mono text-slate-700">{s.price ? s.price.toLocaleString() : 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals Preview */}
                  <div className="border-t border-slate-200 pt-2 text-right text-xs space-y-1">
                    <div className="text-slate-500">Subtotal: <span className="font-mono text-slate-800">LKR {subtotal.toLocaleString()}</span></div>
                    {builderData.discount > 0 && (
                      <div className="text-emerald-600 font-bold">Discount: <span className="font-mono">- LKR {builderData.discount.toLocaleString()}</span></div>
                    )}
                    <div className="text-base font-black text-blue-600 pt-1 border-t border-slate-200">
                      Total Payable: LKR {total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Save Draft vs Generate Quotation */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleSaveQuotation('Draft')}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSaveQuotation('Sent')}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Generate & Send Quotation</span>
              </button>
            </div>
          </div>
        </FormModal>
      )}

      {/* Live Document Preview & Print Modal */}
      {selectedQuo && !isShareModalOpen && (
        <FormModal
          isOpen={!!selectedQuo}
          onClose={() => setSelectedQuo(null)}
          title={`Official Quotation — ${selectedQuo.quotationNumber}`}
          maxWidth="3xl"
        >
          <div className="space-y-6 print-card p-6 rounded-2xl bg-white border border-slate-200 shadow-xl text-slate-900">
            {/* Document Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-blue-900 tracking-tight">ARS VISA & CONSULTANTS</h2>
                <p className="text-xs text-slate-500">Access Towers, No. 10, Union Place, Colombo 02, Sri Lanka</p>
                <p className="text-xs text-slate-500">Hotline: +94 11 234 5678 | Email: info@arsvisa.com</p>
              </div>
              <div className="text-right">
                <span className="text-base font-mono font-black text-blue-600">{selectedQuo.quotationNumber}</span>
                <p className="text-xs text-slate-500 mt-0.5">Date: {selectedQuo.createdAt}</p>
                <p className="text-xs font-bold text-amber-600">Valid Until: {selectedQuo.validityDate}</p>
              </div>
            </div>

            {/* Client Information */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">PREPARED FOR CLIENT:</p>
                <p className="text-sm font-bold text-slate-900">{selectedQuo.customerName}</p>
                <p className="text-slate-600">{selectedQuo.country} — {selectedQuo.visaType}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">STATUS:</p>
                <StatusBadge status={selectedQuo.status} />
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                  <th className="py-2">Service Description</th>
                  <th className="py-2 text-right">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedQuo.services.map((s, idx) => (
                  <tr key={idx}>
                    <td className="py-2 text-slate-800 font-medium">{s.serviceName}</td>
                    <td className="py-2 text-right font-mono text-slate-800">{s.price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div className="border-t border-slate-200 pt-3 space-y-1 text-xs text-right font-mono">
              <div className="text-slate-500">Subtotal: <span className="text-slate-800 font-bold">LKR {selectedQuo.subtotal.toLocaleString()}</span></div>
              {selectedQuo.discount > 0 && (
                <div className="text-emerald-600 font-bold">Discount / Concession: <span>- LKR {selectedQuo.discount.toLocaleString()}</span></div>
              )}
              <div className="text-lg font-black text-blue-600 pt-2 border-t border-slate-200">
                Total Payable: LKR {selectedQuo.total.toLocaleString()}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-200 space-y-1 font-sans">
              <p><span className="font-bold text-slate-700">Payment Terms:</span> {selectedQuo.paymentTerms}</p>
              <p className="whitespace-pre-line"><span className="font-bold text-slate-700">Terms & Conditions:</span> {selectedQuo.termsAndConditions}</p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-200 no-print gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>

              {selectedQuo.status !== 'Converted' && (
                <button
                  onClick={() => handleConvertQuotation(selectedQuo)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Convert to Invoice & Case</span>
                </button>
              )}
            </div>
          </div>
        </FormModal>
      )}

      {/* Share Modal */}
      {isShareModalOpen && selectedQuo && (
        <FormModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={`Share Quotation — ${selectedQuo.quotationNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Share official quotation <span className="font-mono font-bold text-blue-600">{selectedQuo.quotationNumber}</span> directly with client <span className="font-bold">{selectedQuo.customerName}</span>.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  alert(`WhatsApp dispatch link created for ${selectedQuo.customerName}!`);
                  setIsShareModalOpen(false);
                }}
                className="w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold flex items-center justify-between"
              >
                <span>Share via WhatsApp Link</span>
                <Send className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                onClick={() => {
                  alert(`Email dispatch notification sent for ${selectedQuo.customerName}!`);
                  setIsShareModalOpen(false);
                }}
                className="w-full p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold flex items-center justify-between"
              >
                <span>Send Official Email PDF</span>
                <Send className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
};

export default QuotationsPage;
