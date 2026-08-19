import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, User, Phone, CreditCard, Briefcase, Globe, CheckCircle2, AlertCircle,
  Edit3, Archive, RotateCcw, ExternalLink, FileText
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import CustomerRegistrationModal from '../../components/modals/CustomerRegistrationModal';
import ApplyNewCountryModal from '../../components/modals/ApplyNewCountryModal';
import EditCustomerModal from '../../components/modals/EditCustomerModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import { Customer as LegacyCustomer, VisaCase } from '../../types';
import { ApiCustomer } from '../../types/api';
import { LEAD_SOURCE, MARITAL_STATUS, GENDER, VISA_CATEGORY } from '../../utils/enumLabels';
import { normalizeApiError } from '../../api/errors';
import { useCustomers, useArchiveCustomer, useRestoreCustomer } from './hooks/useCustomersQueries';

const PAGE_SIZE = 10;

/**
 * Adapts a real `ApiCustomer` to the legacy mock `Customer` shape that `ApplyNewCountryModal`
 * (Phase 3 scope — intentionally left untouched, see INTEGRATION_PLAN.md) still expects as its
 * `customer` prop. Only the fields that modal actually reads are populated with real data;
 * `activeCasesCount` has no backend equivalent yet so it's a harmless local-only placeholder that
 * modal mutates but nothing downstream ever reads.
 */
function toLegacyCustomer(c: ApiCustomer): LegacyCustomer {
  return {
    id: c.id,
    customerId: c.customerCode,
    name: c.fullName,
    passportNumber: c.passportNumber || '',
    nic: c.nic || undefined,
    phone: c.mobile,
    whatsApp: c.whatsapp || c.mobile,
    email: c.email || '',
    occupation: c.occupation || undefined,
    monthlyIncome: c.monthlyIncome ?? undefined,
    bankBalance: c.bankBalance ?? undefined,
    applyingCountry: c.applyingCountry?.name,
    travelPurpose: c.travelPurpose || undefined,
    assignedConsultant: c.assignedConsultant?.fullName || '',
    assignedConsultantId: c.assignedConsultantId || undefined,
    notes: c.notes || undefined,
    activeCasesCount: 0,
    status: c.isArchived ? 'Archived' : 'Active',
    createdAt: c.createdAt,
  };
}

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<ApiCustomer | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'financial'>('overview');

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isNewCountryModalOpen, setIsNewCountryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<ApiCustomer | null>(null);

  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [customerToArchive, setCustomerToArchive] = useState<ApiCustomer | null>(null);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const notify = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 6000);
  };

  const { data, isLoading } = useCustomers({ search: searchTerm || undefined, page, limit: PAGE_SIZE });
  const customers = data?.data ?? [];
  const pagination = data?.pagination;

  const archiveCustomer = useArchiveCustomer();
  const restoreCustomer = useRestoreCustomer();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleRegistrationSuccess = (customer: ApiCustomer) => {
    notify(`Successfully registered new customer ${customer.customerCode} (${customer.fullName})!`, 'success');
  };

  const handleNewCountrySuccess = (newCase: VisaCase) => {
    notify(
      `Created new Visa Case ${newCase.caseId} for ${newCase.country} (${newCase.visaCategory}) — note: Visa Cases aren't wired to the backend yet (Phase 3), so this record is local-only for now.`,
      'info'
    );
  };

  const handleEditSuccess = (updatedCustomer: ApiCustomer) => {
    if (selectedCustomer && selectedCustomer.id === updatedCustomer.id) {
      setSelectedCustomer(updatedCustomer);
    }
    notify(`Successfully updated customer details for ${updatedCustomer.fullName} (${updatedCustomer.customerCode})!`, 'success');
  };

  const confirmArchiveCustomer = async (c: ApiCustomer) => {
    try {
      await archiveCustomer.mutateAsync(c.id);
      if (selectedCustomer?.id === c.id) {
        setSelectedCustomer(null);
      }
      setIsArchiveConfirmOpen(false);
      setCustomerToArchive(null);
      notify(`Archived customer ${c.fullName} (${c.customerCode}).`, 'info');
    } catch (err) {
      const { message } = normalizeApiError(err);
      notify(`Failed to archive customer: ${message}`, 'error');
    }
  };

  const handleRestore = async (c: ApiCustomer) => {
    try {
      const restored = await restoreCustomer.mutateAsync(c.id);
      if (selectedCustomer?.id === c.id) {
        setSelectedCustomer(restored);
      }
      notify(`Restored customer ${restored.fullName} (${restored.customerCode}).`, 'success');
    } catch (err) {
      const { message } = normalizeApiError(err);
      notify(`Failed to restore customer: ${message}`, 'error');
    }
  };

  const columns: Column<ApiCustomer>[] = [
    {
      key: 'customerCode',
      header: 'Customer Code',
      render: (c) => <span className="font-mono text-blue-600 dark:text-sky-400 font-bold">{c.customerCode}</span>
    },
    {
      key: 'fullName',
      header: 'Customer Name',
      render: (c) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{c.fullName}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">Passport: {c.passportNumber || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'mobile',
      header: 'Contact Info',
      render: (c) => (
        <div className="text-xs">
          <div className="text-slate-800 dark:text-slate-200">{c.mobile}</div>
          {c.whatsapp && <div className="text-emerald-600 dark:text-emerald-400 font-medium">WA: {c.whatsapp}</div>}
        </div>
      )
    },
    {
      key: 'leadSource',
      header: 'Lead Source',
      render: (c) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {c.leadSource ? LEAD_SOURCE.labels[c.leadSource] : 'N/A'}
        </span>
      )
    },
    {
      key: 'assignedConsultant',
      header: 'Consultant',
      render: (c) => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{c.assignedConsultant?.fullName || 'Unassigned'}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <StatusBadge status={c.isArchived ? 'ARCHIVED' : 'ACTIVE'} />
    },
    {
      key: 'createdAt',
      header: 'Registered',
      render: (c) => <span className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Directory & 360 Profiles"
        subtitle="Customer Registration — Manage client records, ARS-2026-XXXXX IDs, and multi-country visa applications."
        breadcrumbs={[{ label: 'Customers' }]}
        actions={
          <PermissionGuard permission="customer.create">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Customer Registration</span>
            </button>
          </PermissionGuard>
        }
      />

      {/* Success / Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between shadow-md transition-all ${
          notification.type === 'info'
            ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200'
            : notification.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
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

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by Customer Code (ARS-2026-00001), Name, Passport, NIC, Phone..."
          className="w-full sm:max-w-md"
        />
        <div className="text-xs text-slate-500 font-semibold">
          Total Registered Customers: <span className="text-blue-600 dark:text-sky-400 font-mono font-bold">{pagination?.total ?? customers.length}</span>
        </div>
      </div>

      {/* Customer Directory Table */}
      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        page={pagination?.page ?? page}
        totalPages={pagination?.pages ?? 1}
        totalRecords={pagination?.total}
        onPageChange={setPage}
        onRowClick={(c) => setSelectedCustomer(c)}
        actions={(c) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setSelectedCustomer(c)}
              className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-sky-500/30 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-sky-500/25 transition-all"
            >
              View 360 Profile
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/portal');
              }}
              className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 text-xs font-semibold hover:bg-purple-100 transition-all flex items-center gap-1"
              title="Preview Customer Portal View"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </button>

            <PermissionGuard permission="customer.update">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomerToEdit(c);
                  setIsEditModalOpen(true);
                }}
                className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/25 transition-all"
                title="Edit Customer Details"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </PermissionGuard>

            <PermissionGuard permission="customer.archive">
              {c.isArchived ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestore(c);
                  }}
                  className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 transition-all"
                  title="Restore Customer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomerToArchive(c);
                    setIsArchiveConfirmOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-100 dark:hover:bg-rose-500/25 transition-all"
                  title="Archive Customer"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              )}
            </PermissionGuard>
          </div>
        )}
      />

      {/* Customer Registration Modal */}
      {isRegisterModalOpen && (
        <CustomerRegistrationModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && customerToEdit && (
        <EditCustomerModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setCustomerToEdit(null);
          }}
          customer={customerToEdit}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Archive Confirmation Modal */}
      {isArchiveConfirmOpen && customerToArchive && (
        <FormModal
          isOpen={isArchiveConfirmOpen}
          onClose={() => {
            setIsArchiveConfirmOpen(false);
            setCustomerToArchive(null);
          }}
          title={`Confirm Customer Archive — ${customerToArchive.customerCode}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Are you sure you want to archive this customer?</p>
                <p className="mt-1 text-rose-700 dark:text-rose-300">
                  <strong>{customerToArchive.fullName} ({customerToArchive.customerCode})</strong> will be marked archived and hidden from active workflows. This can be undone later via Restore.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsArchiveConfirmOpen(false);
                  setCustomerToArchive(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmArchiveCustomer(customerToArchive)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/20"
              >
                <Archive className="w-4 h-4" />
                <span>Archive Customer</span>
              </button>
            </div>
          </div>
        </FormModal>
      )}

      {/* Customer 360 Modal */}
      {selectedCustomer && (
        <FormModal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Customer 360 Profile — ${selectedCustomer.fullName} (${selectedCustomer.customerCode})`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            {/* Header Banner & Actions */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-black text-blue-600 dark:text-sky-400">{selectedCustomer.customerCode}</span>
                  <StatusBadge status={selectedCustomer.isArchived ? 'ARCHIVED' : 'ACTIVE'} />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedCustomer.fullName}</p>
                <p className="text-xs text-slate-500">
                  Passport: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{selectedCustomer.passportNumber || 'N/A'}</span> | NIC: <span className="font-mono">{selectedCustomer.nic || 'N/A'}</span>
                </p>
              </div>

              {/* Action Buttons: Edit, Archive/Restore, Apply New Country */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <PermissionGuard permission="customer.update">
                  <button
                    onClick={() => {
                      setCustomerToEdit(selectedCustomer);
                      setIsEditModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </PermissionGuard>

                <PermissionGuard permission="customer.archive">
                  {selectedCustomer.isArchived ? (
                    <button
                      onClick={() => handleRestore(selectedCustomer)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setCustomerToArchive(selectedCustomer);
                        setIsArchiveConfirmOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </button>
                  )}
                </PermissionGuard>

                <button
                  onClick={() => setIsNewCountryModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all shrink-0"
                >
                  <Globe className="w-4 h-4" />
                  <span>+ Apply to Another Country</span>
                </button>
              </div>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2.5 border-b-2 transition-colors ${
                  activeTab === 'overview' ? 'border-blue-600 text-blue-600 dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                1. Full Personal & Financial Profile
              </button>
              <button
                onClick={() => setActiveTab('cases')}
                className={`pb-2.5 border-b-2 transition-colors ${
                  activeTab === 'cases' ? 'border-blue-600 text-blue-600 dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                2. Linked Visa Cases
              </button>
              <button
                onClick={() => setActiveTab('financial')}
                className={`pb-2.5 border-b-2 transition-colors ${
                  activeTab === 'financial' ? 'border-blue-600 text-blue-600 dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                3. Financial & Invoices
              </button>
            </div>

            {/* Tab 1: Full Customer Registration Profile Fields */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Personal Block */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1.5 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                      <span>1. Personal Details</span>
                    </p>
                    <div><span className="text-slate-500">Full Name:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.fullName}</span></div>
                    <div><span className="text-slate-500">Passport Number:</span> <span className="font-mono text-blue-600 dark:text-sky-400 font-bold">{selectedCustomer.passportNumber || 'N/A'}</span></div>
                    <div><span className="text-slate-500">NIC Number:</span> <span className="text-slate-800 dark:text-slate-200 font-mono">{selectedCustomer.nic || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Date of Birth:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.dob || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Gender:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.gender ? GENDER.labels[selectedCustomer.gender] : 'N/A'}</span></div>
                    <div><span className="text-slate-500">Nationality:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.nationality || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Marital Status:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.maritalStatus ? MARITAL_STATUS.labels[selectedCustomer.maritalStatus] : 'N/A'}</span></div>
                    <div><span className="text-slate-500">Residential Address:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.address || 'N/A'}</span></div>
                  </div>

                  {/* Contact & Consultation Block */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1.5 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>2. Contact & Lead Info</span>
                    </p>
                    <div><span className="text-slate-500">Mobile Phone:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.mobile}</span></div>
                    <div><span className="text-slate-500">WhatsApp Number:</span> <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedCustomer.whatsapp || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Email Address:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.email || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Lead Source:</span> <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">{selectedCustomer.leadSource ? LEAD_SOURCE.labels[selectedCustomer.leadSource] : 'N/A'}</span></div>
                    <div><span className="text-slate-500">Assigned Consultant:</span> <span className="text-purple-600 dark:text-purple-400 font-semibold">{selectedCustomer.assignedConsultant?.fullName || 'Unassigned'}</span></div>
                    <div><span className="text-slate-500">Branch:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.branch?.name || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Registration Date:</span> <span className="text-slate-800 dark:text-slate-200">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span></div>
                  </div>

                  {/* Financial & Travel Background Block */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1.5 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>3. Financial & Visa Profile</span>
                    </p>
                    <div><span className="text-slate-500">Occupation / Business:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.occupation || 'N/A'}</span></div>
                    <div>
                      <span className="text-slate-500">Monthly Income:</span>{' '}
                      {selectedCustomer.monthlyIncome != null ? (
                        <CurrencyDisplay amount={selectedCustomer.monthlyIncome} className="font-bold text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500">Bank Balance:</span>{' '}
                      {selectedCustomer.bankBalance != null ? (
                        <CurrencyDisplay amount={selectedCustomer.bankBalance} className="font-bold text-blue-600 dark:text-sky-400" />
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </div>
                    <div><span className="text-slate-500">Applying Country:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCustomer.applyingCountry?.name || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Visa Category:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.visaCategory ? VISA_CATEGORY.labels[selectedCustomer.visaCategory] : 'N/A'}</span></div>
                    <div><span className="text-slate-500">Travel Purpose:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.travelPurpose || 'N/A'}</span></div>
                  </div>
                </div>

                {/* History & Refusals & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                      <span>Previous Visa History</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      {selectedCustomer.hasPreviousVisaHistory
                        ? selectedCustomer.previousVisaHistoryNotes || 'Marked as having previous visa history (no notes recorded).'
                        : 'No prior visa history recorded.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="font-bold text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Previous Refusals</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      {selectedCustomer.hasPreviousRefusals
                        ? selectedCustomer.previousRefusalNotes || 'Marked as having previous refusals (no notes recorded).'
                        : 'None'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Additional Notes</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">{selectedCustomer.notes || 'No notes recorded.'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Linked Visa Cases — honest placeholder until the Visa Cases module lands
                (Phase 3); the "+ Add" action is preserved since it opens ApplyNewCountryModal
                unchanged, but no fabricated case list is shown here. */}
            {activeTab === 'cases' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Visa cases linked to customer profile {selectedCustomer.customerCode}:</p>
                  <button
                    onClick={() => setIsNewCountryModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs shadow-sm hover:bg-purple-500"
                  >
                    + Add New Country Application
                  </button>
                </div>

                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                  <Briefcase className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  Visa case details will appear here once the Visa Cases module is integrated (Phase 3).
                </div>
              </div>
            )}

            {/* Tab 3: Financial & Invoices — honest placeholder until Invoicing lands (Phase 5). */}
            {activeTab === 'financial' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-500">Financial ledger for {selectedCustomer.fullName}:</p>
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
                  <CreditCard className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  Invoice and payment details will appear here once Invoicing is integrated (Phase 5).
                </div>
              </div>
            )}
          </div>
        </FormModal>
      )}

      {/* Modal: Apply to Another Country (Phase 3 scope — untouched, see toLegacyCustomer above) */}
      {selectedCustomer && isNewCountryModalOpen && (
        <ApplyNewCountryModal
          isOpen={isNewCountryModalOpen}
          onClose={() => setIsNewCountryModalOpen(false)}
          customer={toLegacyCustomer(selectedCustomer)}
          onSuccess={handleNewCountrySuccess}
        />
      )}
    </div>
  );
};

export default CustomersPage;
