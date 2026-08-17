import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Building, FileText, Globe } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

export const SettingsPage: React.FC = () => {
  const [companyName, setCompanyName] = useState('ARS VISA & CONSULTANTS');
  const [address, setAddress] = useState('No. 10, Access Towers, Union Place, Colombo 02, Sri Lanka');
  const [phone, setPhone] = useState('+94 11 234 5678');
  const [whatsApp, setWhatsApp] = useState('+94 77 123 4567');
  const [email, setEmail] = useState('info@arsvisa.com');
  const [currency, setCurrency] = useState('LKR');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-2026-');
  const [quotationPrefix, setQuotationPrefix] = useState('QUO-2026-');
  const [receiptPrefix, setReceiptPrefix] = useState('REC-2026-');
  const [casePrefix, setCasePrefix] = useState('CAS-');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('System settings updated successfully!');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Configurations & Settings"
        subtitle="Manage company profile, document prefixes (INV-, QUO-, CAS-), tax defaults, and country parameters."
        breadcrumbs={[{ label: 'System Settings' }]}
      />

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs max-w-4xl">
        {/* Company Info Card */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-sky-400 font-bold border-b border-slate-800 pb-3 text-sm">
            <Building className="w-4 h-4" />
            <span>Company Profile & Branding</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300">Company Legal Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">Head Office Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">WhatsApp Official</label>
              <input
                type="text"
                value={whatsApp}
                onChange={(e) => setWhatsApp(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Document Prefixes Card */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-purple-400 font-bold border-b border-slate-800 pb-3 text-sm">
            <FileText className="w-4 h-4" />
            <span>Document Serial Prefixes</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="font-semibold text-slate-300">Invoice Prefix</label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sky-400 font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">Quotation Prefix</label>
              <input
                type="text"
                value={quotationPrefix}
                onChange={(e) => setQuotationPrefix(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sky-400 font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">Receipt Prefix</label>
              <input
                type="text"
                value={receiptPrefix}
                onChange={(e) => setReceiptPrefix(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sky-400 font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">Visa Case Prefix</label>
              <input
                type="text"
                value={casePrefix}
                onChange={(e) => setCasePrefix(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sky-400 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
