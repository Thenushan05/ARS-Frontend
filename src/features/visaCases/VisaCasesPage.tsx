import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Briefcase, Clock, CheckCircle2, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import { VisaCase, VisaStatus } from '../../types';
import { visaCasesApi } from '../../api';

export const VisaCasesPage: React.FC = () => {
  const [cases, setCases] = useState<VisaCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState<VisaCase | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<VisaStatus>('New Case');
  const [statusNotes, setStatusNotes] = useState('');

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const res = await visaCasesApi.getAll({ search: searchTerm });
      setCases(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [searchTerm]);

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    await visaCasesApi.updateStatus(selectedCase.id, newStatus, statusNotes);
    setIsUpdateModalOpen(false);
    setSelectedCase(null);
    fetchCases();
  };

  const caseTimelineSteps: VisaStatus[] = [
    'New Case',
    'Document Collection',
    'Documents Completed',
    'Appointment Booked',
    'Submitted',
    'Processing',
    'Decision Received',
    'Approved'
  ];

  const columns: Column<VisaCase>[] = [
    { key: 'caseId', header: 'Case ID', render: (c) => <span className="font-mono text-sky-400 font-semibold">{c.caseId}</span> },
    { key: 'customerName', header: 'Customer', render: (c) => <span className="font-bold text-slate-100">{c.customerName}</span> },
    { key: 'country', header: 'Destination & Type', render: (c) => (
      <div>
        <div className="font-medium text-slate-200">{c.country}</div>
        <div className="text-xs text-slate-400">{c.visaType}</div>
      </div>
    )},
    { key: 'consultant', header: 'Consultant', render: (c) => <span className="text-slate-300">{c.consultant}</span> },
    { key: 'status', header: 'Current Lifecycle Status', render: (c) => <StatusBadge status={c.status} /> },
    { key: 'appointmentDate', header: 'VFS / Embassy Date', render: (c) => <span className="text-xs text-amber-400">{c.appointmentDate || 'Not Scheduled'}</span> },
    { key: 'createdAt', header: 'Opened', render: (c) => <span className="text-xs text-slate-500">{c.createdAt}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visa Case Management"
        subtitle="Track end-to-end visa applications, document status, VFS submissions, and embassy decisions."
        breadcrumbs={[{ label: 'Visa Cases' }]}
        actions={
          <button
            onClick={() => alert('Create new case from Customer profile.')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Open New Case</span>
          </button>
        }
      />

      <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search by case ID, customer, country..." className="max-w-md" />

      <DataTable
        columns={columns}
        data={cases}
        isLoading={isLoading}
        onRowClick={(c) => { setSelectedCase(c); setNewStatus(c.status); }}
        actions={(c) => (
          <button
            onClick={() => { setSelectedCase(c); setNewStatus(c.status); setIsUpdateModalOpen(true); }}
            className="px-3 py-1 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-semibold hover:bg-sky-500/25 transition-all"
          >
            Update Lifecycle
          </button>
        )}
      />

      {/* Visual Case Lifecycle Timeline Modal */}
      {selectedCase && isUpdateModalOpen && (
        <FormModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title={`Lifecycle Status — ${selectedCase.caseId} (${selectedCase.customerName})`}
          maxWidth="2xl"
        >
          <form onSubmit={handleUpdateStatusSubmit} className="space-y-6">
            {/* Visual Timeline Bar */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Application Timeline</p>
              <div className="flex items-center justify-between overflow-x-auto py-3 px-2 bg-slate-950 rounded-xl border border-slate-800 gap-2">
                {caseTimelineSteps.map((step, idx) => {
                  const isCurrent = selectedCase.status === step;
                  const isPassed = caseTimelineSteps.indexOf(selectedCase.status) > idx;

                  return (
                    <div key={step} className="flex items-center gap-1.5 shrink-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent ? 'bg-sky-500 text-white ring-4 ring-sky-500/30' : isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-600 border border-slate-800'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] font-medium ${isCurrent ? 'text-sky-400 font-bold' : 'text-slate-400'}`}>
                        {step}
                      </span>
                      {idx < caseTimelineSteps.length - 1 && <ChevronRight className="w-3 h-3 text-slate-700" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Select Status */}
            <div>
              <label className="text-xs font-semibold text-slate-300">Update Lifecycle Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as VisaStatus)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="New Case">New Case</option>
                <option value="Document Collection">Document Collection</option>
                <option value="Documents Pending">Documents Pending</option>
                <option value="Documents Completed">Documents Completed</option>
                <option value="Appointment Booked">Appointment Booked</option>
                <option value="Ready for Submission">Ready for Submission</option>
                <option value="Submitted">Submitted</option>
                <option value="Processing">Processing</option>
                <option value="Decision Received">Decision Received</option>
                <option value="Approved">Approved</option>
                <option value="Refused">Refused</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Status Update Notes / Remarks</label>
              <textarea
                rows={3}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Enter VFS reference number, embassy updates, or reason..."
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/20"
              >
                Save Status Update
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default VisaCasesPage;
