import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Receipt as ReceiptIcon, FileCheck, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import FormModal from '../../components/modals/FormModal';
import { Payment, PaymentType, PaymentMethod, Receipt } from '../../types';
import { paymentsApi } from '../../api';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<Receipt | null>(null);

  // Payment Form State
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-0501');
  const [customerName, setCustomerName] = useState('Sanduni De Silva');
  const [amount, setAmount] = useState(65000);
  const [type, setType] = useState<PaymentType>('Balance Payment');
  const [method, setMethod] = useState<PaymentMethod>('Bank Transfer');
  const [account, setAccount] = useState('Commercial Bank - 1000234891');
  const [notes, setNotes] = useState('Final balance payment for France package.');

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const data = await paymentsApi.getAll();
      setPayments(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await paymentsApi.create({
      invoiceNumber,
      customerName,
      amount,
      type,
      method,
      account,
      notes
    });
    setGeneratedReceipt(res.receipt);
    setIsModalOpen(false);
    fetchPayments();
  };

  const columns: Column<Payment>[] = [
    { key: 'paymentId', header: 'Payment ID', render: (p) => <span className="font-mono text-sky-400 font-semibold">{p.paymentId}</span> },
    { key: 'customerName', header: 'Customer & Invoice', render: (p) => (
      <div>
        <div className="font-bold text-slate-100">{p.customerName}</div>
        <div className="text-xs text-slate-400">Invoice: {p.invoiceNumber}</div>
      </div>
    )},
    { key: 'amount', header: 'Amount Paid', render: (p) => <CurrencyDisplay amount={p.amount} className="text-emerald-400 font-bold" /> },
    { key: 'method', header: 'Payment Method', render: (p) => <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">{p.method}</span> },
    { key: 'account', header: 'Deposited Account', render: (p) => <span className="text-xs text-slate-400">{p.account}</span> },
    { key: 'receivedBy', header: 'Received By', render: (p) => <span className="text-xs text-slate-300">{p.receivedBy}</span> },
    { key: 'date', header: 'Date', render: (p) => <span className="text-xs text-slate-500">{p.date}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Collections & Receipts"
        subtitle="Record incoming client payments (Cash, Bank Transfer, Card), verify balances, and issue instant receipts."
        breadcrumbs={[{ label: 'Payments' }]}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        }
      />

      <DataTable columns={columns} data={payments} isLoading={isLoading} />

      {/* Payment Success Receipt Trigger Modal */}
      {generatedReceipt && (
        <FormModal
          isOpen={!!generatedReceipt}
          onClose={() => setGeneratedReceipt(null)}
          title="Payment Successfully Recorded & Receipt Issued!"
          maxWidth="lg"
        >
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-100">Receipt #{generatedReceipt.receiptNumber}</p>
              <p className="text-xs text-slate-400">Amount Received: LKR {generatedReceipt.amountReceived.toLocaleString()} from {generatedReceipt.customerName}</p>
            </div>
            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={() => { setGeneratedReceipt(null); window.print(); }}
                className="px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs"
              >
                Print Official Receipt
              </button>
            </div>
          </div>
        </FormModal>
      )}

      {/* Record Payment Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Customer Payment"
        maxWidth="lg"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300">Invoice Number *</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">Customer Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300">Amount Paid (LKR) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold text-base"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">Payment Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PaymentType)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              >
                <option value="Full Payment">Full Payment</option>
                <option value="Advance">Advance</option>
                <option value="Part Payment">Part Payment</option>
                <option value="Installment">Installment</option>
                <option value="Balance Payment">Balance Payment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Online">Online</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-300">Account Deposited To</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              >
                <option value="Cash in Hand">Cash in Hand</option>
                <option value="Commercial Bank - 1000234891">Commercial Bank - 1000234891</option>
                <option value="Sampath Bank - 002910004561">Sampath Bank - 002910004561</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300">Notes / Bank Ref</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold shadow-lg shadow-sky-500/20"
            >
              Confirm & Issue Receipt
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default PaymentsPage;
