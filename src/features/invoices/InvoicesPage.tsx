import React, { useState, useEffect } from 'react';
import { 
  Plus, FileSpreadsheet, AlertTriangle, CheckCircle2, CreditCard, Printer, 
  Search, Filter, Eye, Download, DollarSign, Clock, Package as PackageIcon, 
  ArrowRight, ShieldCheck, FileText, Check, User
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { Invoice, InvoiceStatus, Customer, VisaCase, Payment } from '../../types';
import { invoicesApi, customersApi, visaCasesApi, paymentsApi } from '../../api';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cases, setCases] = useState<VisaCase[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Invoice for Details Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Invoice Creation Form State
  const [newInvoiceData, setNewInvoiceData] = useState({
    customerId: '',
    customerName: '',
    caseId: '',
    country: 'France',
    visaType: 'Tourist Visa',
    packageName: 'France Schengen All-Inclusive Package',
    services: [
      { description: 'Tourist Visa Processing Fee', amount: 75000 },
      { description: 'VFS Appointment Support', amount: 15000 },
      { description: 'Cover Letter & SOP Drafting', amount: 20000 },
      { description: 'Travel Insurance Premium Policy', amount: 25000 }
    ],
    discount: 22000,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  });

  // Quick Payment Collection State
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Cash' | 'Card' | 'Online'>('Bank Transfer');

  const invoiceStatuses: InvoiceStatus[] = [
    'Unpaid',
    'Part Paid',
    'Paid',
    'Overdue',
    'Cancelled'
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [invRes, custRes, caseRes, payRes] = await Promise.all([
        invoicesApi.getAll(),
        customersApi.getAll(),
        visaCasesApi.getAll(),
        paymentsApi.getAll()
      ]);

      let filtered = [...invRes];
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(i => 
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          (i.caseId && i.caseId.toLowerCase().includes(q))
        );
      }
      if (statusFilter) {
        filtered = filtered.filter(i => i.status === statusFilter);
      }

      setInvoices(filtered);
      setCustomers(custRes.data);
      setCases(caseRes.data);
      setPayments(payRes);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, statusFilter]);

  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceData.customerName) return;

    const subtotal = newInvoiceData.services.reduce((sum, item) => sum + item.amount, 0);
    const total = Math.max(0, subtotal - newInvoiceData.discount);

    const created = await invoicesApi.create({
      customerId: newInvoiceData.customerId,
      customerName: newInvoiceData.customerName,
      caseId: newInvoiceData.caseId || undefined,
      items: newInvoiceData.services,
      total,
      dueDate: newInvoiceData.dueDate
    });

    setIsCreateModalOpen(false);
    fetchData();
    setNotification({
      message: `Successfully generated Invoice ${created.invoiceNumber} for ${created.customerName}!`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || paymentAmount <= 0) return;

    const updatedPaid = selectedInvoice.paid + paymentAmount;
    const updatedBalance = Math.max(0, selectedInvoice.total - updatedPaid);
    const nextStatus: InvoiceStatus = updatedBalance === 0 ? 'Paid' : 'Part Paid';

    // Create payment entry
    await paymentsApi.create({
      invoiceNumber: selectedInvoice.invoiceNumber,
      customerId: selectedInvoice.customerId,
      customerName: selectedInvoice.customerName,
      amount: paymentAmount,
      date: new Date().toISOString().split('T')[0],
      type: updatedBalance === 0 ? 'Full Payment' : 'Part Payment',
      method: paymentMethod,
      receivedBy: 'Saman Jayasinghe',
      account: 'Commercial Bank ARS Main Account'
    });

    // Update invoice record
    const updatedInv: Invoice = {
      ...selectedInvoice,
      paid: updatedPaid,
      balance: updatedBalance,
      status: nextStatus
    };

    setSelectedInvoice(updatedInv);
    setIsPaymentModalOpen(false);
    fetchData();
    setNotification({
      message: `Recorded payment of LKR ${paymentAmount.toLocaleString()} against ${selectedInvoice.invoiceNumber}. New Status: ${nextStatus}.`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  // 8 Required Columns
  const columns: Column<Invoice>[] = [
    { 
      key: 'invoiceNumber', 
      header: 'Invoice Number', 
      render: (i) => <span className="font-mono text-blue-600 dark:text-sky-400 font-bold">{i.invoiceNumber}</span> 
    },
    { 
      key: 'customerName', 
      header: 'Customer', 
      render: (i) => <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{i.customerName}</span> 
    },
    { 
      key: 'caseId', 
      header: 'Case ID', 
      render: (i) => (
        <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
          {i.caseId || 'Direct Billing'}
        </span>
      ) 
    },
    { 
      key: 'total', 
      header: 'Total', 
      render: (i) => <CurrencyDisplay amount={i.total} className="text-slate-900 dark:text-slate-100 font-bold text-xs" /> 
    },
    { 
      key: 'paid', 
      header: 'Paid', 
      render: (i) => <CurrencyDisplay amount={i.paid} className="text-emerald-600 dark:text-emerald-400 font-bold text-xs" /> 
    },
    { 
      key: 'balance', 
      header: 'Balance', 
      render: (i) => (
        <div className="flex items-center gap-1">
          {i.balance > 0 ? (
            <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 font-black text-xs">
              LKR {i.balance.toLocaleString()}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
              LKR 0 (Cleared)
            </span>
          )}
        </div>
      ) 
    },
    { 
      key: 'dueDate', 
      header: 'Due Date', 
      render: (i) => (
        <span className={`text-xs font-bold flex items-center gap-1 ${i.status === 'Overdue' ? 'text-rose-600' : 'text-amber-600 dark:text-amber-400'}`}>
          <Clock className="w-3 h-3" />
          <span>{i.dueDate}</span>
        </span>
      ) 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (i) => <StatusBadge status={i.status} /> 
    },
  ];

  // Filter payments for selected invoice
  const selectedInvoicePayments = selectedInvoice 
    ? payments.filter(p => p.invoiceNumber === selectedInvoice.invoiceNumber) 
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice Directory & Billing"
        subtitle="Manage customer invoices, total billing, outstanding balance tracking, and payment history."
        breadcrumbs={[{ label: 'Invoices' }]}
        actions={
          <PermissionGuard permission="invoice.create">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Invoice</span>
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
          placeholder="Search by invoice # (INV-2026-0089), customer, or case ID..." 
          className="w-full sm:w-80" 
        />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All 5 Statuses</option>
            {invoiceStatuses.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        emptyText="No invoices matching criteria."
        onRowClick={(i) => setSelectedInvoice(i)}
        actions={(i) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setSelectedInvoice(i)}
              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-sky-500/30 text-xs font-semibold hover:bg-blue-100 flex items-center gap-1 transition-all"
              title="View Invoice Details & Outstanding Balance"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>

            {i.balance > 0 && (
              <PermissionGuard permission="payment.create">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedInvoice(i);
                    setPaymentAmount(i.balance);
                    setIsPaymentModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1 transition-all"
                  title="Receive Payment"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Receive Payment</span>
                </button>
              </PermissionGuard>
            )}
          </div>
        )}
      />

      {/* Invoice Details Page / Modal */}
      {selectedInvoice && !isPaymentModalOpen && (
        <FormModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice Details — ${selectedInvoice.invoiceNumber}`}
          maxWidth="3xl"
        >
          <div className="space-y-6 text-xs">
            {/* Prominently Highlighted Outstanding Balance Card */}
            <div className={`p-4 rounded-xl border flex items-center justify-between shadow-xs ${
              selectedInvoice.balance > 0
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            }`}>
              <div className="flex items-center gap-3">
                {selectedInvoice.balance > 0 ? (
                  <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                )}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                    {selectedInvoice.balance > 0 ? 'Outstanding Due Balance Alert' : 'Invoice Payment Cleared'}
                  </p>
                  <p className="text-xl font-black font-mono">
                    LKR {selectedInvoice.balance.toLocaleString()}
                  </p>
                  <p className="text-[11px] mt-0.5">
                    Due Date: <span className="font-bold">{selectedInvoice.dueDate}</span> ({selectedInvoice.status})
                  </p>
                </div>
              </div>

              {selectedInvoice.balance > 0 && (
                <button
                  onClick={() => {
                    setPaymentAmount(selectedInvoice.balance);
                    setIsPaymentModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Receive Payment Now</span>
                </button>
              )}
            </div>

            {/* Customer & Case Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1 uppercase text-[11px]">
                  Customer & Billing Info
                </p>
                <div><span className="text-slate-500">Customer Name:</span> <span className="font-bold text-slate-900 dark:text-slate-100">{selectedInvoice.customerName}</span></div>
                <div><span className="text-slate-500">ARS Customer ID:</span> <span className="font-mono font-bold text-blue-600 dark:text-sky-400">{selectedInvoice.customerId}</span></div>
                <div><span className="text-slate-500">Created Date:</span> <span className="text-slate-800 dark:text-slate-200">{selectedInvoice.createdAt}</span></div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1 uppercase text-[11px]">
                  Case & Visa Reference
                </p>
                <div><span className="text-slate-500">Case Reference ID:</span> <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{selectedInvoice.caseId || 'Direct Billing'}</span></div>
                <div><span className="text-slate-500">Invoice Status:</span> <StatusBadge status={selectedInvoice.status} /></div>
                <div><span className="text-slate-500">Due Date:</span> <span className="font-bold text-amber-600 dark:text-amber-400">{selectedInvoice.dueDate}</span></div>
              </div>
            </div>

            {/* Itemized Services & Package Breakdown */}
            <div className="space-y-2">
              <p className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px]">Billed Services & Package Line Items</p>
              <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-semibold text-[10px]">
                    <th className="py-2.5 px-3">Service / Item Description</th>
                    <th className="py-2.5 px-3 text-right">Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-medium">{item.description}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-900 dark:text-slate-100 font-semibold">{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Totals Summary */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-right font-mono">
              <div className="text-slate-500">Total Billed Invoice Amount: <span className="text-slate-900 dark:text-slate-100 font-bold text-sm">LKR {selectedInvoice.total.toLocaleString()}</span></div>
              <div className="text-emerald-600 font-bold">Total Payments Received: <span>LKR {selectedInvoice.paid.toLocaleString()}</span></div>
              <div className="text-base font-black text-rose-600 dark:text-rose-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                Outstanding Balance Due: LKR {selectedInvoice.balance.toLocaleString()}
              </div>
            </div>

            {/* Payment History Log Table */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px]">
                Payment History Log ({selectedInvoicePayments.length} Transactions)
              </p>

              {selectedInvoicePayments.length > 0 ? (
                <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  {selectedInvoicePayments.map(p => (
                    <div key={p.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-blue-600 dark:text-sky-400">{p.paymentId}</span>
                        <div className="text-[11px] text-slate-500">{p.date} — {p.method} ({p.type})</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600 text-xs">LKR {p.amount.toLocaleString()}</span>
                        <div className="text-[10px] text-slate-400">By: {p.receivedBy}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs italic bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  No payments recorded for this invoice yet.
                </p>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Invoice</span>
              </button>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white text-slate-700 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </FormModal>
      )}

      {/* Record Payment Quick Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <FormModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title={`Record Payment — Invoice ${selectedInvoice.invoiceNumber}`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-semibold flex justify-between items-center">
              <span>Outstanding Due Balance:</span>
              <span className="font-bold font-mono text-sm">LKR {selectedInvoice.balance.toLocaleString()}</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Amount (LKR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                max={selectedInvoice.balance}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-emerald-600 font-black text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Bank Transfer">Bank Transfer (Commercial Bank)</option>
                <option value="Cash">Cash</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Online">Online Gateway</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20"
              >
                Confirm Payment Receipt
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {/* Create New Invoice Modal */}
      {isCreateModalOpen && (
        <FormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Generate New Customer Invoice"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Customer <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={newInvoiceData.customerId}
                onChange={(e) => {
                  const cust = customers.find(c => c.id === e.target.value);
                  if (cust) {
                    setNewInvoiceData({
                      ...newInvoiceData,
                      customerId: cust.id,
                      customerName: cust.name
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

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Associated Case (Optional)</label>
              <select
                value={newInvoiceData.caseId}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, caseId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="">Direct Invoice (No Specific Case)</option>
                {cases.map(c => (
                  <option key={c.id} value={c.caseId}>{c.caseId} — {c.customerName} ({c.country})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={newInvoiceData.dueDate}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20"
              >
                Generate Official Invoice
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default InvoicesPage;
