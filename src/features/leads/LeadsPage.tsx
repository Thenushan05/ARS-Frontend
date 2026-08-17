import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Phone, Mail, UserPlus, Calendar, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import { Lead, LeadStatus, LeadSource } from '../../types';
import { leadsApi, customersApi } from '../../api';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Form State
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

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await leadsApi.getAll({ search: searchTerm, status: statusFilter });
      setLeads(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, statusFilter]);

  const handleOpenModal = (lead?: Lead) => {
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
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLead) {
      await leadsApi.update(editingLead.id, formData);
    } else {
      await leadsApi.create(formData);
    }
    setIsModalOpen(false);
    fetchLeads();
  };

  const handleConvertToCustomer = async (lead: Lead) => {
    if (confirm(`Convert lead "${lead.name}" to Customer Registration?`)) {
      await customersApi.create({
        name: lead.name,
        phone: lead.phone,
        email: lead.email || `${lead.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        passportNumber: `N${Math.floor(1000000 + Math.random() * 9000000)}`,
        assignedConsultant: lead.assignedStaff
      });
      await leadsApi.update(lead.id, { status: 'Registered' });
      alert(`Success! Lead converted to Customer Registration.`);
      fetchLeads();
    }
  };

  const columns: Column<Lead>[] = [
    { key: 'leadId', header: 'Lead ID', render: (l) => <span className="font-mono text-sky-400 font-semibold">{l.leadId}</span> },
    { key: 'name', header: 'Client Name', render: (l) => (
      <div>
        <div className="font-bold text-slate-100">{l.name}</div>
        <div className="text-xs text-slate-400">{l.phone}</div>
      </div>
    )},
    { key: 'country', header: 'Destination', render: (l) => (
      <div>
        <div className="text-slate-200 font-medium">{l.country}</div>
        <div className="text-xs text-slate-500">{l.visaType}</div>
      </div>
    )},
    { key: 'source', header: 'Source', render: (l) => <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">{l.source}</span> },
    { key: 'assignedStaff', header: 'Consultant', render: (l) => <span className="text-slate-300">{l.assignedStaff}</span> },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} /> },
    { key: 'followUpDate', header: 'Follow-up', render: (l) => <span className="text-xs text-amber-400">{l.followUpDate || 'None'}</span> },
    { key: 'createdAt', header: 'Created', render: (l) => <span className="text-xs text-slate-500">{l.createdAt}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Management"
        subtitle="Track inquiries, convert leads to registered customers, and manage follow-ups."
        breadcrumbs={[{ label: 'Leads' }]}
        actions={
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Lead</span>
          </button>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search by name, phone, or country..." className="w-full sm:w-80" />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Statuses</option>
            <option value="New Lead">New Lead</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Appointment">Appointment</option>
            <option value="Registered">Registered</option>
            <option value="Follow-up Later">Follow-up Later</option>
          </select>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={leads}
        isLoading={isLoading}
        emptyText="No leads matching query."
        actions={(lead) => (
          <div className="flex items-center gap-2 justify-end">
            {lead.status !== 'Registered' && (
              <button
                onClick={() => handleConvertToCustomer(lead)}
                title="Convert to Registered Customer"
                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/25 flex items-center gap-1 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            )}
            <button
              onClick={() => handleOpenModal(lead)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Add / Edit Lead Form Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLead ? 'Edit Lead Details' : 'Create New Inquiry Lead'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Client Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Phone Number *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Target Country</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
              >
                <option value="France">France</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Visa Type</label>
              <input
                type="text"
                value={formData.visaType}
                onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Lead Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
              >
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
                <option value="Instagram">Instagram</option>
                <option value="Google">Google</option>
                <option value="Website">Website</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Agent">Agent</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Lead Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
              >
                <option value="New Lead">New Lead</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Appointment">Appointment</option>
                <option value="Registered">Registered</option>
                <option value="Follow-up Later">Follow-up Later</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Follow-up Date</label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300">Notes / Customer Requirements</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/20"
            >
              {editingLead ? 'Update Lead' : 'Save Lead'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default LeadsPage;
