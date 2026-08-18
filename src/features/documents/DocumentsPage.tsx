import React, { useState, useEffect } from 'react';
import { 
  FileCheck, Upload, Download, Eye, CheckCircle2, XCircle, 
  Search, Filter, FileText, ShieldCheck, Clock, AlertCircle, Lock, User, Calendar, Folder
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { DocumentItem, Customer } from '../../types';
import { documentsApi, customersApi } from '../../api';

type DocType = 
  | 'Passport'
  | 'NIC'
  | 'Birth Certificate'
  | 'Bank Statement'
  | 'Employment Letter'
  | 'Invitation Letter'
  | 'Cover Letter'
  | 'SOP'
  | 'Visa Application'
  | 'Insurance'
  | 'Hotel Booking'
  | 'Flight Reservation'
  | 'Refusal Letter'
  | 'Other';

type DocStatus = 'Required' | 'Requested' | 'Received' | 'Verified' | 'Rejected' | 'Expired';

const DOCUMENT_TYPES: DocType[] = [
  'Passport',
  'NIC',
  'Birth Certificate',
  'Bank Statement',
  'Employment Letter',
  'Invitation Letter',
  'Cover Letter',
  'SOP',
  'Visa Application',
  'Insurance',
  'Hotel Booking',
  'Flight Reservation',
  'Refusal Letter',
  'Other'
];

const DOCUMENT_STATUSES: DocStatus[] = [
  'Required',
  'Requested',
  'Received',
  'Verified',
  'Rejected',
  'Expired'
];

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<DocumentItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>('All');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Form State for Upload
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadDocType, setUploadDocType] = useState<DocType>('Passport');
  const [uploadCustomerName, setUploadCustomerName] = useState('');
  const [uploadCaseId, setUploadCaseId] = useState('CAS-9002');
  const [uploadStatus, setUploadStatus] = useState<DocStatus>('Received');

  // Toast Notification
  const [notification, setNotification] = useState<string | null>(null);

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const [docData, custRes] = await Promise.all([
        documentsApi.getAll(),
        customersApi.getAll()
      ]);
      setDocuments(docData);
      const custItems = Array.isArray(custRes) ? custRes : (custRes as any).items || [];
      setCustomers(custItems);
      if (custItems.length > 0 && !uploadCustomerName) {
        setUploadCustomerName(custItems[0].name);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // Apply Search & Filters
  useEffect(() => {
    let result = [...documents];

    if (selectedType !== 'All') {
      result = result.filter(d => d.documentType === selectedType);
    }

    if (selectedStatus !== 'All') {
      result = result.filter(d => d.status === selectedStatus);
    }

    if (selectedCustomerFilter !== 'All') {
      result = result.filter(d => d.customerName === selectedCustomerFilter);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(d => 
        d.fileName.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        (d.caseId && d.caseId.toLowerCase().includes(q)) ||
        (d.uploadedBy && d.uploadedBy.toLowerCase().includes(q))
      );
    }

    setFilteredDocs(result);
  }, [documents, selectedType, selectedStatus, selectedCustomerFilter, searchTerm]);

  // Handle Verification Action
  const handleVerifyStatus = async (id: string, newStatus: DocStatus) => {
    try {
      const updated = await documentsApi.updateStatus(id, newStatus, 'Nimali Fernando');
      setNotification(`Document "${updated.fileName}" status set to ${newStatus}!`);
      setTimeout(() => setNotification(null), 4000);
      setPreviewDoc(null);
      fetchDocs();
    } catch {
      alert('Error updating document status.');
    }
  };

  // Handle Document Upload Submit
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await documentsApi.create({
        fileName: uploadFileName || `${uploadCustomerName.replace(/\s+/g, '_')}_${uploadDocType}.pdf`,
        documentType: uploadDocType,
        customerName: uploadCustomerName,
        caseId: uploadCaseId || undefined,
        status: uploadStatus,
        uploadedDate: '2026-08-18',
        uploadedBy: 'Thenushan Sritharan'
      });

      setNotification(`Document "${created.fileName}" uploaded for customer "${created.customerName}" successfully!`);
      setTimeout(() => setNotification(null), 5000);
      setIsUploadModalOpen(false);
      fetchDocs();

      setUploadFileName('');
    } catch {
      alert('Error uploading document.');
    }
  };

  // KPI Computations
  const totalCount = documents.length;
  const verifiedCount = documents.filter(d => d.status === 'Verified').length;
  const pendingVerifyCount = documents.filter(d => d.status === 'Received' || d.status === 'Requested').length;
  const requiredCount = documents.filter(d => d.status === 'Required' || d.status === 'Rejected').length;

  // Documents belonging to current preview customer
  const clientDocs = previewDoc 
    ? documents.filter(d => d.customerName.toLowerCase() === previewDoc.customerName.toLowerCase())
    : [];

  // 8 Required Columns
  const columns: Column<DocumentItem>[] = [
    { 
      key: 'fileName', 
      header: '1. File Name', 
      render: (d) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{d.fileName}</div>
            <div className="text-[10px] text-slate-500 font-mono font-semibold">Vault Ref: {d.id}</div>
          </div>
        </div>
      ) 
    },
    { 
      key: 'documentType', 
      header: '2. Document Type', 
      render: (d) => (
        <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 whitespace-nowrap">
          {d.documentType}
        </span>
      ) 
    },
    { 
      key: 'customerName', 
      header: '3. Customer', 
      render: (d) => (
        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{d.customerName}</span>
      ) 
    },
    { 
      key: 'caseId', 
      header: '4. Case', 
      render: (d) => (
        <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
          {d.caseId || 'General Vault'}
        </span>
      ) 
    },
    { 
      key: 'status', 
      header: '5. Status', 
      render: (d) => {
        if (d.status === 'Verified') return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Verified</span>;
        if (d.status === 'Received') return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">Received</span>;
        if (d.status === 'Requested') return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">Requested</span>;
        if (d.status === 'Rejected') return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">Rejected</span>;
        if (d.status === 'Expired') return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">Expired</span>;
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">Required</span>;
      } 
    },
    { 
      key: 'uploadedDate', 
      header: '6. Uploaded Date', 
      render: (d) => <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">{d.uploadedDate || '—'}</span> 
    },
    { 
      key: 'uploadedBy', 
      header: '7. Uploaded By', 
      render: (d) => <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{d.uploadedBy || 'Client Upload'}</span> 
    },
    { 
      key: 'verifiedBy', 
      header: '8. Verified By', 
      render: (d) => (
        d.verifiedBy ? (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{d.verifiedBy}</span>
          </span>
        ) : (
          <span className="text-xs text-slate-400 font-medium italic">Pending Verification</span>
        )
      ) 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          title="Document Management Vault"
          subtitle="Centralized client document repository with registered customer filtering and verification workflow."
          breadcrumbs={[{ label: 'Document Vault' }]}
          actions={
            <PermissionGuard permission="visa.update">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Upload className="w-4 h-4 stroke-[3]" />
                <span>Upload Document</span>
              </button>
            </PermissionGuard>
          }
        />

        {/* Toast Notification */}
        {notification && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 text-xs font-bold flex items-center justify-between shadow-xs">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-emerald-600 font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Vault Files" value={totalCount} icon={FileText} colorScheme="blue" subtitle="all client documents" />
          <StatCard title="Pending Verification" value={pendingVerifyCount} icon={Clock} colorScheme="amber" subtitle="requires staff check" />
          <StatCard title="Verified Vault" value={verifiedCount} icon={ShieldCheck} colorScheme="emerald" subtitle="approved compliance" />
          <StatCard title="Action Required" value={requiredCount} icon={AlertCircle} colorScheme="rose" subtitle="missing or rejected" />
        </div>

        {/* Search & 3 Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search by File Name, Customer, Case ID, or Uploaded By..." 
            className="w-full lg:w-72" 
          />

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto text-xs">
            {/* Registered Customer Filter */}
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-bold text-slate-600 dark:text-slate-400">Customer:</span>
              <select
                value={selectedCustomerFilter}
                onChange={(e) => setSelectedCustomerFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500 max-w-[180px]"
              >
                <option value="All">All Registered Customers</option>
                {customers.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Document Type Filter (14 Categories) */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-600 dark:text-slate-400">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="All">All 14 Types</option>
                {DOCUMENT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Verification Status Filter (6 Statuses) */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600 dark:text-slate-400">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="All">All 6 Statuses</option>
                {DOCUMENT_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* DataTable (All 8 Display Columns) */}
        <DataTable
          columns={columns}
          data={filteredDocs}
          isLoading={isLoading}
          emptyText="No matching client documents found in vault."
          onRowClick={(d) => setPreviewDoc(d)}
          actions={(d) => (
            <button
              onClick={() => setPreviewDoc(d)}
              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 border border-blue-200 text-xs font-semibold hover:bg-blue-100 flex items-center gap-1 transition-all"
              title="Preview & Inspect All Customer Documents"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          )}
        />
      </div>

      {/* Document Preview & All Client Documents Modal */}
      {previewDoc && (
        <FormModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={`Document Vault File — ${previewDoc.fileName}`}
          subtitle={`Client: ${previewDoc.customerName} | Case: ${previewDoc.caseId || 'General Vault'}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Active Document Metadata & Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Metadata Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Document Type:</span> <span className="font-bold text-purple-600">{previewDoc.documentType}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Status:</span> <StatusBadge status={previewDoc.status} /></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Uploaded Date:</span> <span className="font-mono text-slate-800">{previewDoc.uploadedDate || '2026-08-18'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Uploaded By:</span> <span className="font-semibold text-slate-800">{previewDoc.uploadedBy || 'Client Direct'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Verification Officer:</span> <span className="font-bold text-emerald-600">{previewDoc.verifiedBy || 'Not Verified Yet'}</span></div>
              </div>

              {/* Document File Preview */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-center space-y-2 flex flex-col justify-center items-center">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate max-w-[200px]">{previewDoc.fileName}</p>
                  <p className="text-slate-500 text-[10px]">Certified PDF Vault File</p>
                </div>
                <button
                  onClick={() => alert(`Downloading ${previewDoc.fileName}...`)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-blue-500"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* Verification Controls */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-emerald-900 block">Verification Action</span>
                <span className="text-emerald-700 text-[11px]">Inspect pages and update compliance status</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleVerifyStatus(previewDoc.id, 'Verified')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm hover:bg-emerald-500"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Verified</span>
                </button>
                <button
                  onClick={() => handleVerifyStatus(previewDoc.id, 'Rejected')}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm hover:bg-rose-500"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject Document</span>
                </button>
              </div>
            </div>

            {/* ALL DOCUMENTS BELONGING TO THIS CUSTOMER */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                  <Folder className="w-4 h-4 text-blue-600" />
                  <span>All Vault Documents for Customer ({previewDoc.customerName})</span>
                </h4>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {clientDocs.length} Total Files
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
                {clientDocs.map((doc) => {
                  const isCurrent = doc.id === previewDoc.id;

                  return (
                    <div 
                      key={doc.id}
                      onClick={() => setPreviewDoc(doc)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isCurrent 
                          ? 'bg-blue-50 dark:bg-blue-950 border-blue-400 dark:border-blue-700 shadow-xs' 
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div className="min-w-0">
                          <p className={`font-bold text-xs truncate ${isCurrent ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100'}`}>
                            {doc.fileName}
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold">{doc.documentType}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <StatusBadge status={doc.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </FormModal>
      )}

      {/* Upload New Client Document Modal (Registered Customer Dropdown) */}
      {isUploadModalOpen && (
        <FormModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Upload Client Document to Vault"
          subtitle="Select registered customer to upload passports, bank statements, or SOPs"
          maxWidth="lg"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Registered Customer <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={uploadCustomerName}
                onChange={(e) => {
                  setUploadCustomerName(e.target.value);
                  const selectedCust = customers.find(c => c.name === e.target.value);
                  if (selectedCust) {
                    setUploadCaseId('CAS-9002');
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.customerId}) — {c.phone || 'Registered Client'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Type (14 Categories) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value as DocType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  {DOCUMENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Case Reference ID</label>
                <input
                  type="text"
                  placeholder="e.g. CAS-9002"
                  value={uploadCaseId}
                  onChange={(e) => setUploadCaseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">File Name Override</label>
                <input
                  type="text"
                  placeholder="e.g. Sanduni_DeSilva_Passport.pdf"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Status</label>
                <select
                  value={uploadStatus}
                  onChange={(e) => setUploadStatus(e.target.value as DocStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="Received">Received</option>
                  <option value="Requested">Requested</option>
                  <option value="Required">Required</option>
                  <option value="Verified">Verified</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Upload File (PDF, PNG, JPG)</label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-300 dark:border-slate-800">
                <Upload className="w-5 h-5 text-slate-400" />
                <input
                  type="file"
                  required
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0] && !uploadFileName) {
                      setUploadFileName(e.target.files[0].name);
                    }
                  }}
                  className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
              >
                Upload Document to Vault
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default DocumentsPage;
