import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Phone, Mail, UserPlus, Calendar, Edit, Trash2, 
  Eye, CheckCircle2, AlertCircle, Clock, User, Globe, FileText, Layers, Share2
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { Lead, LeadStatus, LeadSource } from '../../types';
import { leadsApi, customersApi } from '../../api';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpLead, setFollowUpLead] = useState<Lead | null>(null);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Form State for Add / Edit Lead
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    country: 'France',
    visaType: 'Tourist Visa',
    source: 'Facebook' as LeadSource,
    assignedStaff: 'Saman Jayasinghe',
    status: 'New Lead' as LeadStatus,
    notes: '',
    followUpDate: ''
  });

  // Follow-up Form State
  const [followUpData, setFollowUpData] = useState({
    status: 'Contacted' as LeadStatus,
    followUpDate: '',
    notes: ''
  });

  const leadStatuses: LeadStatus[] = [
    'New Lead',
    'Contacted',
    'Interested',
    'Appointment',
    'Registered',
    'Not Interested',
    'Follow-up Later'
  ];

  const leadSources: LeadSource[] = [
    'Facebook',
    'TikTok',
    'Instagram',
    'Google',
    'Website',
    'WhatsApp',
    'Walk-in',
    'Referral',
    'Agent',
    'Other'
  ];

  const countries = [
    'France',
    'United Kingdom',
    'Canada',
    'Australia',
    'United Arab Emirates',
    'Italy',
    'Germany',
    'United States',
    'Japan',
    'Singapore',
    'New Zealand',
    'Schengen Area (Other)'
  ];

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await leadsApi.getAll({ 
        search: searchTerm, 
        status: statusFilter,
        source: sourceFilter
      });
      setLeads(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, statusFilter, sourceFilter]);

  const handleOpenAddEditModal = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        name: lead.name,
        phone: lead.phone,
        email: lead.email || '',
        country: lead.country,
        visaType: lead.visaType,
        source: lead.source,
        assignedStaff: lead.assignedStaff,
        status: lead.status,
        notes: lead.notes || '',
        followUpDate: lead.followUpDate || ''
      });
    } else {
      setEditingLead(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        country: 'France',
        visaType: 'Tourist Visa',
        source: 'Facebook',
        assignedStaff: 'Saman Jayasinghe',
        status: 'New Lead',
        notes: '',
        followUpDate: ''
      });
    }
    setIsAddEditModalOpen(true);
  };

  const handleAddEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    if (editingLead) {
      const updated = await leadsApi.update(editingLead.id, formData);
      if (viewingLead && viewingLead.id === editingLead.id) {
        setViewingLead(updated);
      }
      setNotification({
        message: `Successfully updated lead details for ${updated.name} (${updated.leadId})!`,
        type: 'success'
      });
    } else {
      const newLead = await leadsApi.create(formData);
      setNotification({
        message: `Successfully created new inquiry lead ${newLead.leadId} for ${newLead.name}!`,
        type: 'success'
      });
    }

    setIsAddEditModalOpen(false);
    fetchLeads();
    setTimeout(() => setNotification(null), 5000);
  };

  const handleOpenFollowUp = (lead: Lead) => {
    setFollowUpLead(lead);
    setFollowUpData({
      status: lead.status === 'New Lead' ? 'Contacted' : lead.status,
      followUpDate: lead.followUpDate || new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsFollowUpModalOpen(true);
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpLead) return;

    const existingNotes = followUpLead.notes ? `${followUpLead.notes}\n` : '';
    const newNotes = followUpData.notes 
      ? `${existingNotes}[Follow-up ${new Date().toISOString().split('T')[0]}]: ${followUpData.notes}`
      : followUpLead.notes;

    const updated = await leadsApi.update(followUpLead.id, {
      status: followUpData.status,
      followUpDate: followUpData.followUpDate,
      notes: newNotes
    });

    if (viewingLead && viewingLead.id === followUpLead.id) {
      setViewingLead(updated);
    }

    setIsFollowUpModalOpen(false);
    fetchLeads();
    setNotification({
      message: `Follow-up recorded for lead ${followUpLead.name} (${followUpLead.leadId})! Status updated to ${followUpData.status}.`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleConvertToCustomer = async (lead: Lead) => {
    if (confirm(`Convert lead "${lead.name}" (${lead.leadId}) to Customer Registration?`)) {
      const res = await customersApi.create({
        name: lead.name,
        phone: lead.phone,
        email: lead.email || `${lead.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        passportNumber: `N${Math.floor(1000000 + Math.random() * 9000000)}`,
        assignedConsultant: lead.assignedStaff,
        leadSource: lead.source,
        applyingCountry: lead.country,
        notes: `Converted from lead ${lead.leadId}. ${lead.notes || ''}`
      });

      await leadsApi.update(lead.id, { status: 'Registered' });
      fetchLeads();

      if (viewingLead && viewingLead.id === lead.id) {
        setViewingLead(prev => prev ? { ...prev, status: 'Registered' } : null);
      }

      setNotification({
        message: `Success! Lead ${lead.name} converted into Customer Profile ${res.customer.customerId}!`,
        type: 'success'
      });
      setTimeout(() => setNotification(null), 6000);
    }
  };

  // 11 Required Columns
  const columns: Column<Lead>[] = [
    { 
      key: 'leadId', 
      header: 'Lead ID', 
      render: (l) => <span className="font-mono text-blue-600 dark:text-sky-400 font-bold">{l.leadId}</span> 
    },
    { 
      key: 'name', 
      header: 'Name', 
      render: (l) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{l.name}</div>
          {l.email && <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{l.email}</div>}
        </div>
      )
    },
    { 
      key: 'phone', 
      header: 'Phone', 
      render: (l) => <span className="text-slate-800 dark:text-slate-200 font-medium text-xs">{l.phone}</span> 
    },
    { 
      key: 'country', 
      header: 'Country', 
      render: (l) => <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs">{l.country}</span> 
    },
    { 
      key: 'visaType', 
      header: 'Visa Type', 
      render: (l) => <span className="text-slate-600 dark:text-slate-400 text-xs">{l.visaType}</span> 
    },
    { 
      key: 'source', 
      header: 'Lead Source', 
      render: (l) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {l.source}
        </span>
      )
    },
    { 
      key: 'assignedStaff', 
      header: 'Assigned Staff', 
      render: (l) => <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">{l.assignedStaff}</span> 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (l) => <StatusBadge status={l.status} /> 
    },
    { 
      key: 'followUpDate', 
      header: 'Follow-up Date', 
      render: (l) => (
        l.followUpDate ? (
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{l.followUpDate}</span>
          </span>
        ) : (
          <span className="text-xs text-slate-400">None</span>
        )
      ) 
    },
    { 
      key: 'createdAt', 
      header: 'Created Date', 
      render: (l) => <span className="text-xs text-slate-500">{l.createdAt}</span> 
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Management Directory"
        subtitle="Track inquiry pipeline, schedule follow-ups, and convert leads into registered customer profiles."
        breadcrumbs={[{ label: 'Leads' }]}
        actions={
          <button
            onClick={() => handleOpenAddEditModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Lead</span>
          </button>
        }
      />

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between shadow-md transition-all ${
          notification.type === 'info'
            ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200'
            : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
        }`}>
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
          placeholder="Search by Lead ID (LD-1001), Name, Phone, Country..." 
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
              <option value="">All Statuses ({leadStatuses.length})</option>
              {leadStatuses.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Lead Source Filter */}
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-slate-400" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Sources ({leadSources.length})</option>
              {leadSources.map(src => (
                <option key={src} value={src}>{src}</option>
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

            <PermissionGuard permission="lead.edit">
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

            {lead.status !== 'Registered' && (
              <PermissionGuard permission="lead.convert">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConvertToCustomer(lead);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/25 flex items-center gap-1 transition-all"
                  title="Convert to Registered Customer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
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
          title={editingLead ? `Edit Lead — ${editingLead.name} (${editingLead.leadId})` : 'Create New Inquiry Lead'}
          maxWidth="2xl"
        >
          <form onSubmit={handleAddEditSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Client Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Dilshan Mendis"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone / Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="+94 77 123 4567"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="client@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Visa Type</label>
                <input
                  type="text"
                  value={formData.visaType}
                  onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                  placeholder="Tourist / Student / Work"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lead Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  {leadSources.map(ls => (
                    <option key={ls} value={ls}>{ls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lead Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  {leadStatuses.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Consultant</label>
                <select
                  value={formData.assignedStaff}
                  onChange={(e) => setFormData({ ...formData, assignedStaff: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Saman Jayasinghe">Saman Jayasinghe (Senior Consultant)</option>
                  <option value="Nimali Fernando">Nimali Fernando (Visa Specialist)</option>
                  <option value="Thenushan Sritharan">Thenushan Sritharan (Manager)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes & Inquirer Requirements</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Client travel dates, budget, or document status..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20"
              >
                {editingLead ? 'Update Lead' : 'Save New Lead'}
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
          title={`Lead Details — ${viewingLead.name} (${viewingLead.leadId})`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Header Banner */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-blue-600 dark:text-sky-400">{viewingLead.leadId}</span>
                  <StatusBadge status={viewingLead.status} />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{viewingLead.name}</p>
                <p className="text-slate-500 mt-0.5">{viewingLead.country} — {viewingLead.visaType}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenAddEditModal(viewingLead);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 font-semibold hover:bg-amber-100"
                >
                  Edit Lead
                </button>
                {viewingLead.status !== 'Registered' && (
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleConvertToCustomer(viewingLead);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold shadow-sm hover:bg-emerald-500"
                  >
                    + Convert to Customer
                  </button>
                )}
              </div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1 uppercase text-[11px]">Client & Contact</p>
                <div><span className="text-slate-500">Full Name:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingLead.name}</span></div>
                <div><span className="text-slate-500">Phone Number:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingLead.phone}</span></div>
                <div><span className="text-slate-500">Email Address:</span> <span className="text-slate-800 dark:text-slate-200">{viewingLead.email || 'N/A'}</span></div>
                <div><span className="text-slate-500">Lead Source:</span> <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">{viewingLead.source}</span></div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1 uppercase text-[11px]">Assignment & Follow-up</p>
                <div><span className="text-slate-500">Assigned Consultant:</span> <span className="font-semibold text-purple-600 dark:text-purple-400">{viewingLead.assignedStaff}</span></div>
                <div><span className="text-slate-500">Target Country:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{viewingLead.country}</span></div>
                <div><span className="text-slate-500">Visa Type:</span> <span className="text-slate-800 dark:text-slate-200">{viewingLead.visaType}</span></div>
                <div><span className="text-slate-500">Follow-up Date:</span> <span className="font-bold text-amber-600 dark:text-amber-400">{viewingLead.followUpDate || 'None Scheduled'}</span></div>
                <div><span className="text-slate-500">Created Date:</span> <span className="text-slate-800 dark:text-slate-200">{viewingLead.createdAt}</span></div>
              </div>
            </div>

            {/* Notes & Follow-up History */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase text-[11px]">Notes & Requirements Log</p>
              <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{viewingLead.notes || 'No notes logged.'}</p>
            </div>
          </div>
        </FormModal>
      )}

      {/* Add Follow-up Modal */}
      {isFollowUpModalOpen && followUpLead && (
        <FormModal
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
          title={`Add Follow-up — ${followUpLead.name} (${followUpLead.leadId})`}
          maxWidth="md"
        >
          <form onSubmit={handleFollowUpSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Update Lead Status</label>
              <select
                value={followUpData.status}
                onChange={(e) => setFollowUpData({ ...followUpData, status: e.target.value as LeadStatus })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {leadStatuses.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Next Follow-up Date</label>
              <input
                type="date"
                required
                value={followUpData.followUpDate}
                onChange={(e) => setFollowUpData({ ...followUpData, followUpDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Follow-up Remarks / Call Notes</label>
              <textarea
                rows={3}
                value={followUpData.notes}
                onChange={(e) => setFollowUpData({ ...followUpData, notes: e.target.value })}
                placeholder="Client requested callback on Monday / Interested in France Student Visa..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
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
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/20"
              >
                Save Follow-up Log
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default LeadsPage;
