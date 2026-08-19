import React, { useState } from 'react';
import {
  Plus, Filter, Share2, Eye, Edit, Archive, Clock, UserPlus, CheckCircle2, AlertCircle, Phone, Mail,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { useStaffOptions } from '../../hooks/useStaffOptions';
import { useCountryOptions } from '../../hooks/useCountryOptions';
import { normalizeApiError } from '../../api/errors';
import { LEAD_STATUS, LEAD_SOURCE, VISA_CATEGORY } from '../../utils/enumLabels';
import {
  ApiLead, ApiLeadStatus, ApiLeadSource, ApiVisaCategory,
  CreateLeadInput, UpdateLeadInput, ConvertLeadInput,
} from '../../types/api';
import {
  useLeads, useCreateLead, useUpdateLead, useArchiveLead, useConvertLead,
} from './hooks/useLeadsQueries';

const PAGE_LIMIT = 10;

interface LeadFormState {
  fullName: string;
  phone: string;
  email: string;
  interestedCountryId: string;
  interestedVisaType: string;
  source: ApiLeadSource;
  assignedStaffId: string;
  status: ApiLeadStatus;
  notes: string;
  nextFollowUpAt: string;
}

const emptyFormState: LeadFormState = {
  fullName: '',
  phone: '',
  email: '',
  interestedCountryId: '',
  interestedVisaType: '',
  source: LEAD_SOURCE.values[0],
  assignedStaffId: '',
  status: 'NEW_LEAD',
  notes: '',
  nextFollowUpAt: '',
};

interface FollowUpFormState {
  status: ApiLeadStatus;
  nextFollowUpAt: string;
  notes: string;
}

interface ConvertFormState {
  assignedConsultantId: string;
  visaCategory: ApiVisaCategory | '';
  notes: string;
}

const inputClass =
  'w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none';
const disabledInputClass =
  'w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed opacity-70';
const labelClass = 'block font-semibold text-slate-700 dark:text-slate-300 mb-1';

export const LeadsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApiLeadStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<ApiLeadSource | ''>('');

  const { data, isLoading } = useLeads({
    page,
    limit: PAGE_LIMIT,
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
  });
  const leads = data?.data ?? [];
  const pagination = data?.pagination;

  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const archiveLead = useArchiveLead();
  const convertLead = useConvertLead();

  const { options: staffOptions, enabled: staffEnabled } = useStaffOptions();
  const { options: countryOptions, enabled: countryEnabled } = useCountryOptions();

  // Add / Edit modal
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<ApiLead | null>(null);
  const [formData, setFormData] = useState<LeadFormState>(emptyFormState);

  // View modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingLead, setViewingLead] = useState<ApiLead | null>(null);

  // Follow-up modal
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpLead, setFollowUpLead] = useState<ApiLead | null>(null);
  const [followUpData, setFollowUpData] = useState<FollowUpFormState>({
    status: 'CONTACTED',
    nextFollowUpAt: '',
    notes: '',
  });

  // Convert modal
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState<ApiLead | null>(null);
  const [convertData, setConvertData] = useState<ConvertFormState>({
    assignedConsultantId: '',
    visaCategory: '',
    notes: '',
  });

  // Notification toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showSuccess = (message: string) => {
    setNotification({ message, type: 'success' });
    setTimeout(() => setNotification(null), 6000);
  };
  const showError = (err: unknown) => {
    const { message } = normalizeApiError(err);
    setNotification({ message, type: 'error' });
    setTimeout(() => setNotification(null), 8000);
  };

  const handleOpenAddEditModal = (lead?: ApiLead) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        fullName: lead.fullName,
        phone: lead.phone,
        email: lead.email ?? '',
        interestedCountryId: lead.interestedCountryId ?? '',
        interestedVisaType: lead.interestedVisaType ?? '',
        source: lead.source,
        assignedStaffId: lead.assignedStaffId ?? '',
        status: lead.status,
        notes: lead.notes ?? '',
        nextFollowUpAt: lead.nextFollowUpAt ? lead.nextFollowUpAt.slice(0, 10) : '',
      });
    } else {
      setEditingLead(null);
      setFormData(emptyFormState);
    }
    setIsAddEditModalOpen(true);
  };

  const handleAddEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    if (editingLead) {
      const input: UpdateLeadInput = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        interestedCountryId: formData.interestedCountryId || undefined,
        interestedVisaType: formData.interestedVisaType || undefined,
        source: formData.source,
        assignedStaffId: formData.assignedStaffId || undefined,
        status: formData.status,
        notes: formData.notes || undefined,
        nextFollowUpAt: formData.nextFollowUpAt || undefined,
      };
      updateLead.mutate(
        { id: editingLead.id, input },
        {
          onSuccess: (updated) => {
            if (viewingLead?.id === editingLead.id) setViewingLead(updated);
            setIsAddEditModalOpen(false);
            showSuccess(`Successfully updated lead details for ${updated.fullName} (${updated.leadCode})!`);
          },
          onError: showError,
        },
      );
    } else {
      const input: CreateLeadInput = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        interestedCountryId: formData.interestedCountryId || undefined,
        interestedVisaType: formData.interestedVisaType || undefined,
        source: formData.source,
        assignedStaffId: formData.assignedStaffId || undefined,
        notes: formData.notes || undefined,
        nextFollowUpAt: formData.nextFollowUpAt || undefined,
      };
      createLead.mutate(input, {
        onSuccess: (created) => {
          setIsAddEditModalOpen(false);
          showSuccess(`Successfully created new inquiry lead ${created.leadCode} for ${created.fullName}!`);
        },
        onError: showError,
      });
    }
  };

  const handleOpenFollowUp = (lead: ApiLead) => {
    setFollowUpLead(lead);
    setFollowUpData({
      status: lead.status === 'NEW_LEAD' ? 'CONTACTED' : lead.status,
      nextFollowUpAt: lead.nextFollowUpAt ? lead.nextFollowUpAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
      notes: '',
    });
    setIsFollowUpModalOpen(true);
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpLead) return;

    const existingNotes = followUpLead.notes ? `${followUpLead.notes}\n` : '';
    const newNotes = followUpData.notes
      ? `${existingNotes}[Follow-up ${new Date().toISOString().slice(0, 10)}]: ${followUpData.notes}`
      : (followUpLead.notes ?? undefined);

    updateLead.mutate(
      {
        id: followUpLead.id,
        input: {
          status: followUpData.status,
          nextFollowUpAt: followUpData.nextFollowUpAt || undefined,
          notes: newNotes,
        },
      },
      {
        onSuccess: (updated) => {
          if (viewingLead?.id === followUpLead.id) setViewingLead(updated);
          setIsFollowUpModalOpen(false);
          showSuccess(
            `Follow-up recorded for lead ${followUpLead.fullName} (${followUpLead.leadCode})! Status updated to ${LEAD_STATUS.labels[followUpData.status]}.`,
          );
        },
        onError: showError,
      },
    );
  };

  const handleOpenConvert = (lead: ApiLead) => {
    setConvertingLead(lead);
    setConvertData({ assignedConsultantId: lead.assignedStaffId ?? '', visaCategory: '', notes: '' });
    setIsConvertModalOpen(true);
  };

  const handleConvertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLead) return;

    const input: ConvertLeadInput = {};
    if (convertData.assignedConsultantId) input.assignedConsultantId = convertData.assignedConsultantId;
    if (convertData.visaCategory) input.visaCategory = convertData.visaCategory;
    if (convertData.notes) input.notes = convertData.notes;

    convertLead.mutate(
      { id: convertingLead.id, input },
      {
        onSuccess: (result) => {
          if (viewingLead?.id === convertingLead.id) setViewingLead(result.lead);
          setIsConvertModalOpen(false);
          showSuccess(
            `Success! Lead ${result.lead.fullName} converted into Customer Profile ${result.customer.customerCode}!`,
          );
        },
        onError: showError,
      },
    );
  };

  const handleArchive = (lead: ApiLead) => {
    if (
      !window.confirm(
        `Archive lead "${lead.fullName}" (${lead.leadCode})? Archived leads are hidden from the active pipeline but not deleted.`,
      )
    ) {
      return;
    }
    archiveLead.mutate(lead.id, {
      onSuccess: (updated) => {
        if (viewingLead?.id === lead.id) setViewingLead(updated);
        showSuccess(`Lead ${updated.fullName} (${updated.leadCode}) has been archived.`);
      },
      onError: showError,
    });
  };

  const columns: Column<ApiLead>[] = [
    {
      key: 'leadCode',
      header: 'Lead Code',
      render: (l) => <span className="font-mono text-blue-600 dark:text-sky-400 font-bold">{l.leadCode}</span>,
    },
    {
      key: 'fullName',
      header: 'Name',
      render: (l) => <span className="font-bold text-slate-900 dark:text-slate-100">{l.fullName}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (l) =>
        l.email ? (
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-xs">
            <Mail className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[160px]">{l.email}</span>
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (l) => (
        <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-medium text-xs">
          <Phone className="w-3 h-3 shrink-0" />
          {l.phone}
        </span>
      ),
    },
    {
      key: 'country',
      header: 'Country',
      render: (l) => (
        <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs">
          {l.interestedCountry?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'visaType',
      header: 'Visa Type',
      render: (l) => <span className="text-slate-600 dark:text-slate-400 text-xs">{l.interestedVisaType || '—'}</span>,
    },
    {
      key: 'source',
      header: 'Lead Source',
      render: (l) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {LEAD_SOURCE.labels[l.source]}
        </span>
      ),
    },
    {
      key: 'assignedStaff',
      header: 'Assigned Staff',
      render: (l) => (
        <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">
          {l.assignedStaff?.fullName ?? 'Unassigned'}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} /> },
    {
      key: 'followUpDate',
      header: 'Follow-up Date',
      render: (l) =>
        l.nextFollowUpAt ? (
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{l.nextFollowUpAt.slice(0, 10)}</span>
          </span>
        ) : (
          <span className="text-xs text-slate-400">None</span>
        ),
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (l) => <span className="text-xs text-slate-500">{l.createdAt.slice(0, 10)}</span>,
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (l) =>
        l.notes ? (
          <span className="text-xs text-slate-500 truncate max-w-[160px] block" title={l.notes}>
            {l.notes}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Management Directory"
        subtitle="Track inquiry pipeline, schedule follow-ups, and convert leads into registered customer profiles."
        breadcrumbs={[{ label: 'Leads' }]}
        actions={
          <PermissionGuard permission="lead.create">
            <button
              onClick={() => handleOpenAddEditModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Lead</span>
            </button>
          </PermissionGuard>
        }
      />

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between shadow-md transition-all ${
            notification.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
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
          onChange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
          placeholder="Search by Lead Code (LD-1001), Name, Phone, Email..."
          className="w-full md:w-80"
        />

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ApiLeadStatus | '');
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Statuses ({LEAD_STATUS.values.length})</option>
              {LEAD_STATUS.values.map((st) => (
                <option key={st} value={st}>
                  {LEAD_STATUS.labels[st]}
                </option>
              ))}
            </select>
          </div>

          {/* Lead Source Filter */}
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-slate-400" />
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value as ApiLeadSource | '');
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Sources ({LEAD_SOURCE.values.length})</option>
              {LEAD_SOURCE.values.map((src) => (
                <option key={src} value={src}>
                  {LEAD_SOURCE.labels[src]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={leads}
        isLoading={isLoading}
        emptyText="No leads matching criteria."
        page={page}
        totalPages={pagination?.pages ?? 1}
        totalRecords={pagination?.total}
        onPageChange={setPage}
        onRowClick={(lead) => {
          setViewingLead(lead);
          setIsViewModalOpen(true);
        }}
        actions={(lead) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => {
                setViewingLead(lead);
                setIsViewModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-sky-500/30 hover:bg-blue-100 dark:hover:bg-sky-500/25 transition-all"
              title="View Lead Details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <PermissionGuard permission="lead.update">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAddEditModal(lead);
                }}
                className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/25 transition-all"
                title="Edit Lead"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            </PermissionGuard>

            <PermissionGuard permission="lead.update">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenFollowUp(lead);
                }}
                className="px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 text-xs font-semibold hover:bg-purple-100 dark:hover:bg-purple-500/25 flex items-center gap-1 transition-all"
                title="Add Follow-up"
              >
                <Clock className="w-3 h-3" />
                <span>Follow-up</span>
              </button>
            </PermissionGuard>

            {lead.status !== 'REGISTERED' && !lead.isArchived && (
              <PermissionGuard permission="lead.convert">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenConvert(lead);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/25 flex items-center gap-1 transition-all"
                  title="Convert to Registered Customer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </PermissionGuard>
            )}

            {!lead.isArchived && (
              <PermissionGuard permission="lead.archive">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchive(lead);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 transition-all"
                  title="Archive Lead"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </button>
              </PermissionGuard>
            )}
          </div>
        )}
      />

      {/* Add / Edit Lead Form Modal */}
      {isAddEditModalOpen && (
        <FormModal
          isOpen={isAddEditModalOpen}
          onClose={() => setIsAddEditModalOpen(false)}
          title={editingLead ? `Edit Lead — ${editingLead.fullName} (${editingLead.leadCode})` : 'Create New Inquiry Lead'}
          maxWidth="2xl"
        >
          <form onSubmit={handleAddEditSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Client Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  placeholder="e.g. Dilshan Mendis"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Phone / Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="+94 77 123 4567"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="client@gmail.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Target Country</label>
                {countryEnabled ? (
                  <select
                    value={formData.interestedCountryId}
                    onChange={(e) => setFormData({ ...formData, interestedCountryId: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">— None —</option>
                    {countryOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={editingLead?.interestedCountry?.name ?? 'No permission to view countries'}
                    className={disabledInputClass}
                  />
                )}
              </div>

              <div>
                <label className={labelClass}>Visa Type of Interest</label>
                <input
                  type="text"
                  value={formData.interestedVisaType}
                  onChange={(e) => setFormData({ ...formData, interestedVisaType: e.target.value })}
                  placeholder="Tourist / Student / Work"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Lead Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as ApiLeadSource })}
                  className={inputClass}
                >
                  {LEAD_SOURCE.values.map((ls) => (
                    <option key={ls} value={ls}>
                      {LEAD_SOURCE.labels[ls]}
                    </option>
                  ))}
                </select>
              </div>

              {editingLead && (
                <div>
                  <label className={labelClass}>Lead Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ApiLeadStatus })}
                    className={inputClass}
                  >
                    {LEAD_STATUS.values.map((st) => (
                      <option key={st} value={st}>
                        {LEAD_STATUS.labels[st]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className={labelClass}>Follow-up Date</label>
                <input
                  type="date"
                  value={formData.nextFollowUpAt}
                  onChange={(e) => setFormData({ ...formData, nextFollowUpAt: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Assigned Consultant</label>
                {staffEnabled ? (
                  <select
                    value={formData.assignedStaffId}
                    onChange={(e) => setFormData({ ...formData, assignedStaffId: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Unassigned</option>
                    {staffOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={editingLead?.assignedStaff?.fullName ?? 'No permission to view staff'}
                    className={disabledInputClass}
                  />
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>Notes & Inquirer Requirements</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Client travel dates, budget, or document status..."
                className={inputClass}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLead.isPending || updateLead.isPending}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {createLead.isPending || updateLead.isPending
                  ? 'Saving...'
                  : editingLead
                    ? 'Update Lead'
                    : 'Save New Lead'}
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {/* View Lead Details Modal */}
      {isViewModalOpen && viewingLead && (
        <FormModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Lead Details — ${viewingLead.fullName} (${viewingLead.leadCode})`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Header Banner */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-blue-600 dark:text-sky-400">
                    {viewingLead.leadCode}
                  </span>
                  <StatusBadge status={viewingLead.status} />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{viewingLead.fullName}</p>
                <p className="text-slate-500 mt-0.5">
                  {viewingLead.interestedCountry?.name ?? 'No country set'} — {viewingLead.interestedVisaType || 'No visa type set'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <PermissionGuard permission="lead.update">
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleOpenAddEditModal(viewingLead);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 font-semibold hover:bg-amber-100"
                  >
                    Edit Lead
                  </button>
                </PermissionGuard>
                {viewingLead.status !== 'REGISTERED' && !viewingLead.isArchived && (
                  <PermissionGuard permission="lead.convert">
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        handleOpenConvert(viewingLead);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold shadow-sm hover:bg-emerald-500"
                    >
                      + Convert to Customer
                    </button>
                  </PermissionGuard>
                )}
                {!viewingLead.isArchived && (
                  <PermissionGuard permission="lead.archive">
                    <button
                      onClick={() => handleArchive(viewingLead)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      Archive
                    </button>
                  </PermissionGuard>
                )}
              </div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1 uppercase text-[11px]">
                  Client & Contact
                </p>
                <div>
                  <span className="text-slate-500">Full Name:</span>{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingLead.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Phone Number:</span>{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingLead.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500">Email Address:</span>{' '}
                  <span className="text-slate-800 dark:text-slate-200">{viewingLead.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Lead Source:</span>{' '}
                  <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                    {LEAD_SOURCE.labels[viewingLead.source]}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1 uppercase text-[11px]">
                  Assignment & Follow-up
                </p>
                <div>
                  <span className="text-slate-500">Assigned Consultant:</span>{' '}
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {viewingLead.assignedStaff?.fullName ?? 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Target Country:</span>{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {viewingLead.interestedCountry?.name ?? 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Visa Type:</span>{' '}
                  <span className="text-slate-800 dark:text-slate-200">{viewingLead.interestedVisaType || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Follow-up Date:</span>{' '}
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {viewingLead.nextFollowUpAt ? viewingLead.nextFollowUpAt.slice(0, 10) : 'None Scheduled'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Created Date:</span>{' '}
                  <span className="text-slate-800 dark:text-slate-200">{viewingLead.createdAt.slice(0, 10)}</span>
                </div>
              </div>
            </div>

            {/* Notes & Follow-up History */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase text-[11px]">
                Notes & Requirements Log
              </p>
              <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {viewingLead.notes || 'No notes logged.'}
              </p>
            </div>
          </div>
        </FormModal>
      )}

      {/* Add Follow-up Modal */}
      {isFollowUpModalOpen && followUpLead && (
        <FormModal
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
          title={`Add Follow-up — ${followUpLead.fullName} (${followUpLead.leadCode})`}
          maxWidth="md"
        >
          <form onSubmit={handleFollowUpSubmit} className="space-y-4 text-xs">
            <div>
              <label className={labelClass}>Update Lead Status</label>
              <select
                value={followUpData.status}
                onChange={(e) => setFollowUpData({ ...followUpData, status: e.target.value as ApiLeadStatus })}
                className={inputClass}
              >
                {LEAD_STATUS.values.map((st) => (
                  <option key={st} value={st}>
                    {LEAD_STATUS.labels[st]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Next Follow-up Date</label>
              <input
                type="date"
                required
                value={followUpData.nextFollowUpAt}
                onChange={(e) => setFollowUpData({ ...followUpData, nextFollowUpAt: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Follow-up Remarks / Call Notes</label>
              <textarea
                rows={3}
                value={followUpData.notes}
                onChange={(e) => setFollowUpData({ ...followUpData, notes: e.target.value })}
                placeholder="Client requested callback on Monday / Interested in France Student Visa..."
                className={inputClass}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsFollowUpModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateLead.isPending}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {updateLead.isPending ? 'Saving...' : 'Save Follow-up Log'}
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {/* Convert to Customer Modal */}
      {isConvertModalOpen && convertingLead && (
        <FormModal
          isOpen={isConvertModalOpen}
          onClose={() => setIsConvertModalOpen(false)}
          title={`Convert to Customer — ${convertingLead.fullName} (${convertingLead.leadCode})`}
          subtitle="This creates a real Customer record and marks this lead as Registered. Name, phone, email, country and source carry over automatically — every field below is optional."
          maxWidth="md"
        >
          <form onSubmit={handleConvertSubmit} className="space-y-4 text-xs">
            <div>
              <label className={labelClass}>Assigned Consultant</label>
              {staffEnabled ? (
                <select
                  value={convertData.assignedConsultantId}
                  onChange={(e) => setConvertData({ ...convertData, assignedConsultantId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Unassigned</option>
                  {staffOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </select>
              ) : (
                <input type="text" disabled value="No permission to view staff" className={disabledInputClass} />
              )}
            </div>

            <div>
              <label className={labelClass}>Visa Category</label>
              <select
                value={convertData.visaCategory}
                onChange={(e) => setConvertData({ ...convertData, visaCategory: e.target.value as ApiVisaCategory | '' })}
                className={inputClass}
              >
                <option value="">— Not set —</option>
                {VISA_CATEGORY.values.map((vc) => (
                  <option key={vc} value={vc}>
                    {VISA_CATEGORY.labels[vc]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Customer Notes</label>
              <textarea
                rows={3}
                value={convertData.notes}
                onChange={(e) => setConvertData({ ...convertData, notes: e.target.value })}
                placeholder="Any notes to carry onto the new customer profile..."
                className={inputClass}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsConvertModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={convertLead.isPending}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {convertLead.isPending ? 'Converting...' : 'Confirm & Convert to Customer'}
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default LeadsPage;
