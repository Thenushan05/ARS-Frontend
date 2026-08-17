import React, { useState } from 'react';
import { PieChart, Download, FileSpreadsheet, Calendar, Filter } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import PermissionGuard from '../../components/common/PermissionGuard';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';

export const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<'finance' | 'visa' | 'marketing' | 'staff'>('finance');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comprehensive Analytics & Reports"
        subtitle="Export P&L financial statements, embassy visa approval rates, lead conversion rates, and supplier payables."
        breadcrumbs={[{ label: 'Reports' }]}
        actions={
          <button
            onClick={() => alert('Report Export triggered (CSV / PDF)')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Report Data</span>
          </button>
        }
      />

      {/* Category Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setSelectedReport('finance')}
          className={`pb-3 border-b-2 transition-colors ${
            selectedReport === 'finance' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Financial P&L Reports
        </button>
        <button
          onClick={() => setSelectedReport('visa')}
          className={`pb-3 border-b-2 transition-colors ${
            selectedReport === 'visa' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Visa Success & Country Analytics
        </button>
        <button
          onClick={() => setSelectedReport('marketing')}
          className={`pb-3 border-b-2 transition-colors ${
            selectedReport === 'marketing' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Marketing Lead Source ROI
        </button>
      </div>

      {selectedReport === 'finance' && (
        <PermissionGuard permission="finance.profit.view">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-6">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Profit & Loss Statement (Year-to-Date)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-400 font-semibold">Gross Service Income</p>
                <CurrencyDisplay amount={21850000} className="text-2xl text-emerald-400 font-bold" />
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-400 font-semibold">Total Operating Expenses</p>
                <CurrencyDisplay amount={8450000} className="text-2xl text-rose-400 font-bold" />
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-400 font-semibold">Net Profit Margin</p>
                <CurrencyDisplay amount={13400000} className="text-2xl text-purple-400 font-bold" />
              </div>
            </div>
          </div>
        </PermissionGuard>
      )}

      {selectedReport === 'visa' && (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Country-wise Visa Approval Success Rates</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-slate-200">France (Schengen Area)</span>
              <span className="text-emerald-400 font-bold">92.5% Approval Rate (37 Approved / 3 Refused)</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-slate-200">United Kingdom (Student & Visitor)</span>
              <span className="text-emerald-400 font-bold">95.0% Approval Rate (40 Approved / 2 Refused)</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-slate-200">United Arab Emirates (e-Visa)</span>
              <span className="text-emerald-400 font-bold">99.1% Approval Rate (119 Approved / 1 Refused)</span>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'marketing' && (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Marketing Channel Lead Conversion Performance</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="text-slate-400 font-semibold">Facebook Ads</p>
              <p className="text-lg font-bold text-sky-400">38.4% Converted</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="text-slate-400 font-semibold">TikTok Ads</p>
              <p className="text-lg font-bold text-purple-400">29.1% Converted</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="text-slate-400 font-semibold">Google Search</p>
              <p className="text-lg font-bold text-emerald-400">54.2% Converted</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="text-slate-400 font-semibold">Direct Walk-ins</p>
              <p className="text-lg font-bold text-amber-400">68.0% Converted</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
