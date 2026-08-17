import React, { useState, useEffect } from 'react';
import { FileCheck, Upload, Download, Eye, CheckCircle2, XCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { DocumentItem } from '../../types';
import { documentsApi } from '../../api';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const data = await documentsApi.getAll();
      setDocuments(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const columns: Column<DocumentItem>[] = [
    { key: 'fileName', header: 'File Name', render: (d) => (
      <div>
        <div className="font-bold text-slate-100 text-xs">{d.fileName}</div>
        <div className="text-[11px] text-slate-400">{d.documentType}</div>
      </div>
    )},
    { key: 'customerName', header: 'Customer & Case', render: (d) => (
      <div>
        <div className="text-slate-200 text-xs">{d.customerName}</div>
        <div className="text-xs text-purple-400 font-mono">{d.caseId || 'General Vault'}</div>
      </div>
    )},
    { key: 'status', header: 'Verification Status', render: (d) => <StatusBadge status={d.status} /> },
    { key: 'uploadedDate', header: 'Uploaded', render: (d) => <span className="text-xs text-slate-400">{d.uploadedDate || '-'}</span> },
    { key: 'verifiedBy', header: 'Verified By', render: (d) => <span className="text-xs text-slate-300">{d.verifiedBy || 'Pending'}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Management Vault"
        subtitle="Centralized client document repository (Passport, Bank Statement, SOP, Insurance) with verification workflow."
        breadcrumbs={[{ label: 'Document Vault' }]}
        actions={
          <button
            onClick={() => alert('Document Upload Modal')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        }
      />

      <DataTable columns={columns} data={documents} isLoading={isLoading} />
    </div>
  );
};

export default DocumentsPage;
