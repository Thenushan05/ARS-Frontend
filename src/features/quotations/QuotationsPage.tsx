import React, { useState, useEffect } from 'react';
import { Plus, FileText, Printer, Download, CheckCircle, Send, XCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import FormModal from '../../components/modals/FormModal';
import { Quotation } from '../../types';
import { quotationsApi } from '../../api';

export const QuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuo, setSelectedQuo] = useState<Quotation | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('Sanduni De Silva');
  const [country, setCountry] = useState('France');
  const [visaType, setVisaType] = useState('Tourist Visa');
  const [subtotal, setSubtotal] = useState(157000);
  const [discount, setDiscount] = useState(22000);
  const [validityDate, setValidityDate] = useState('2026-08-30');
  const [paymentTerms, setPaymentTerms] = useState('50% advance upon registration, 50% prior to VFS submission.');

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const data = await quotationsApi.getAll();
      setQuotations(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = subtotal - discount;
    await quotationsApi.create({
      customerName,
      country,
      visaType,
      services: [
        { serviceName: 'Tourist Visa Processing Fee', price: 75000 },
        { serviceName: 'VFS Appointment Support', price: 15000 },
        { serviceName: 'Cover Letter & SOP Drafting', price: 20000 },
        { serviceName: 'Travel Insurance Premium Policy', price: 25000 }
      ],
      packageName: 'France Schengen All-Inclusive Package',
      subtotal,
      discount,
      total,
      validityDate,
      paymentTerms,
      termsAndConditions: 'All government fees subject to embassy updates.'
    });
    setIsModalOpen(false);
    fetchQuotations();
  };

  const columns: Column<Quotation>[] = [
    { key: 'quotationNumber', header: 'Quotation #', render: (q) => <span className="font-mono text-sky-400 font-semibold">{q.quotationNumber}</span> },
    { key: 'customerName', header: 'Customer', render: (q) => <span className="font-bold text-slate-100">{q.customerName}</span> },
    { key: 'country', header: 'Destination', render: (q) => (
      <div>
        <div className="font-medium text-slate-200">{q.country}</div>
        <div className="text-xs text-slate-400">{q.visaType}</div>
      </div>
    )},
    { key: 'total', header: 'Total Value', render: (q) => <CurrencyDisplay amount={q.total} className="text-sky-400 font-bold" /> },
    { key: 'validityDate', header: 'Valid Until', render: (q) => <span className="text-xs text-amber-400">{q.validityDate}</span> },
    { key: 'status', header: 'Status', render: (q) => <StatusBadge status={q.status} /> },
    { key: 'createdAt', header: 'Created', render: (q) => <span className="text-xs text-slate-500">{q.createdAt}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotation Management"
        subtitle="Generate client estimates, interactive package proposals, and convert accepted quotes to official invoices."
        breadcrumbs={[{ label: 'Quotations' }]}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Quotation</span>
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={quotations}
        isLoading={isLoading}
        onRowClick={(q) => setSelectedQuo(q)}
        actions={(q) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setSelectedQuo(q)}
              className="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-semibold hover:bg-sky-500/25 flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print/Preview</span>
            </button>
          </div>
        )}
      />

      {/* Quotation Document Preview Modal */}
      {selectedQuo && (
        <FormModal
          isOpen={!!selectedQuo}
          onClose={() => setSelectedQuo(null)}
          title={`Quotation Preview — ${selectedQuo.quotationNumber}`}
          maxWidth="3xl"
        >
          <div className="space-y-6 print-card p-4 rounded-xl bg-slate-950 border border-slate-800">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-100">ARS VISA & CONSULTANTS</h2>
                <p className="text-xs text-slate-400">Head Office: No. 10, Access Towers, Colombo 02, Sri Lanka</p>
                <p className="text-xs text-slate-400">Hotline: +94 11 234 5678 | Email: info@arsvisa.com</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-mono font-bold text-sky-400">{selectedQuo.quotationNumber}</span>
                <p className="text-xs text-slate-400">Date: {selectedQuo.createdAt}</p>
                <p className="text-xs text-amber-400 font-semibold">Valid Until: {selectedQuo.validityDate}</p>
              </div>
            </div>

            {/* Client Info */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs flex justify-between">
              <div>
                <p className="text-slate-500 font-semibold uppercase">PREPARED FOR:</p>
                <p className="text-sm font-bold text-slate-100">{selectedQuo.customerName}</p>
                <p className="text-slate-400">Destination: {selectedQuo.country} — {selectedQuo.visaType}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 font-semibold uppercase">STATUS:</p>
                <StatusBadge status={selectedQuo.status} />
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-2">Service Line Item</th>
                  <th className="py-2 text-right">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {selectedQuo.services.map((s, idx) => (
                  <tr key={idx}>
                    <td className="py-2 text-slate-200 font-medium">{s.serviceName}</td>
                    <td className="py-2 text-right font-mono text-slate-300">{s.price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs text-right">
              <div className="text-slate-400">Subtotal: <span className="font-mono text-slate-200">LKR {selectedQuo.subtotal.toLocaleString()}</span></div>
              {selectedQuo.discount > 0 && (
                <div className="text-emerald-400">Package Concession / Discount: <span className="font-mono">- LKR {selectedQuo.discount.toLocaleString()}</span></div>
              )}
              <div className="text-base font-bold text-sky-400 pt-2 border-t border-slate-800">
                Final Payable Total: <CurrencyDisplay amount={selectedQuo.total} className="text-lg text-sky-400" />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800 space-y-1">
              <p><span className="font-semibold text-slate-400">Payment Terms:</span> {selectedQuo.paymentTerms}</p>
              <p><span className="font-semibold text-slate-400">Terms & Conditions:</span> {selectedQuo.termsAndConditions}</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </FormModal>
      )}

      {/* New Quotation Builder Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Quotation Builder & Live Preview"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="font-semibold text-slate-300">Target Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-300">Subtotal (LKR)</label>
              <input
                type="number"
                value={subtotal}
                onChange={(e) => setSubtotal(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">Discount (LKR)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">Validity Date</label>
              <input
                type="date"
                value={validityDate}
                onChange={(e) => setValidityDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              />
            </div>
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
              Generate & Save Quotation
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default QuotationsPage;
