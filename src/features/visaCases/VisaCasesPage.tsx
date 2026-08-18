import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Calendar, Edit, Eye, CheckCircle2, Clock, 
  FileText, ShieldCheck, UserCheck, AlertTriangle, AlertCircle, ChevronRight,
  Upload, DollarSign, History, RefreshCw, X, ChevronDown, Check, ArrowRight, User, Layers
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { VisaCase, VisaStatus, VisaCategory, Customer } from '../../types';
import { visaCasesApi, customersApi } from '../../api';

export const VisaCasesPage: React.FC = () => {
  const [cases, setCases] = useState<VisaCase[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Selected Case for 6-Tab Detail View
  const [selectedCase, setSelectedCase] = useState<VisaCase | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Documents' | 'Appointments' | 'Payments' | 'Notes' | 'Status History'>('Overview');

  // Modals for Create and Update Status
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<VisaStatus>('New Case');
  const [statusNotes, setStatusNotes] = useState('');

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // New Case Form State
  const [newCaseData, setNewCaseData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    country: 'France',
    visaCategory: 'Tourist' as VisaCategory,
    visaType: 'Schengen Short Stay Tourist Visa',
    consultant: 'Saman Jayasinghe',
    notes: ''
  });

  // Mock Document Checklist State per Case
  const [documents, setDocuments] = useState([
    { id: 'doc-1', title: 'Passport Original & Bio Page Scan', category: 'Identification', status: 'Verified', date: '2026-08-11' },
    { id: 'doc-2', title: 'Bank Statement (Last 6 Months)', category: 'Financial', status: 'Verified', date: '2026-08-12' },
    { id: 'doc-3', title: 'Employment & Salary Certificate Letter', category: 'Employment', status: 'Verified', date: '2026-08-13' },
    { id: 'doc-4', title: 'Flight Reservation & Travel Itinerary', category: 'Travel', status: 'Uploaded', date: '2026-08-14' },
    { id: 'doc-5', title: 'Hotel Accommodation Voucher', category: 'Accommodation', status: 'Verified', date: '2026-08-14' },
    { id: 'doc-6', title: 'VFS Visa Application Form Signed', category: 'Application', status: 'Pending', date: '-' }
  ]);

  // Mock Notes Log
  const [caseNotes, setCaseNotes] = useState<Array<{ id: string; author: string; text: string; date: string }>>([
    { id: 'n-1', author: 'Saman Jayasinghe', text: 'Initial consultation completed. Passport and 6-month bank statement received.', date: '2026-08-10 10:30 AM' },
    { id: 'n-2', author: 'Nimali Fernando', text: 'VFS appointment successfully booked for August 25th at 09:30 AM.', date: '2026-08-14 02:15 PM' }
  ]);
  const [newNoteInput, setNewNoteInput] = useState('');

  // Mock Status History Audit Log
  const [statusLogs, setStatusLogs] = useState<Array<{ id: string; from: string; to: string; updatedBy: string; date: string; notes?: string }>>([
    { id: 'h-1', from: 'New Case', to: 'Document Collection', updatedBy: 'Saman Jayasinghe', date: '2026-08-11 11:00 AM', notes: 'Collected passport copy and bank statement.' },
    { id: 'h-2', from: 'Document Collection', to: 'Appointment Booked', updatedBy: 'Nimali Fernando', date: '2026-08-14 02:30 PM', notes: 'Booked VFS appointment reference VFS-SL-892301.' }
  ]);

  const allStatuses: VisaStatus[] = [
    'New Case',
    'Document Collection',
    'Documents Pending',
    'Documents Completed',
    'Appointment Booked',
    'Ready for Submission',
    'Submitted',
    'Processing',
    'Additional Documents Requested',
    'Decision Received',
    'Approved',
    'Refused',
    'Closed'
  ];

  const caseTimelineSteps: VisaStatus[] = [
    'New Case',
    'Document Collection',
    'Appointment Booked',
    'Submitted',
    'Processing',
    'Decision Received',
    'Approved'
  ];

  const visaCategories: VisaCategory[] = ['Tourist', 'Student', 'Work', 'Business', 'Sponsor', 'e-Visa'];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [casesRes, custRes] = await Promise.all([
        visaCasesApi.getAll({ search: searchTerm, status: statusFilter, category: categoryFilter }),
        customersApi.getAll()
      ]);
      setCases(casesRes.data);
      setCustomers(custRes.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, statusFilter, categoryFilter]);

  const handleOpenDetailModal = (visaCase: VisaCase) => {
    setSelectedCase(visaCase);
    setNewStatus(visaCase.status);
    setStatusNotes('');
    setActiveTab('Overview');
    setIsDetailModalOpen(true);
  };

  const handleCreateCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseData.customerName || !newCaseData.country) return;

    const created = await visaCasesApi.create(newCaseData);
    setIsCreateModalOpen(false);
    fetchData();
    setNotification({
      message: `Successfully created new Visa Case ${created.caseId} for ${created.customerName}!`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    const prevStatus = selectedCase.status;
    const updated = await visaCasesApi.updateStatus(selectedCase.id, newStatus, statusNotes);

    // Append to Audit History Log
    setStatusLogs(prev => [
      {
        id: `h-${Date.now()}`,
        from: prevStatus,
        to: newStatus,
        updatedBy: 'Saman Jayasinghe',
        date: new Date().toLocaleString(),
        notes: statusNotes || 'Status updated via Case Management dashboard.'
      },
      ...prev
    ]);

    setSelectedCase(updated);
    setIsUpdateStatusModalOpen(false);
    fetchData();
    setNotification({
      message: `Visa Case ${updated.caseId} status updated from "${prevStatus}" to "${newStatus}"!`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;

    const newNoteObj = {
      id: `n-${Date.now()}`,
      author: 'Saman Jayasinghe (Consultant)',
      text: newNoteInput.trim(),
      date: new Date().toLocaleString()
    };

    setCaseNotes(prev => [newNoteObj, ...prev]);
    setNewNoteInput('');
  };

  const handleToggleDocStatus = (docId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        const nextStatus = doc.status === 'Verified' ? 'Pending' : doc.status === 'Uploaded' ? 'Verified' : 'Uploaded';
        return { ...doc, status: nextStatus, date: new Date().toISOString().split('T')[0] };
      }
      return doc;
    }));
  };

  // 10 Required Columns
  const columns: Column<VisaCase>[] = [
    { 
      key: 'caseId', 
      header: 'Case ID', 
      render: (c) => <span className="font-mono text-blue-600 dark:text-sky-400 font-bold">{c.caseId}</span> 
    },
    { 
      key: 'customerName', 
      header: 'Customer', 
      render: (c) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{c.customerName}</div>
          <div className="text-[11px] text-slate-500 font-mono">{c.customerPhone || 'N/A'}</div>
        </div>
      ) 
    },
    { 
      key: 'country', 
      header: 'Country', 
      render: (c) => <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs">{c.country}</span> 
    },
    { 
      key: 'visaCategory', 
      header: 'Visa Category', 
      render: (c) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {c.visaCategory}
        </span>
      ) 
    },
    { 
      key: 'visaType', 
      header: 'Visa Type', 
      render: (c) => <span className="text-slate-600 dark:text-slate-400 text-xs truncate max-w-[150px] inline-block">{c.visaType}</span> 
    },
    { 
      key: 'consultant', 
      header: 'Consultant', 
      render: (c) => <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">{c.consultant}</span> 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (c) => <StatusBadge status={c.status} /> 
    },
    { 
      key: 'submissionDate', 
      header: 'Submission Date', 
      render: (c) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{c.submissionDate || 'Pending'}</span> 
    },
    { 
      key: 'appointmentDate', 
      header: 'Appointment Date', 
      render: (c) => (
        c.appointmentDate ? (
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{c.appointmentDate}</span>
          </span>
        ) : (
          <span className="text-xs text-slate-400">Not Scheduled</span>
        )
      ) 
    },
    { 
      key: 'createdAt', 
      header: 'Created Date', 
      render: (c) => <span className="text-xs text-slate-500">{c.createdAt}</span> 
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visa Case Management"
        subtitle="Track embassy application lifecycles, manage document checklists, appointments, and payments."
        breadcrumbs={[{ label: 'Visa Cases' }]}
        actions={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Apply New Visa Case</span>
          </button>
        }
      />

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <SearchInput 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Search by Case ID (CAS-9001), Customer, Phone, Country..." 
          className="w-full md:w-80" 
        />

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All 13 Statuses</option>
              {allStatuses.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Visa Category Filter */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Visa Categories</option>
              {visaCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={cases}
        isLoading={isLoading}
        emptyText="No visa cases matching criteria."
        onRowClick={(c) => handleOpenDetailModal(c)}
        actions={(c) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => handleOpenDetailModal(c)}
              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-sky-500/30 text-xs font-semibold hover:bg-blue-100 flex items-center gap-1 transition-all"
              title="View 6-Tab Case Details"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>

            <PermissionGuard permission="visa.update">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCase(c);
                  setNewStatus(c.status);
                  setStatusNotes('');
                  setIsUpdateStatusModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 text-xs font-semibold hover:bg-purple-100 flex items-center gap-1 transition-all"
                title="Update Case Status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Update Status</span>
              </button>
            </PermissionGuard>
          </div>
        )}
      />

      {/* Case Detail Modal with 6 Interactive Tabs & Visual Case Timeline */}
      {isDetailModalOpen && selectedCase && (
        <FormModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Visa Case ${selectedCase.caseId} — ${selectedCase.customerName} (${selectedCase.country})`}
          maxWidth="4xl"
        >
          <div className="space-y-6 text-xs">
            {/* Visual Case Timeline Component */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Embassy Application Lifecycle Timeline
                </p>
                <StatusBadge status={selectedCase.status} />
              </div>

              <div className="flex items-center justify-between overflow-x-auto py-3 px-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 gap-2">
                {caseTimelineSteps.map((step, idx) => {
                  const isCurrent = selectedCase.status === step;
                  const isPassed = caseTimelineSteps.indexOf(selectedCase.status) > idx;

                  return (
                    <div key={step} className="flex items-center gap-1.5 shrink-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent 
                          ? 'bg-blue-600 text-white ring-4 ring-blue-500/30' 
                          : isPassed 
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] font-medium ${isCurrent ? 'text-blue-600 dark:text-sky-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                        {step}
                      </span>
                      {idx < caseTimelineSteps.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-700" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6 Tabs Navigation Bar */}
            <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
              {[
                { name: 'Overview', icon: FileText },
                { name: 'Documents', icon: Upload },
                { name: 'Appointments', icon: Clock },
                { name: 'Payments', icon: DollarSign },
                { name: 'Notes', icon: AlertCircle },
                { name: 'Status History', icon: History }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.name;

                return (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition-all shrink-0 ${
                      isActive
                        ? 'border-blue-600 text-blue-600 dark:text-sky-400 bg-blue-50/50 dark:bg-sky-500/10 rounded-t-xl'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'Overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <p className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1 uppercase text-[11px]">
                    Case & Embassy Details
                  </p>
                  <div><span className="text-slate-500">Case Reference ID:</span> <span className="font-mono font-bold text-blue-600 dark:text-sky-400">{selectedCase.caseId}</span></div>
                  <div><span className="text-slate-500">Destination Country:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCase.country}</span></div>
                  <div><span className="text-slate-500">Visa Category:</span> <span className="font-bold text-blue-600 dark:text-sky-400">{selectedCase.visaCategory}</span></div>
                  <div><span className="text-slate-500">Visa Type Description:</span> <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedCase.visaType}</span></div>
                  <div><span className="text-slate-500">Assigned Consultant:</span> <span className="font-semibold text-purple-600 dark:text-purple-400">{selectedCase.consultant}</span></div>
                  <div><span className="text-slate-500">Current Status:</span> <StatusBadge status={selectedCase.status} /></div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <p className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1 uppercase text-[11px]">
                    Client & Important Dates
                  </p>
                  <div><span className="text-slate-500">Client Full Name:</span> <span className="font-bold text-slate-900 dark:text-slate-100">{selectedCase.customerName}</span></div>
                  <div><span className="text-slate-500">Contact Phone:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{selectedCase.customerPhone || 'N/A'}</span></div>
                  <div><span className="text-slate-500">Created Date:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCase.createdAt}</span></div>
                  <div><span className="text-slate-500">Submission Date:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCase.submissionDate || 'Not Submitted Yet'}</span></div>
                  <div><span className="text-slate-500">VFS Appointment Date:</span> <span className="font-bold text-amber-600 dark:text-amber-400">{selectedCase.appointmentDate || 'Not Scheduled'}</span></div>
                  <div><span className="text-slate-500">Decision Date:</span> <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedCase.decisionDate || 'Awaiting Embassy Response'}</span></div>
                  {selectedCase.validityPeriod && (
                    <div><span className="text-slate-500">Visa Stamp Validity:</span> <span className="font-mono font-bold text-emerald-600">{selectedCase.validityPeriod}</span></div>
                  )}
                  {selectedCase.refusalReason && (
                    <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                      Refusal Reason: {selectedCase.refusalReason}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Documents */}
            {activeTab === 'Documents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Visa Application Document Checklist</p>
                    <p className="text-slate-500 text-[11px]">Track required supporting documents for {selectedCase.country} embassy submission.</p>
                  </div>
                  <button 
                    onClick={() => alert('Opening Document Upload Manager...')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  {documents.map(doc => (
                    <div key={doc.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{doc.title}</p>
                          <p className="text-[11px] text-slate-500">Category: {doc.category} | Verified Date: {doc.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          doc.status === 'Verified'
                            ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200'
                            : doc.status === 'Uploaded'
                            ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200'
                            : 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200'
                        }`}>
                          {doc.status}
                        </span>
                        <button
                          onClick={() => handleToggleDocStatus(doc.id)}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-[11px]"
                        >
                          Toggle Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Appointments */}
            {activeTab === 'Appointments' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <p className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px]">
                      VFS Global / Embassy Appointment Schedule
                    </p>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200 text-[11px]">
                      Confirmed Appointment
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500">Appointment Center:</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">VFS Global Visa Application Center, Colombo</p>
                    </div>
                    <div>
                      <span className="text-slate-500">VFS Reference Number:</span>
                      <p className="font-mono font-bold text-blue-600 dark:text-sky-400">VFS-SL-892301</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Date & Biometrics Time:</span>
                      <p className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-4 h-4" />
                        <span>August 22, 2026 — 09:30 AM</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Biometrics Status:</span>
                      <p className="font-semibold text-emerald-600">Fingerprints & Photograph Scheduled</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Payments */}
            {activeTab === 'Payments' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <p className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px]">
                      Visa Case Billing & Fee Breakdown
                    </p>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[11px]">
                      Fully Paid
                    </span>
                  </div>

                  <div className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    <div className="py-2 flex justify-between"><span>ARS Consultancy & Documentation Fee</span><span className="font-bold">LKR 75,000</span></div>
                    <div className="py-2 flex justify-between"><span>VFS Embassy Official Visa Fee</span><span className="font-bold">LKR 45,000</span></div>
                    <div className="py-2 flex justify-between"><span>Translation & Official Notary Fee</span><span className="font-bold">LKR 12,000</span></div>
                    <div className="py-2 flex justify-between"><span>Schengen Travel Insurance (90 Days)</span><span className="font-bold">LKR 18,000</span></div>
                    <div className="py-2 flex justify-between text-sm font-black border-t border-slate-300 dark:border-slate-700 pt-2 text-slate-900 dark:text-slate-100">
                      <span>Total Case Cost</span>
                      <span className="text-blue-600 dark:text-sky-400">LKR 150,000</span>
                    </div>
                    <div className="py-2 flex justify-between text-xs font-bold text-emerald-600">
                      <span>Total Amount Paid</span>
                      <span>LKR 150,000</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Notes */}
            {activeTab === 'Notes' && (
              <div className="space-y-4">
                {/* Add New Note */}
                <form onSubmit={handleAddNote} className="space-y-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">Add Internal Case Remark</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNoteInput}
                      onChange={(e) => setNewNoteInput(e.target.value)}
                      placeholder="Type consultant remark or customer instruction..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm"
                    >
                      Post Note
                    </button>
                  </div>
                </form>

                {/* Notes History */}
                <div className="space-y-3">
                  {caseNotes.map(n => (
                    <div key={n.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-purple-600 dark:text-purple-400">{n.author}</span>
                        <span className="text-slate-400">{n.date}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 6: Status History */}
            {activeTab === 'Status History' && (
              <div className="space-y-3">
                <p className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px]">Audit History Log</p>
                <div className="space-y-2.5">
                  {statusLogs.map(log => (
                    <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2 font-bold">
                          <span className="text-slate-500">{log.from}</span>
                          <ArrowRight className="w-3 h-3 text-blue-600" />
                          <span className="text-blue-600 dark:text-sky-400">{log.to}</span>
                        </div>
                        <span className="text-slate-400">{log.date}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">Updated by: <span className="font-semibold text-slate-800 dark:text-slate-200">{log.updatedBy}</span></p>
                      {log.notes && <p className="text-slate-700 dark:text-slate-300 text-xs italic">{log.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FormModal>
      )}

      {/* Modal 2: Create New Visa Case */}
      {isCreateModalOpen && (
        <FormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Apply New Visa Case"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateCaseSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Registered Customer <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={newCaseData.customerId}
                onChange={(e) => {
                  const cust = customers.find(c => c.id === e.target.value);
                  if (cust) {
                    setNewCaseData({
                      ...newCaseData,
                      customerId: cust.id,
                      customerName: cust.name,
                      customerPhone: cust.phone,
                      country: cust.applyingCountry || newCaseData.country,
                      visaCategory: cust.visaCategory || newCaseData.visaCategory
                    });
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.customerId}) — {c.phone}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Destination Country *</label>
                <input
                  type="text"
                  required
                  value={newCaseData.country}
                  onChange={(e) => setNewCaseData({ ...newCaseData, country: e.target.value })}
                  placeholder="e.g. France"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Visa Category</label>
                <select
                  value={newCaseData.visaCategory}
                  onChange={(e) => setNewCaseData({ ...newCaseData, visaCategory: e.target.value as VisaCategory })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {visaCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Visa Type Specification</label>
                <input
                  type="text"
                  value={newCaseData.visaType}
                  onChange={(e) => setNewCaseData({ ...newCaseData, visaType: e.target.value })}
                  placeholder="e.g. Schengen Short Stay Tourist Visa (90 Days)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Consultant</label>
                <select
                  value={newCaseData.consultant}
                  onChange={(e) => setNewCaseData({ ...newCaseData, consultant: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Saman Jayasinghe">Saman Jayasinghe (Senior Consultant)</option>
                  <option value="Nimali Fernando">Nimali Fernando (Visa Specialist)</option>
                  <option value="Thenushan Sritharan">Thenushan Sritharan (Manager)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20"
              >
                Initialize Visa Case
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {/* Modal 3: Update Lifecycle Status */}
      {isUpdateStatusModalOpen && selectedCase && (
        <FormModal
          isOpen={isUpdateStatusModalOpen}
          onClose={() => setIsUpdateStatusModalOpen(false)}
          title={`Update Status — Visa Case ${selectedCase.caseId}`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Update Status (All 13 Statuses)</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as VisaStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-bold"
              >
                {allStatuses.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Update Notes / Embassy Remarks</label>
              <textarea
                rows={3}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Enter VFS reference number, passport submission date, or embassy update..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsUpdateStatusModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/20"
              >
                Save Status Change
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default VisaCasesPage;
