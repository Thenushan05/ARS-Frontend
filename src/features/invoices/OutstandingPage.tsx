import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, CreditCard, Bell, TrendingUp, Search, Filter, 
  CheckCircle2, Clock, User, Building2, Calendar, FileText, Send, Check, Printer, Download
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import StatCard from '../../components/common/StatCard';
import FormModal from '../../components/modals/FormModal';
import CustomerRegistrationModal from '../../components/modals/CustomerRegistrationModal';
import { Invoice, PaymentMethod, PaymentType, Customer } from '../../types';
import { invoicesApi, paymentsApi, customersApi } from '../../api';

export const OutstandingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 6 Filter States
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterConsultant, setFilterConsultant] = useState('All');
  const [filterCountry, setFilterCountry] = useState('All');
  const [filterDueDate, setFilterDueDate] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterBranch, setFilterBranch] = useState('All');

  // Action Modals State
  const [recordingPaymentInvoice, setRecordingPaymentInvoice] = useState<Invoice | null>(null);
  const [reminderInvoice, setReminderInvoice] = useState<Invoice | null>(null);
  const [reminderMethod, setReminderMethod] = useState<'WhatsApp' | 'Email' | 'SMS'>('WhatsApp');
  const [reminderMessage, setReminderMessage] = useState('');

  // Payment Form Data
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<PaymentType>('Balance Payment');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [bankReference, setBankReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Notification toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const [invData, custRes] = await Promise.all([
        invoicesApi.getAll(),
        customersApi.getAll()
      ]);
      setInvoices(invData);
      setCustomers(Array.isArray(custRes) ? custRes : (custRes as any).items || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Compute Days Overdue
  const calculateDaysOverdue = (dueDateStr: string): number => {
    const due = new Date(dueDateStr);
    const today = new Date('2026-08-18');
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Apply 6 Filters
  useEffect(() => {
    let result = invoices.filter(i => i.balance > 0 || filterStatus === 'Paid');

    if (filterCustomer) {
      const q = filterCustomer.toLowerCase();
      result = result.filter(i => 
        i.customerName.toLowerCase().includes(q) ||
        i.invoiceNumber.toLowerCase().includes(q)
      );
    }

    if (filterConsultant !== 'All') {
      result = result.filter(i => (i.consultant || 'Nimali Fernando') === filterConsultant);
    }

    if (filterCountry !== 'All') {
      result = result.filter(i => (i.country || 'France') === filterCountry);
    }

    if (filterStatus !== 'All') {
      result = result.filter(i => i.status === filterStatus);
    }

    if (filterBranch !== 'All') {
      result = result.filter(i => (i.branch || 'Colombo Head Office') === filterBranch);
    }

    if (filterDueDate !== 'All') {
      if (filterDueDate === 'Overdue') {
        result = result.filter(i => calculateDaysOverdue(i.dueDate) > 0);
      } else if (filterDueDate === 'Due Today') {
        result = result.filter(i => calculateDaysOverdue(i.dueDate) === 0);
      }
    }

    setFilteredInvoices(result);
  }, [invoices, filterCustomer, filterConsultant, filterCountry, filterDueDate, filterStatus, filterBranch]);

  // Top KPI: Total Outstanding Receivable
  const totalReceivable = filteredInvoices.reduce((acc, curr) => acc + curr.balance, 0);

  // Handle Record Payment Submission
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingPaymentInvoice) return;

    try {
      await paymentsApi.create({
        invoiceNumber: recordingPaymentInvoice.invoiceNumber,
        customerId: recordingPaymentInvoice.customerId,
        customerName: recordingPaymentInvoice.customerName,
        amount: paymentAmount,
        type: paymentType,
        method: paymentMethod,
        bankReference,
        notes: paymentNotes,
        date: '2026-08-18',
        receivedBy: 'Thenushan Sritharan'
      });

      setNotification({
        message: `Payment of LKR ${paymentAmount.toLocaleString()} recorded for ${recordingPaymentInvoice.customerName}! Official Receipt Issued.`,
        type: 'success'
      });
      setTimeout(() => setNotification(null), 5000);
      setRecordingPaymentInvoice(null);
      fetchInvoices();
    } catch {
      alert('Error recording payment.');
    }
  };

  // Handle Reminder Sending
  const handleSendReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderInvoice) return;
    setNotification({
      message: `${reminderMethod} payment reminder notice sent to ${reminderInvoice.customerName} for LKR ${reminderInvoice.balance.toLocaleString()} balance!`,
      type: 'info'
    });
    setTimeout(() => setNotification(null), 5000);
    setReminderInvoice(null);
  };

  // 9 Required Columns
  const columns: Column<Invoice>[] = [
    { 
      key: 'customerName', 
      header: 'Customer', 
      render: (i) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{i.customerName}</div>
          <div className="text-[11px] text-slate-500 font-mono">Inv: {i.invoiceNumber}</div>
        </div>
      )
    },
    { 
      key: 'caseId', 
      header: 'Case', 
      render: (i) => (
        <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
          {i.caseId || 'Direct'}
        </span>
      )
    },
    { 
      key: 'total', 
      header: 'Total Fee', 
      render: (i) => <CurrencyDisplay amount={i.total} className="text-slate-700 dark:text-slate-300 font-medium" /> 
    },
    { 
      key: 'paid', 
      header: 'Paid', 
      render: (i) => <CurrencyDisplay amount={i.paid} className="text-emerald-600 dark:text-emerald-400 font-semibold" /> 
    },
    { 
      key: 'balance', 
      header: 'Balance', 
      render: (i) => <CurrencyDisplay amount={i.balance} className="text-rose-600 dark:text-rose-400 font-black text-sm" /> 
    },
    { 
      key: 'dueDate', 
      header: 'Due Date', 
      render: (i) => <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{i.dueDate}</span> 
    },
    { 
      key: 'dueDate', 
      header: 'Days Overdue', 
      render: (i) => {
        const days = calculateDaysOverdue(i.dueDate);
        if (i.balance === 0) return <span className="text-xs text-emerald-600 font-bold">Paid</span>;
        if (days > 0) return <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200">{days} Days Overdue</span>;
        return <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">0 Days (Due Today)</span>;
      } 
    },
    { 
      key: 'consultant', 
      header: 'Consultant', 
      render: (i) => <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{i.consultant || 'Nimali Fernando'}</span> 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (i) => {
        if (i.status === 'Paid' || i.balance === 0) {
          return (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
              Paid
            </span>
          );
        }
        if (i.status === 'Part Paid') {
          return (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
              Part Paid
            </span>
          );
        }
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700">
            Overdue
          </span>
        );
      } 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          title="Outstanding Receivables & Overdue Tracking"
          subtitle="Monitor client balances, days overdue, record payments, and send collection reminders."
          breadcrumbs={[{ label: 'Outstanding Payments' }]}
        />

        {/* Toast Notification */}
        {notification && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 text-xs font-bold flex items-center justify-between shadow-md">
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="text-blue-500 font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Top KPI Card: Total Receivable */}
        <div className="max-w-md">
          <StatCard
            title="Total Outstanding Receivable"
            value={totalReceivable}
            isCurrency
            icon={TrendingUp}
            colorScheme="rose"
            subtitle={`${filteredInvoices.filter(i => i.balance > 0).length} client accounts with active pending balance`}
          />
        </div>

        {/* 6 Filters Grid */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filter Outstanding Payables (6 Criteria)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 text-xs">
            {/* 1. Customer Search */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">Customer / Inv #</label>
              <input
                type="text"
                value={filterCustomer}
                onChange={(e) => setFilterCustomer(e.target.value)}
                placeholder="Search name..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 2. Consultant */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">Consultant</label>
              <select
                value={filterConsultant}
                onChange={(e) => setFilterConsultant(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Consultants</option>
                <option value="Nimali Fernando">Nimali Fernando</option>
                <option value="Thenushan Sritharan">Thenushan Sritharan</option>
                <option value="Kasun Perera">Kasun Perera</option>
                <option value="Sanjeewa Ratnayake">Sanjeewa Ratnayake</option>
              </select>
            </div>

            {/* 3. Country */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">Country</label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Countries</option>
                <option value="France">France</option>
                <option value="UK">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Japan">Japan</option>
                <option value="Germany">Germany</option>
              </select>
            </div>

            {/* 4. Due Date */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">Due Date</label>
              <select
                value={filterDueDate}
                onChange={(e) => setFilterDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Due Dates</option>
                <option value="Overdue">Overdue Today</option>
                <option value="Due Today">Due Today</option>
              </select>
            </div>

            {/* 5. Status */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Overdue">Overdue (Red)</option>
                <option value="Part Paid">Part Paid (Yellow)</option>
                <option value="Paid">Paid (Green)</option>
              </select>
            </div>

            {/* 6. Branch */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">Branch</label>
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Branches</option>
                <option value="Colombo Head Office">Colombo Head Office</option>
                <option value="Kandy Branch">Kandy Branch</option>
                <option value="Galle Branch">Galle Branch</option>
                <option value="Jaffna Branch">Jaffna Branch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredInvoices}
          isLoading={isLoading}
          emptyText="No matching outstanding receivable accounts found."
          actions={(i) => (
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => {
                  setRecordingPaymentInvoice(i);
                  setPaymentAmount(i.balance);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                title="Record Payment for Customer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>

              <button
                onClick={() => {
                  setReminderInvoice(i);
                  setReminderMessage(
                    `Dear ${i.customerName}, this is a gentle payment reminder from ARS Visa & Consultants regarding Invoice ${i.invoiceNumber} for your ${i.country || 'France'} Visa case. Outstanding balance due is LKR ${i.balance.toLocaleString()}. Kindly remit payment at your earliest convenience.`
                  );
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-semibold hover:bg-amber-100 flex items-center gap-1 transition-all"
                title="Create Payment Reminder Notice"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Create Reminder</span>
              </button>
            </div>
          )}
        />
      </div>

      {/* Record Payment Form Modal */}
      {recordingPaymentInvoice && (
        <FormModal
          isOpen={!!recordingPaymentInvoice}
          onClose={() => setRecordingPaymentInvoice(null)}
          title={`Record Payment — ${recordingPaymentInvoice.customerName}`}
          subtitle={`Invoice ${recordingPaymentInvoice.invoiceNumber} | Outstanding Balance: LKR ${recordingPaymentInvoice.balance.toLocaleString()}`}
          maxWidth="lg"
        >
          <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Amount (LKR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                max={recordingPaymentInvoice.balance}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Type</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="Balance Payment">Balance Payment</option>
                  <option value="Part Payment">Part Payment</option>
                  <option value="Installment">Installment</option>
                  <option value="Full Payment">Full Payment</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Online">Online</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bank Reference / Txn Ref</label>
              <input
                type="text"
                placeholder="e.g. TXN-9082341 (Commercial Bank)"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
              <textarea
                rows={2}
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Remarks..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRecordingPaymentInvoice(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
              >
                Confirm & Generate Receipt
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {/* Create Payment Reminder Modal */}
      {reminderInvoice && (
        <FormModal
          isOpen={!!reminderInvoice}
          onClose={() => setReminderInvoice(null)}
          title={`Create Payment Reminder — ${reminderInvoice.customerName}`}
          subtitle={`Outstanding Balance: LKR ${reminderInvoice.balance.toLocaleString()} | Due: ${reminderInvoice.dueDate}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSendReminder} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reminder Channel</label>
              <div className="grid grid-cols-3 gap-2">
                {(['WhatsApp', 'Email', 'SMS'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setReminderMethod(m)}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      reminderMethod === m
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reminder Message Content</label>
              <textarea
                rows={5}
                required
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setReminderInvoice(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Send {reminderMethod} Reminder</span>
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default OutstandingPage;
