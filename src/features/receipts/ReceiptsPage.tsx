import React, { useState, useEffect } from 'react';
import { Receipt as ReceiptIcon, Printer, Eye, Download } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import FormModal from '../../components/modals/FormModal';
import { Receipt } from '../../types';
import { receiptsApi } from '../../api';

export const ReceiptsPage: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const fetchReceipts = async () => {
    setIsLoading(true);
    try {
      const data = await receiptsApi.getAll();
      setReceipts(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const columns: Column<Receipt>[] = [
    { key: 'receiptNumber', header: 'Receipt #', render: (r) => <span className="font-mono text-sky-400 font-semibold">{r.receiptNumber}</span> },
    { key: 'customerName', header: 'Customer Name', render: (r) => <span className="font-bold text-slate-100">{r.customerName}</span> },
    { key: 'caseId', header: 'Case Ref', render: (r) => <span className="text-xs text-purple-400 font-mono">{r.caseId || 'CAS-9002'}</span> },
    { key: 'amountReceived', header: 'Amount Received', render: (r) => <CurrencyDisplay amount={r.amountReceived} className="text-emerald-400 font-bold" /> },
    { key: 'paymentMethod', header: 'Method', render: (r) => <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">{r.paymentMethod}</span> },
    { key: 'date', header: 'Issued Date', render: (r) => <span className="text-xs text-slate-400">{r.date}</span> },
    { key: 'receivedBy', header: 'Issued By', render: (r) => <span className="text-xs text-slate-300">{r.receivedBy}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Receipts Log"
        subtitle="View and print official payment receipt documentation issued to clients."
        breadcrumbs={[{ label: 'Receipts' }]}
      />

      <DataTable
        columns={columns}
        data={receipts}
        isLoading={isLoading}
        onRowClick={(r) => setSelectedReceipt(r)}
        actions={(r) => (
          <button
            onClick={() => setSelectedReceipt(r)}
            className="px-3 py-1 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-semibold hover:bg-sky-500/25 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        )}
      />

      {/* Official Receipt Card Modal */}
      {selectedReceipt && (
        <FormModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={`Official Payment Receipt — ${selectedReceipt.receiptNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 print-card p-6 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
            {/* Header */}
            <div className="text-center border-b border-slate-800 pb-4 space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-slate-100">ARS VISA & CONSULTANTS</h2>
              <p className="text-xs text-slate-400">OFFICIAL PAYMENT RECEIPT</p>
              <p className="text-[11px] text-slate-500">Access Towers, Colombo 02, Sri Lanka | +94 11 234 5678</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div><span className="text-slate-500 font-semibold">Receipt Number:</span> <span className="font-mono text-sky-400 font-bold ml-1">{selectedReceipt.receiptNumber}</span></div>
                <div><span className="text-slate-500 font-semibold">Customer Name:</span> <span className="text-slate-100 font-bold ml-1">{selectedReceipt.customerName}</span></div>
                <div><span className="text-slate-500 font-semibold">Case Reference:</span> <span className="font-mono text-purple-400 ml-1">{selectedReceipt.caseId || 'CAS-9002'}</span></div>
                <div><span className="text-slate-500 font-semibold">Country & Visa:</span> <span className="text-slate-200 ml-1">{selectedReceipt.country || 'France'} — {selectedReceipt.visaType || 'Tourist Visa'}</span></div>
              </div>

              <div className="space-y-2 text-right">
                <div><span className="text-slate-500 font-semibold">Payment Date:</span> <span className="text-slate-200 ml-1">{selectedReceipt.date}</span></div>
                <div><span className="text-slate-500 font-semibold">Payment Method:</span> <span className="text-slate-200 ml-1">{selectedReceipt.paymentMethod}</span></div>
                <div><span className="text-slate-500 font-semibold">Received By:</span> <span className="text-slate-200 ml-1">{selectedReceipt.receivedBy}</span></div>
              </div>
            </div>

            {/* Amount Box */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
              <p className="text-xs text-slate-400 uppercase font-semibold">Total Amount Received</p>
              <CurrencyDisplay amount={selectedReceipt.amountReceived} className="text-2xl text-emerald-400 font-black" />
              <p className="text-xs text-slate-400 pt-1">Payment Purpose: {selectedReceipt.paymentFor}</p>
            </div>

            {/* Remaining Balance */}
            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
              <span className="text-slate-400">Outstanding Remaining Balance:</span>
              <CurrencyDisplay amount={selectedReceipt.remainingBalance} className={selectedReceipt.remainingBalance > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'} />
            </div>

            {/* Print Button */}
            <div className="flex justify-end gap-3 pt-4 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
};

export default ReceiptsPage;
