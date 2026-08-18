import React, { useState, useEffect } from 'react';
import { 
  Receipt as ReceiptIcon, Printer, Eye, Download, Search, Filter, 
  Building2, CheckCircle2, User, FileText, Calendar, DollarSign, ShieldCheck, Check, Globe
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { Receipt } from '../../types';
import { receiptsApi } from '../../api';

export const ReceiptsPage: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const fetchReceipts = async () => {
    setIsLoading(true);
    try {
      const data = await receiptsApi.getAll();
      let filtered = [...data];
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(r => 
          r.receiptNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          (r.caseId && r.caseId.toLowerCase().includes(q))
        );
      }
      setReceipts(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [searchTerm]);

  // 7 Required Columns
  const columns: Column<Receipt>[] = [
    { 
      key: 'receiptNumber', 
      header: 'Receipt Number', 
      render: (r) => <span className="font-mono text-purple-700 dark:text-purple-400 font-bold">{r.receiptNumber}</span> 
    },
    { 
      key: 'customerName', 
      header: 'Customer', 
      render: (r) => <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{r.customerName}</span> 
    },
    { 
      key: 'caseId', 
      header: 'Case ID', 
      render: (r) => (
        <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
          {r.caseId || 'CAS-9002'}
        </span>
      ) 
    },
    { 
      key: 'amountReceived', 
      header: 'Amount Received', 
      render: (r) => <CurrencyDisplay amount={r.amountReceived} className="text-emerald-600 dark:text-emerald-400 font-black text-sm" /> 
    },
    { 
      key: 'paymentMethod', 
      header: 'Payment Method', 
      render: (r) => (
        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold">
          {r.paymentMethod}
        </span>
      ) 
    },
    { 
      key: 'date', 
      header: 'Issued Date', 
      render: (r) => <span className="text-xs text-slate-500">{r.date}</span> 
    },
    { 
      key: 'receivedBy', 
      header: 'Issued By', 
      render: (r) => <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{r.receivedBy}</span> 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          title="Official Receipts Log"
          subtitle="View, print, and download formal e-receipts matching official corporate template standards."
          breadcrumbs={[{ label: 'Receipts' }]}
        />

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search by receipt # (REC-2026-0814), customer, or case ID..." 
            className="w-full sm:w-80" 
          />
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={receipts}
          isLoading={isLoading}
          emptyText="No official receipt records found."
          onRowClick={(r) => setSelectedReceipt(r)}
          actions={(r) => (
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setSelectedReceipt(r)}
                className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 text-xs font-semibold hover:bg-purple-100 flex items-center gap-1 transition-all"
                title="View Custom Template Receipt"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReceipt(r);
                  setTimeout(() => window.print(), 300);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 flex items-center gap-1 transition-all"
                title="Print Official Receipt"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReceipt(r);
                  setTimeout(() => window.print(), 300);
                }}
                className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 hover:bg-purple-100 transition-all"
                title="Download PDF"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        />
      </div>

      {/* Custom Template Receipt Modal (With Top Fixed Action Bar) */}
      {selectedReceipt && (
        <FormModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={`Official Payment Receipt — ${selectedReceipt.receiptNumber}`}
          maxWidth="3xl"
        >
          <div className="space-y-4">
            {/* TOP FIXED / STICKY ACTION BAR */}
            <div className="no-print sticky -top-6 z-30 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-md mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Receipt Document ({selectedReceipt.receiptNumber})
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
                  onClick={() => setSelectedReceipt(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Document Card */}
            <div className="space-y-6 print-card p-10 bg-white border border-slate-200 shadow-2xl text-slate-900 font-sans text-xs">
              {/* Top Company Info & Logo Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-slate-800">ARS Visa & Consultants Inc.</h2>
                  <p className="text-slate-500">Level 12, Access Towers 1, 278 Union Place</p>
                  <p className="text-slate-500">Colombo 02, Sri Lanka | +94 11 234 5678</p>
                </div>

                {/* Logo Emblem Box */}
                <div className="p-3 px-6 rounded-xl border border-purple-200 bg-purple-50/50 flex items-center justify-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#6b3a69] text-white flex items-center justify-center font-black text-xs">A</div>
                  <span className="font-bold text-[#6b3a69] text-sm">ARS VISA</span>
                </div>
              </div>

              {/* RECEIPT Big Right Title */}
              <div className="text-right pt-4">
                <h1 className="text-3xl font-black tracking-widest text-[#6b3a69] uppercase">RECEIPT</h1>
              </div>

              {/* Billed To & Receipt Metadata */}
              <div className="grid grid-cols-2 gap-6 items-start pt-2">
                <div>
                  <p className="font-bold text-[#6b3a69] text-xs mb-1">Billed To</p>
                  <p className="text-sm font-bold text-slate-900">{selectedReceipt.customerName}</p>
                  <p className="text-slate-500">12/A, Kandy Road, Kiribathgoda</p>
                  <p className="text-slate-500">+94 77 444 3322 | ARS-2026-00042</p>
                </div>

                <div className="space-y-1 text-right text-xs">
                  <div className="flex justify-end gap-6"><span className="font-bold text-[#6b3a69]">Receipt #</span> <span className="font-mono text-slate-900 font-bold">{selectedReceipt.receiptNumber}</span></div>
                  <div className="flex justify-end gap-6"><span className="font-bold text-[#6b3a69]">Receipt date</span> <span className="text-slate-900">{selectedReceipt.date}</span></div>
                  <div className="flex justify-end gap-6"><span className="font-bold text-[#6b3a69]">Payment Method</span> <span className="text-slate-900">{selectedReceipt.paymentMethod}</span></div>
                  <div className="flex justify-end gap-6"><span className="font-bold text-[#6b3a69]">Case Ref</span> <span className="font-mono text-slate-900">{selectedReceipt.caseId || 'CAS-9002'}</span></div>
                </div>
              </div>

              {/* Line Items Table with Solid Accent Header */}
              <div className="pt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#6b3a69] text-white font-bold text-xs uppercase">
                      <th className="py-2.5 px-3 w-16 text-center">QTY</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-3 text-center font-medium text-slate-700">1</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {selectedReceipt.paymentFor}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {selectedReceipt.amountReceived.toLocaleString()}.00
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {selectedReceipt.amountReceived.toLocaleString()}.00
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 text-center font-medium text-slate-700">1</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        VFS Appointment & File Preparation Support
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        15,000.00
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        15,000.00
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="h-0.5 bg-[#6b3a69]" />
              </div>

              {/* Financial Totals Breakdown (Right Aligned) */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-2 text-right text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono text-slate-800 font-semibold">LKR {(selectedReceipt.amountReceived + 15000).toLocaleString()}.00</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Package Concession (Discount)</span>
                    <span className="font-mono text-emerald-600 font-semibold">- LKR 15,000.00</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Sales Tax (0%)</span>
                    <span className="font-mono text-slate-800">0.00</span>
                  </div>

                  <div className="flex justify-between font-bold text-[#6b3a69] text-sm py-2 border-t-2 border-b-2 border-[#6b3a69]">
                    <span>Total Paid (LKR)</span>
                    <span className="font-mono font-black text-base">LKR {selectedReceipt.amountReceived.toLocaleString()}.00</span>
                  </div>

                  <div className="flex justify-between text-xs pt-1 font-semibold">
                    <span className="text-slate-500">Remaining Balance:</span>
                    <span className={selectedReceipt.remainingBalance > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                      {selectedReceipt.remainingBalance > 0 ? `LKR ${selectedReceipt.remainingBalance.toLocaleString()}.00` : 'LKR 0.00 (PAID IN FULL)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes Section at Bottom Left */}
              <div className="pt-8 border-t border-slate-200 text-xs space-y-1">
                <p className="font-bold text-[#6b3a69]">Notes</p>
                <p className="text-slate-600">
                  Thank you for your payment! All sales and service processing fees are final once document verification has commenced. Please retain this receipt for warranty and embassy tracking purposes.
                </p>
                <p className="text-slate-500 pt-2">
                  For questions or support, contact us at <span className="font-semibold text-slate-800">accounts@arsvisa.com</span> or <span className="font-semibold text-slate-800">+94 11 234 5678</span>.
                </p>
              </div>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
};

export default ReceiptsPage;
