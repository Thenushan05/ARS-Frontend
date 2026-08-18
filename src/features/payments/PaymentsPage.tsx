import React, { useState, useEffect } from 'react';
import { 
  Plus, CreditCard, Receipt as ReceiptIcon, FileCheck, CheckCircle2, 
  Search, Filter, Printer, Share2, Download, Upload, Check, Building2, User, FileText, Eye, UserPlus, ShieldCheck
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { CustomerRegistrationModal } from '../../components/modals/CustomerRegistrationModal';
import { Payment, PaymentType, PaymentMethod, Receipt, Invoice, Customer } from '../../types';
import { paymentsApi, invoicesApi, customersApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const { user } = useAuth();

  // Receipt & Payment Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<Receipt | null>(null);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCustomerRegOpen, setIsCustomerRegOpen] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // All 5 Payment Types
  const paymentTypes: PaymentType[] = [
    'Full Payment',
    'Advance',
    'Part Payment',
    'Installment',
    'Balance Payment'
  ];

  // All 5 Payment Methods
  const paymentMethods: PaymentMethod[] = [
    'Cash',
    'Bank Transfer',
    'Card',
    'Online',
    'Other'
  ];

  // Payment Form State
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    customerName: 'Sanduni De Silva',
    amount: 50000,
    type: 'Part Payment' as PaymentType,
    method: 'Bank Transfer' as PaymentMethod,
    account: 'Commercial Bank ARS Main - 1000234891',
    bankReference: 'TXN-9082341',
    date: new Date().toISOString().split('T')[0],
    notes: 'Advance deposit for Schengen visa processing.',
    proofFileName: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pmtRes, invRes, custRes] = await Promise.all([
        paymentsApi.getAll(),
        invoicesApi.getAll(),
        customersApi.getAll()
      ]);

      let filtered = [...pmtRes];
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
          p.paymentId.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.invoiceNumber.toLowerCase().includes(q)
        );
      }
      if (methodFilter) {
        filtered = filtered.filter(p => p.method === methodFilter);
      }
      if (typeFilter) {
        filtered = filtered.filter(p => p.type === typeFilter);
      }

      setPayments(filtered);
      setInvoices(invRes);
      setCustomers(custRes.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, methodFilter, typeFilter]);

  const handleInvoiceSelect = (invNum: string) => {
    const inv = invoices.find(i => i.invoiceNumber === invNum);
    if (inv) {
      setFormData(prev => ({
        ...prev,
        invoiceNumber: inv.invoiceNumber,
        customerId: inv.customerId,
        customerName: inv.customerName,
        amount: inv.balance > 0 ? inv.balance : inv.total,
        type: inv.paid === 0 ? (inv.balance === 0 ? 'Full Payment' : 'Advance') : 'Balance Payment'
      }));
    } else {
      setFormData(prev => ({ ...prev, invoiceNumber: invNum }));
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || formData.amount <= 0) return;

    const res = await paymentsApi.create({
      invoiceNumber: formData.invoiceNumber || 'INV-2026-0501',
      customerId: formData.customerId || 'cust-1',
      customerName: formData.customerName,
      amount: formData.amount,
      date: formData.date,
      type: formData.type,
      method: formData.method,
      receivedBy: user?.name || 'Saman Jayasinghe',
      account: formData.account,
      bankReference: formData.bankReference || undefined,
      notes: formData.notes || undefined,
      proofUrl: formData.proofFileName ? `/uploads/${formData.proofFileName}` : undefined
    });

    setIsRecordModalOpen(false);
    setGeneratedReceipt(res.receipt);
    fetchData();
    setNotification({
      message: `Payment of LKR ${formData.amount.toLocaleString()} recorded successfully! Receipt #${res.receipt.receiptNumber} generated.`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  // 9 Required Columns
  const columns: Column<Payment>[] = [
    { 
      key: 'paymentId', 
      header: 'Payment ID', 
      render: (p) => <span className="font-mono text-blue-600 dark:text-sky-400 font-bold">{p.paymentId}</span> 
    },
    { 
      key: 'invoiceNumber', 
      header: 'Invoice', 
      render: (p) => <span className="font-mono text-xs text-purple-600 dark:text-purple-400 font-semibold">{p.invoiceNumber}</span> 
    },
    { 
      key: 'customerName', 
      header: 'Customer', 
      render: (p) => <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{p.customerName}</span> 
    },
    { 
      key: 'amount', 
      header: 'Amount', 
      render: (p) => <CurrencyDisplay amount={p.amount} className="text-emerald-600 dark:text-emerald-400 font-black text-sm" /> 
    },
    { 
      key: 'date', 
      header: 'Date', 
      render: (p) => <span className="text-xs text-slate-500">{p.date}</span> 
    },
    { 
      key: 'type', 
      header: 'Type', 
      render: (p) => (
        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold">
          {p.type}
        </span>
      ) 
    },
    { 
      key: 'method', 
      header: 'Payment Method', 
      render: (p) => (
        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-[11px] font-semibold">
          {p.method}
        </span>
      ) 
    },
    { 
      key: 'receivedBy', 
      header: 'Received By', 
      render: (p) => <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{p.receivedBy}</span> 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (p) => <StatusBadge status={p.status} /> 
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Management & Receipts"
        subtitle="Record incoming client payments across multiple methods, verify deposits, and issue official receipts."
        breadcrumbs={[{ label: 'Payments' }]}
        actions={
          <PermissionGuard permission="payment.create">
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Record Payment</span>
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
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <SearchInput 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Search by payment ID, invoice, or customer..." 
          className="w-full md:w-80" 
        />

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Method Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All 5 Payment Methods</option>
              {paymentMethods.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All 5 Payment Types</option>
              {paymentTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading}
        emptyText="No payment transaction records found."
        onRowClick={(p) => setViewingPayment(p)}
        actions={(p) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setViewingPayment(p)}
              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-sky-500/30 text-xs font-semibold hover:bg-blue-100 flex items-center gap-1 transition-all"
              title="View Payment Details"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setGeneratedReceipt({
                  id: `rcp-${p.id}`,
                  receiptNumber: `REC-2026-${p.paymentId.replace('PMT-', '')}`,
                  paymentId: p.paymentId,
                  customerName: p.customerName,
                  amountReceived: p.amount,
                  paymentFor: `Invoice ${p.invoiceNumber} (${p.type})`,
                  paymentMethod: p.method,
                  remainingBalance: 0,
                  date: p.date,
                  receivedBy: p.receivedBy
                });
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1 transition-all"
              title="Generate / Print Receipt"
            >
              <ReceiptIcon className="w-3.5 h-3.5" />
              <span>Receipt</span>
            </button>
          </div>
        )}
      />

      {/* Record Payment Form Modal (All Required Fields) */}
      {isRecordModalOpen && (
        <FormModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          title="Record Customer Payment"
          maxWidth="2xl"
        >
          <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Associated Invoice
                </label>
                <select
                  value={formData.invoiceNumber}
                  onChange={(e) => handleInvoiceSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Direct Payment (No Specific Invoice) --</option>
                  {invoices.map(i => (
                    <option key={i.id} value={i.invoiceNumber}>
                      {i.invoiceNumber} — {i.customerName} (Bal: LKR {i.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Select Registered Customer <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomerRegOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800 transition-all"
                    title="Open Customer Registration Popup"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>+ Register New Customer</span>
                  </button>
                </div>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => {
                    const cust = customers.find(c => c.id === e.target.value);
                    if (cust) {
                      setFormData({
                        ...formData,
                        customerId: cust.id,
                        customerName: cust.name
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Registered Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.customerId}) — {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (LKR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-black text-base focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Type (5 Types)</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as PaymentType })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  {paymentTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method (5 Methods)</label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value as PaymentMethod })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  {paymentMethods.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Account Deposited To</label>
                <select
                  value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Cash in Hand">Cash in Hand</option>
                  <option value="Commercial Bank ARS Main - 1000234891">Commercial Bank ARS Main - 1000234891</option>
                  <option value="Sampath Bank ARS - 002910004561">Sampath Bank ARS - 002910004561</option>
                  <option value="Online Gateway (Stripe)">Online Gateway (Stripe)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bank Reference / TXN Ref</label>
                <input
                  type="text"
                  value={formData.bankReference}
                  onChange={(e) => setFormData({ ...formData, bankReference: e.target.value })}
                  placeholder="e.g. TXN-9082341"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes / Remittance Description</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Payment description or reference note..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Proof Upload Simulation */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Proof Upload (Bank Slip / Receipt Attachment)</label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800">
                  <Upload className="w-5 h-5 text-blue-600 shrink-0" />
                  <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, proofFileName: e.target.files?.[0]?.name || '' })}
                    className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20"
              >
                Confirm Payment & Issue Receipt
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {/* Post-Payment Receipt Generation Action Modal */}
      {generatedReceipt && (
        <FormModal
          isOpen={!!generatedReceipt}
          onClose={() => setGeneratedReceipt(null)}
          title="Payment Successfully Recorded — Official Receipt Issued"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Top Fixed / Sticky Action Bar (Hidden during printing) */}
            <div className="no-print sticky -top-6 z-30 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-md mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Payment Verified — {generatedReceipt.receiptNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#6b3a69] hover:bg-[#582e56] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setGeneratedReceipt(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Success Banner */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-200 pt-1">Payment Successfully Verified!</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Official Receipt <span className="font-mono font-bold text-emerald-900 dark:text-emerald-100">{generatedReceipt.receiptNumber}</span> generated.
              </p>
            </div>

            {/* Custom Template Receipt Card (Matching User Image Template) */}
            <div className="space-y-5 print-card p-8 bg-white border border-slate-200 shadow-2xl text-slate-900 font-sans text-xs rounded-2xl">
              {/* Company Info & Emblem */}
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <h2 className="text-xs font-bold text-slate-800">ARS Visa & Consultants Inc.</h2>
                  <p className="text-slate-500 text-[11px]">Level 12, Access Towers 1, 278 Union Place</p>
                  <p className="text-slate-500 text-[11px]">Colombo 02, Sri Lanka | +94 11 234 5678</p>
                </div>

                <div className="p-2 px-4 rounded-xl border border-purple-200 bg-purple-50/50 flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#6b3a69] text-white flex items-center justify-center font-black text-[10px]">A</div>
                  <span className="font-bold text-[#6b3a69] text-xs">ARS VISA</span>
                </div>
              </div>

              {/* Big RECEIPT Title */}
              <div className="text-right">
                <h1 className="text-2xl font-black tracking-widest text-[#6b3a69] uppercase">RECEIPT</h1>
              </div>

              {/* Billed To & Metadata */}
              <div className="grid grid-cols-2 gap-4 items-start text-xs">
                <div>
                  <p className="font-bold text-[#6b3a69] text-xs mb-0.5">Billed To</p>
                  <p className="font-bold text-slate-900">{generatedReceipt.customerName}</p>
                  <p className="text-slate-500 text-[11px]">12/A, Kandy Road, Kiribathgoda</p>
                </div>

                <div className="space-y-0.5 text-right text-xs">
                  <div className="flex justify-end gap-4"><span className="font-bold text-[#6b3a69]">Receipt #</span> <span className="font-mono text-slate-900 font-bold">{generatedReceipt.receiptNumber}</span></div>
                  <div className="flex justify-end gap-4"><span className="font-bold text-[#6b3a69]">Receipt date</span> <span className="text-slate-900">{generatedReceipt.date}</span></div>
                  <div className="flex justify-end gap-4"><span className="font-bold text-[#6b3a69]">Method</span> <span className="text-slate-900">{generatedReceipt.paymentMethod}</span></div>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#6b3a69] text-white font-bold text-[11px] uppercase">
                      <th className="py-2 px-3 w-12 text-center">QTY</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3 text-right">Unit Price</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2.5 px-3 text-center text-slate-700 font-medium">1</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{generatedReceipt.paymentFor}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">{generatedReceipt.amountReceived.toLocaleString()}.00</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{generatedReceipt.amountReceived.toLocaleString()}.00</td>
                    </tr>
                  </tbody>
                </table>
                <div className="h-0.5 bg-[#6b3a69]" />
              </div>

              {/* Financial Totals Breakdown */}
              <div className="flex justify-end pt-1">
                <div className="w-60 space-y-1 text-right text-xs">
                  <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-mono text-slate-800 font-semibold">LKR {generatedReceipt.amountReceived.toLocaleString()}.00</span></div>
                  <div className="flex justify-between font-bold text-[#6b3a69] text-xs py-1.5 border-t-2 border-b-2 border-[#6b3a69]">
                    <span>Total Paid (LKR)</span>
                    <span className="font-mono font-black">LKR {generatedReceipt.amountReceived.toLocaleString()}.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormModal>
      )}

      {/* Viewing Payment Details Modal */}
      {viewingPayment && !generatedReceipt && (
        <FormModal
          isOpen={!!viewingPayment}
          onClose={() => setViewingPayment(null)}
          title={`Payment Details — ${viewingPayment.paymentId}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{viewingPayment.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billed Invoice #:</span>
                <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{viewingPayment.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-sm">LKR {viewingPayment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Type:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingPayment.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingPayment.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deposited Account:</span>
                <span className="text-slate-800 dark:text-slate-200">{viewingPayment.account}</span>
              </div>
              {viewingPayment.bankReference && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank Ref #:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{viewingPayment.bankReference}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Received By Staff:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{viewingPayment.receivedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Status:</span>
                <StatusBadge status={viewingPayment.status} />
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  setGeneratedReceipt({
                    id: `rcp-${viewingPayment.id}`,
                    receiptNumber: `REC-2026-${viewingPayment.paymentId.replace('PMT-', '')}`,
                    paymentId: viewingPayment.paymentId,
                    customerName: viewingPayment.customerName,
                    amountReceived: viewingPayment.amount,
                    paymentFor: `Invoice ${viewingPayment.invoiceNumber} (${viewingPayment.type})`,
                    paymentMethod: viewingPayment.method,
                    remainingBalance: 0,
                    date: viewingPayment.date,
                    receivedBy: viewingPayment.receivedBy
                  });
                  setViewingPayment(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <ReceiptIcon className="w-4 h-4" />
                <span>Generate Official Receipt</span>
              </button>

              <button
                onClick={() => setViewingPayment(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white text-slate-700 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </FormModal>
      )}
      {/* Register New Customer Popup */}
      {isCustomerRegOpen && (
        <CustomerRegistrationModal
          isOpen={isCustomerRegOpen}
          onClose={() => setIsCustomerRegOpen(false)}
          onSuccess={(result) => {
            setIsCustomerRegOpen(false);
            fetchData();
            setFormData(prev => ({
              ...prev,
              customerId: result.customer.id,
              customerName: result.customer.name
            }));
            setNotification({
              message: `Registered new customer "${result.customer.name}" (${result.customer.customerId}) and auto-selected for payment!`,
              type: 'success'
            });
            setTimeout(() => setNotification(null), 5000);
          }}
          existingCustomersCount={customers.length}
        />
      )}
    </div>
  );
};

export default PaymentsPage;
