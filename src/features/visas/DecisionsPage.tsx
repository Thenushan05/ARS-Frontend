import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Award, FileText, Search, Filter, Eye, 
  RotateCcw, AlertTriangle, ShieldCheck, Clock, User, Calendar, Lock, Download, Printer
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { useAuth } from '../../context/AuthContext';

interface ApprovedVisaDecision {
  id: string;
  caseId: string;
  customerName: string;
  country: string;
  visaType: string;
  approvalDate: string;
  visaValidity: string;
  consultant: string;
  processingTime: string;
}

interface RefusedVisaDecision {
  id: string;
  caseId: string;
  customerName: string;
  country: string;
  visaType: string;
  refusalDate: string;
  reason: string;
  reapplyStatus: 'Eligible to Reapply' | 'Wait 6 Months' | 'Not Recommended';
  appealStatus: 'Appeal Eligible' | 'No Appeal Right' | 'Appeal In Progress';
  consultant: string;
  refusalLetterUrl?: string;
}

const MOCK_APPROVED: ApprovedVisaDecision[] = [
  {
    id: 'dec-1',
    caseId: 'CAS-9001',
    customerName: 'Dilshan Mendis',
    country: 'United Arab Emirates',
    visaType: '30-Day Express Tourist Visa',
    approvalDate: '2026-08-10',
    visaValidity: '2026-08-10 to 2026-11-10',
    consultant: 'Saman Jayasinghe',
    processingTime: '3 Days'
  },
  {
    id: 'dec-2',
    caseId: 'CAS-9003',
    customerName: 'Kamal Gunaratne',
    country: 'United Kingdom',
    visaType: 'Tier 4 Student Visa',
    approvalDate: '2026-08-01',
    visaValidity: '2026-09-01 to 2029-09-30',
    consultant: 'Thenushan Sritharan',
    processingTime: '21 Days'
  },
  {
    id: 'dec-3',
    caseId: 'CAS-9005',
    customerName: 'Nuwan Pradeep',
    country: 'Canada',
    visaType: 'Open Work Permit',
    approvalDate: '2026-07-28',
    visaValidity: '2026-08-01 to 2028-08-01',
    consultant: 'Kasun Perera',
    processingTime: '45 Days'
  }
];

const MOCK_REFUSED: RefusedVisaDecision[] = [
  {
    id: 'dec-4',
    caseId: 'CAS-9004',
    customerName: 'Anura Fernando',
    country: 'France',
    visaType: 'Schengen Tourist Visa',
    refusalDate: '2026-08-05',
    reason: 'Clause 2.1 — Insufficient proof of financial ties and intention to leave member state before visa expiry',
    reapplyStatus: 'Eligible to Reapply',
    appealStatus: 'Appeal Eligible',
    consultant: 'Nimali Fernando',
    refusalLetterUrl: '/docs/refusal_CAS9004.pdf'
  },
  {
    id: 'dec-5',
    caseId: 'CAS-9006',
    customerName: 'Roshan Silva',
    country: 'Australia',
    visaType: 'Subclass 600 Visitor Visa',
    refusalDate: '2026-07-15',
    reason: 'Section 65 — Inconsistent employment documentation and bank statement turnover justification',
    reapplyStatus: 'Wait 6 Months',
    appealStatus: 'No Appeal Right',
    consultant: 'Saman Jayasinghe',
    refusalLetterUrl: '/docs/refusal_CAS9006.pdf'
  }
];

export const DecisionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Approved' | 'Refused'>('Approved');
  const [approvedList, setApprovedList] = useState<ApprovedVisaDecision[]>(MOCK_APPROVED);
  const [refusedList, setRefusedList] = useState<RefusedVisaDecision[]>(MOCK_REFUSED);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [viewingRefusalLetter, setViewingRefusalLetter] = useState<RefusedVisaDecision | null>(null);

  const { hasPermission } = useAuth();
  const canViewRefusalLetter = hasPermission('visa.view');

  // Filter List
  const filteredApproved = approvedList.filter(a => 
    a.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRefused = refusedList.filter(r => 
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 7 Columns for Approved Visas
  const approvedColumns: Column<ApprovedVisaDecision>[] = [
    { 
      key: 'customerName', 
      header: '1. Customer', 
      render: (a) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{a.customerName}</div>
          <div className="font-mono text-[10px] text-purple-600 dark:text-purple-400 font-bold">{a.caseId}</div>
        </div>
      ) 
    },
    { 
      key: 'country', 
      header: '2. Country', 
      render: (a) => <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{a.country}</span> 
    },
    { 
      key: 'visaType', 
      header: '3. Visa Type', 
      render: (a) => (
        <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
          {a.visaType}
        </span>
      ) 
    },
    { 
      key: 'approvalDate', 
      header: '4. Approval Date', 
      render: (a) => <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{a.approvalDate}</span> 
    },
    { 
      key: 'visaValidity', 
      header: '5. Visa Validity', 
      render: (a) => <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-medium">{a.visaValidity}</span> 
    },
    { 
      key: 'consultant', 
      header: '6. Consultant', 
      render: (a) => <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{a.consultant}</span> 
    },
    { 
      key: 'processingTime', 
      header: '7. Processing Time', 
      render: (a) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          {a.processingTime}
        </span>
      ) 
    },
  ];

  // 8 Columns for Refused Visas
  const refusedColumns: Column<RefusedVisaDecision>[] = [
    { 
      key: 'customerName', 
      header: '1. Customer', 
      render: (r) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{r.customerName}</div>
          <div className="font-mono text-[10px] text-purple-600 dark:text-purple-400 font-bold">{r.caseId}</div>
        </div>
      ) 
    },
    { 
      key: 'country', 
      header: '2. Country', 
      render: (r) => <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{r.country}</span> 
    },
    { 
      key: 'visaType', 
      header: '3. Visa Type', 
      render: (r) => (
        <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800">
          {r.visaType}
        </span>
      ) 
    },
    { 
      key: 'refusalDate', 
      header: '4. Refusal Date', 
      render: (r) => <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">{r.refusalDate}</span> 
    },
    { 
      key: 'reason', 
      header: '5. Reason', 
      render: (r) => (
        <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium max-w-[220px] truncate" title={r.reason}>
          {r.reason}
        </p>
      ) 
    },
    { 
      key: 'reapplyStatus', 
      header: '6. Reapply', 
      render: (r) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
          r.reapplyStatus === 'Eligible to Reapply' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {r.reapplyStatus}
        </span>
      ) 
    },
    { 
      key: 'appealStatus', 
      header: '7. Appeal', 
      render: (r) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
          r.appealStatus === 'Appeal Eligible' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-300'
        }`}>
          {r.appealStatus}
        </span>
      ) 
    },
    { 
      key: 'consultant', 
      header: '8. Consultant', 
      render: (r) => <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{r.consultant}</span> 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          title="Visa Decisions & Refusal Management"
          subtitle="Track official embassy outcome decisions, granted visa validity, refusal clauses, and appeal filings."
          breadcrumbs={[{ label: 'Visa Decisions' }]}
        />

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Approved Visas" value={approvedList.length} icon={CheckCircle2} colorScheme="emerald" subtitle="visa granted" />
          <StatCard title="Refused Visas" value={refusedList.length} icon={XCircle} colorScheme="rose" subtitle="embassy refusal notices" />
          <StatCard title="Overall Approval Rate" value="84.2%" icon={Award} colorScheme="blue" subtitle="FY 2026 performance" />
        </div>

        {/* Tabs Switcher: Approved vs Refused */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('Approved')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'Approved'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approved Visas ({approvedList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('Refused')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'Refused'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Refused Visas ({refusedList.length})</span>
            </button>
          </div>

          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by customer, case ID, or country..."
            className="w-full sm:w-72"
          />
        </div>

        {/* APPROVED VIEW TABLE */}
        {activeTab === 'Approved' && (
          <DataTable
            columns={approvedColumns}
            data={filteredApproved}
            emptyText="No approved visa decisions logged."
          />
        )}

        {/* REFUSED VIEW TABLE */}
        {activeTab === 'Refused' && (
          <DataTable
            columns={refusedColumns}
            data={filteredRefused}
            emptyText="No refused visa decisions logged."
            actions={(r) => (
              canViewRefusalLetter ? (
                <button
                  onClick={() => setViewingRefusalLetter(r)}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 text-xs font-semibold hover:bg-rose-100 flex items-center gap-1 transition-all"
                  title="View Official Embassy Refusal Letter"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Refusal Letter</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-100">
                  <Lock className="w-3 h-3" /> Restricted
                </span>
              )
            )}
          />
        )}
      </div>

      {/* Official Refusal Letter Modal (Permission Guarded) */}
      {viewingRefusalLetter && (
        <FormModal
          isOpen={!!viewingRefusalLetter}
          onClose={() => setViewingRefusalLetter(null)}
          title={`Official Embassy Refusal Letter — ${viewingRefusalLetter.customerName}`}
          subtitle={`Case: ${viewingRefusalLetter.caseId} | Embassy of ${viewingRefusalLetter.country}`}
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs">
            {/* Letter Header Frame */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border-2 border-rose-200 dark:border-rose-900 shadow-md space-y-4">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-widest block">EMBASSY OFFICIAL REFUSAL NOTICE</span>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mt-1">
                    Visa Application Outcome: REFUSED
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Refusal Date: {viewingRefusalLetter.refusalDate}</p>
                </div>
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                  <XCircle className="w-8 h-8" />
                </div>
              </div>

              {/* Applicant Info */}
              <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs">
                <div><span className="text-slate-500 font-bold block">Applicant Name:</span> <span className="font-bold text-slate-900 dark:text-slate-100">{viewingRefusalLetter.customerName}</span></div>
                <div><span className="text-slate-500 font-bold block">Visa Category:</span> <span className="font-bold text-purple-600">{viewingRefusalLetter.visaType}</span></div>
                <div><span className="text-slate-500 font-bold block">Assigned Consultant:</span> <span className="font-semibold text-slate-800">{viewingRefusalLetter.consultant}</span></div>
                <div><span className="text-slate-500 font-bold block">Target Jurisdiction:</span> <span className="font-semibold text-slate-800">{viewingRefusalLetter.country}</span></div>
              </div>

              {/* Refusal Grounds */}
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 space-y-2">
                <span className="font-bold text-rose-900 dark:text-rose-100 block text-xs uppercase tracking-wider">OFFICIAL EMBASSY REFUSAL GROUNDS:</span>
                <p className="text-rose-800 dark:text-rose-200 font-medium leading-relaxed italic">
                  "{viewingRefusalLetter.reason}"
                </p>
              </div>

              {/* Reapplication & Appeal Next Steps */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-900 font-bold block mb-1">Reapplication Eligibility:</span>
                  <span className="font-bold text-emerald-700 block">{viewingRefusalLetter.reapplyStatus}</span>
                  <p className="text-[10px] text-emerald-800 mt-1">Client can submit fresh application with upgraded financial tie documentation.</p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-blue-900 font-bold block mb-1">Appeal Filing Guidelines:</span>
                  <span className="font-bold text-blue-700 block">{viewingRefusalLetter.appealStatus}</span>
                  <p className="text-[10px] text-blue-800 mt-1">Appeal notice must be lodged within 28 days of refusal notice date.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => alert(`Downloading refusal notice PDF for ${viewingRefusalLetter.customerName}...`)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-1.5 hover:bg-blue-500"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Letter PDF</span>
                </button>
              </div>

              <button
                onClick={() => setViewingRefusalLetter(null)}
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

export default DecisionsPage;
