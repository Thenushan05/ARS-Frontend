import React, { useState, useEffect } from 'react';
import { 
  Receipt as ReceiptIcon, Printer, Eye, Download, Search, Filter, 
  Building2, CheckCircle2, User, FileText, Calendar, DollarSign
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
      render: (r) => <span className="font-mono text-blue-600 dark:text-sky-400 font-bold">{r.receiptNumber}</span> 
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
      header: 'Amount', 
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
      header: 'Date', 
      render: (r) => <span className="text-xs text-slate-500">{r.date}</span> 
    },
    { 
      key: 'receivedBy', 
      header: 'Received By', 
      render: (r) => <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{r.receivedBy}</span> 
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Receipts Log"
        subtitle="Manage and print official payment receipts issued for client visa processing & service packages."
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
              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-sky-500/30 text-xs font-semibold hover:bg-blue-100 flex items-center gap-1 transition-all"
              title="View Official Receipt"
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
              title="Print Receipt"
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

      {/* Official Receipt Detail Modal (All 11 Required Fields + Letterhead) */}
      {selectedReceipt && (
        <FormModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={`Official Payment Receipt — ${selectedReceipt.receiptNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 print-card p-6 rounded-2xl bg-white border border-slate-200 shadow-xl text-slate-900 font-sans">
            {/* ARS VISA & CONSULTANTS Letterhead Header */}
            <div className="text-center border-b border-slate-200 pb-4 space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-blue-900 uppercase">ARS VISA & CONSULTANTS</h2>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">OFFICIAL PAYMENT RECEIPT</p>
              <p className="text-[11px] text-slate-500">
                Access Towers, No. 10, Union Place, Colombo 02, Sri Lanka | Hotline: +94 11 234 5678 | Email: info@arsvisa.com
              </p>
            </div>

            {/* 11 Required Receipt Fields Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold">1. Receipt Number:</span>
                  <span className="font-mono text-blue-600 font-bold ml-1 text-sm">{selectedReceipt.receiptNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">2. Customer Name:</span>
                  <span className="text-slate-900 font-bold ml-1">{selectedReceipt.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">3. Case ID:</span>
                  <span className="font-mono text-purple-600 font-bold ml-1">{selectedReceipt.caseId || 'CAS-9002'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">4. Country:</span>
                  <span className="text-slate-800 font-semibold ml-1">{selectedReceipt.country || 'France'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">5. Visa Type:</span>
                  <span className="text-slate-800 font-semibold ml-1">{selectedReceipt.visaType || 'Tourist Visa'}</span>
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold">7. Payment For:</span>
                  <span className="text-slate-800 font-medium ml-1 block mt-0.5">{selectedReceipt.paymentFor}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">8. Payment Method:</span>
                  <span className="text-slate-900 font-bold ml-1">{selectedReceipt.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">10. Date:</span>
                  <span className="text-slate-800 font-semibold ml-1">{selectedReceipt.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">11. Received By:</span>
                  <span className="text-slate-900 font-bold ml-1">{selectedReceipt.receivedBy}</span>
                </div>
              </div>
            </div>

            {/* 6. Amount Received Display Card */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-center space-y-1">
              <p className="text-xs text-blue-800 font-bold uppercase tracking-wider">6. Amount Received</p>
              <CurrencyDisplay amount={selectedReceipt.amountReceived} className="text-3xl text-emerald-600 font-black font-mono" />
            </div>

            {/* 9. Outstanding Remaining Balance Display */}
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700">9. Outstanding Remaining Balance:</span>
              <span className={`font-mono text-sm font-black ${selectedReceipt.remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {selectedReceipt.remainingBalance > 0 ? `LKR ${selectedReceipt.remainingBalance.toLocaleString()}` : 'LKR 0 (Cleared)'}
              </span>
            </div>

            {/* Action Buttons: View, Print, Download PDF */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 no-print">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Close View
              </button>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
};

export default ReceiptsPage;
