import React, { useState, useEffect } from 'react';
import { Plus, FileSpreadsheet, AlertTriangle, CheckCircle, CreditCard, Printer } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import FormModal from '../../components/modals/FormModal';
import { Invoice } from '../../types';
import { invoicesApi } from '../../api';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await invoicesApi.getAll();
      setInvoices(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const columns: Column<Invoice>[] = [
    { key: 'invoiceNumber', header: 'Invoice #', render: (i) => <span className="font-mono text-sky-400 font-semibold">{i.invoiceNumber}</span> },
    { key: 'customerName', header: 'Customer', render: (i) => <span className="font-bold text-slate-100">{i.customerName}</span> },
    { key: 'caseId', header: 'Case Ref', render: (i) => <span className="text-xs text-purple-400 font-mono">{i.caseId || 'Direct'}</span> },
    { key: 'total', header: 'Total Fee', render: (i) => <CurrencyDisplay amount={i.total} className="text-slate-200 font-semibold" /> },
    { key: 'paid', header: 'Paid Amount', render: (i) => <CurrencyDisplay amount={i.paid} className="text-emerald-400 font-semibold" /> },
    { key: 'balance', header: 'Outstanding Balance', render: (i) => (
      <span className={i.balance > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'}>
        <CurrencyDisplay amount={i.balance} className={i.balance > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'} />
      </span>
    )},
    { key: 'dueDate', header: 'Due Date', render: (i) => <span className="text-xs text-amber-400">{i.dueDate}</span> },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice Directory"
        subtitle="Manage customer invoices, total billing, collections, and overdue payment alerts."
        breadcrumbs={[{ label: 'Invoices' }]}
      />

      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        onRowClick={(i) => setSelectedInvoice(i)}
      />

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <FormModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice Details — ${selectedInvoice.invoiceNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100">{selectedInvoice.customerName}</h3>
                <p className="text-slate-400">Case Reference: {selectedInvoice.caseId || 'General Invoice'}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={selectedInvoice.status} />
                <p className="text-slate-400 mt-1">Due Date: {selectedInvoice.dueDate}</p>
              </div>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {selectedInvoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 text-slate-200">{item.description}</td>
                    <td className="py-2 text-right font-mono text-slate-300">{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-right">
              <div>Total Invoice Amount: <CurrencyDisplay amount={selectedInvoice.total} className="text-slate-100 font-bold" /></div>
              <div>Total Received: <CurrencyDisplay amount={selectedInvoice.paid} className="text-emerald-400 font-bold" /></div>
              <div className="text-base font-bold text-rose-400 border-t border-slate-800 pt-2">
                Outstanding Due Balance: <CurrencyDisplay amount={selectedInvoice.balance} className="text-rose-400 text-lg font-bold" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
};

export default InvoicesPage;
