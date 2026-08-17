import React, { useState, useEffect } from 'react';
import { Plus, User, Phone, Mail, FileText, CreditCard, Calendar, Briefcase, Activity, Shield, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import CustomerRegistrationModal from '../../components/modals/CustomerRegistrationModal';
import ApplyNewCountryModal from '../../components/modals/ApplyNewCountryModal';
import { Customer, VisaCase } from '../../types';
import { customersApi, visaCasesApi } from '../../api';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'financial' | 'history'>('overview');
  
  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isNewCountryModalOpen, setIsNewCountryModalOpen] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await customersApi.getAll({ search: searchTerm });
      setCustomers(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const handleRegistrationSuccess = (result: { customer: Customer; isExisting: boolean; newCaseId?: string }) => {
    fetchCustomers();
    if (result.isExisting) {
      setNotification({
        message: `Existing customer ${result.customer.customerId} (${result.customer.name}) identified! Created New Visa Case ${result.newCaseId || ''} under existing customer without creating a duplicate record.`,
        type: 'info'
      });
    } else {
      setNotification({
        message: `Successfully registered new customer ${result.customer.customerId} (${result.customer.name}) and created initial Visa Case ${result.newCaseId || ''}!`,
        type: 'success'
      });
    }

    setTimeout(() => {
      setNotification(null);
    }, 7000);
  };

  const handleNewCountrySuccess = (newCase: VisaCase) => {
    fetchCustomers();
    setNotification({
      message: `Created new Visa Case ${newCase.caseId} for ${newCase.country} (${newCase.visaCategory}) under existing customer ${selectedCustomer?.customerId}!`,
      type: 'success'
    });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  const columns: Column<Customer>[] = [
    { 
      key: 'customerId', 
      header: 'Customer ID', 
      render: (c) => <span className="font-mono text-blue-600 dark:text-sky-400 font-bold">{c.customerId}</span> 
    },
    { 
      key: 'name', 
      header: 'Customer Name', 
      render: (c) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{c.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">Passport: {c.passportNumber}</div>
        </div>
      )
    },
    { 
      key: 'phone', 
      header: 'Contact Info', 
      render: (c) => (
        <div className="text-xs">
          <div className="text-slate-800 dark:text-slate-200">{c.phone}</div>
          <div className="text-emerald-600 dark:text-emerald-400 font-medium">WA: {c.whatsApp}</div>
        </div>
      )
    },
    {
      key: 'leadSource',
      header: 'Lead Source',
      render: (c) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {c.leadSource || 'Walk-in'}
        </span>
      )
    },
    { 
      key: 'assignedConsultant', 
      header: 'Consultant', 
      render: (c) => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{c.assignedConsultant}</span> 
    },
    { 
      key: 'activeCasesCount', 
      header: 'Active Visa Cases', 
      render: (c) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
          {c.activeCasesCount} Cases
        </span>
      )
    },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    { key: 'createdAt', header: 'Registered', render: (c) => <span className="text-xs text-slate-500">{c.createdAt}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Directory & 360 Profiles"
        subtitle="Customer Registration (9. CUSTOMER REGISTRATION) — Manage client records, ARS-2026-XXXXX IDs, and multi-country visa applications."
        breadcrumbs={[{ label: 'Customers' }]}
        actions={
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Customer Registration</span>
          </button>
        }
      />

      {/* Success / Notification Banner */}
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

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchInput 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Search by Customer ID (ARS-2026-00001), Name, Passport, NIC, Phone..." 
          className="w-full sm:max-w-md" 
        />
        <div className="text-xs text-slate-500 font-semibold">
          Total Registered Customers: <span className="text-blue-600 dark:text-sky-400 font-mono font-bold">{customers.length}</span>
        </div>
      </div>

      {/* Customer Directory Table */}
      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        onRowClick={(c) => setSelectedCustomer(c)}
        actions={(c) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setSelectedCustomer(c)}
              className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-sky-500/30 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-sky-500/25 transition-all"
            >
              View 360 Profile
            </button>
          </div>
        )}
      />

      {/* Customer Registration Modal */}
      {isRegisterModalOpen && (
        <CustomerRegistrationModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSuccess={handleRegistrationSuccess}
          existingCustomersCount={customers.length}
        />
      )}

      {/* Customer 360 Modal */}
      {selectedCustomer && (
        <FormModal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Customer 360 Profile — ${selectedCustomer.name} (${selectedCustomer.customerId})`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            {/* Header Banner & Multi-Country Action */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-black text-blue-600 dark:text-sky-400">{selectedCustomer.customerId}</span>
                  <StatusBadge status={selectedCustomer.status} />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedCustomer.name}</p>
                <p className="text-xs text-slate-500">Passport: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{selectedCustomer.passportNumber}</span> | NIC: <span className="font-mono">{selectedCustomer.nic || 'N/A'}</span></p>
              </div>

              <button
                onClick={() => setIsNewCountryModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all shrink-0"
              >
                <Globe className="w-4 h-4" />
                <span>+ Apply to Another Country</span>
              </button>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2.5 border-b-2 transition-colors ${
                  activeTab === 'overview' ? 'border-blue-600 text-blue-600 dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                1. Full Personal & Financial Profile (22 Fields)
              </button>
              <button
                onClick={() => setActiveTab('cases')}
                className={`pb-2.5 border-b-2 transition-colors ${
                  activeTab === 'cases' ? 'border-blue-600 text-blue-600 dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                2. Linked Visa Cases ({selectedCustomer.activeCasesCount})
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

            {/* Tab 1: Full 22-Field Customer Profile */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Personal Block */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1.5 uppercase text-[11px] tracking-wider">
                      Personal Details
                    </p>
                    <div><span className="text-slate-500">Full Name:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.name}</span></div>
                    <div><span className="text-slate-500">Passport Number:</span> <span className="font-mono text-blue-600 dark:text-sky-400 font-semibold">{selectedCustomer.passportNumber}</span></div>
                    <div><span className="text-slate-500">NIC:</span> <span className="text-slate-800 dark:text-slate-200 font-mono">{selectedCustomer.nic || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Date of Birth:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.dateOfBirth || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Gender:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.gender || 'Male'}</span></div>
                    <div><span className="text-slate-500">Nationality:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.nationality || 'Sri Lankan'}</span></div>
                    <div><span className="text-slate-500">Marital Status:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.maritalStatus || 'Single'}</span></div>
                    <div><span className="text-slate-500">Address:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.address || 'N/A'}</span></div>
                  </div>

                  {/* Contact & Consultation Block */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1.5 uppercase text-[11px] tracking-wider">
                      Contact & Lead Info
                    </p>
                    <div><span className="text-slate-500">Mobile Phone:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.phone}</span></div>
                    <div><span className="text-slate-500">WhatsApp:</span> <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedCustomer.whatsApp}</span></div>
                    <div><span className="text-slate-500">Email:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.email || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Lead Source:</span> <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">{selectedCustomer.leadSource || 'Walk-in'}</span></div>
                    <div><span className="text-slate-500">Assigned Consultant:</span> <span className="text-purple-600 dark:text-purple-400 font-semibold">{selectedCustomer.assignedConsultant}</span></div>
                    <div><span className="text-slate-500">Registration Date:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.createdAt}</span></div>
                  </div>

                  {/* Financial & Travel Background Block */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1.5 uppercase text-[11px] tracking-wider">
                      Financial & Travel History
                    </p>
                    <div><span className="text-slate-500">Occupation:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.occupation || 'N/A'}</span></div>
                    <div>
                      <span className="text-slate-500">Monthly Income:</span>{' '}
                      {selectedCustomer.monthlyIncome ? (
                        <CurrencyDisplay amount={selectedCustomer.monthlyIncome} className="font-bold text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500">Bank Balance:</span>{' '}
                      {selectedCustomer.bankBalance ? (
                        <CurrencyDisplay amount={selectedCustomer.bankBalance} className="font-bold text-blue-600 dark:text-sky-400" />
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </div>
                    <div><span className="text-slate-500">Applying Country:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCustomer.applyingCountry || 'France'}</span></div>
                    <div><span className="text-slate-500">Visa Category:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.visaCategory || 'Tourist'}</span></div>
                    <div><span className="text-slate-500">Travel Purpose:</span> <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.travelPurpose || 'N/A'}</span></div>
                  </div>
                </div>

                {/* History & Refusals & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Previous Visa History</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">{selectedCustomer.previousVisaHistory || 'No prior visa history recorded.'}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="font-bold text-rose-600 dark:text-rose-400 mb-1">Previous Refusals</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">{selectedCustomer.previousRefusals || 'None'}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Notes</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">{selectedCustomer.notes || 'No notes.'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Linked Visa Cases */}
            {activeTab === 'cases' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Multi-country Visa Cases linked under customer profile {selectedCustomer.customerId}:</p>
                  <button
                    onClick={() => setIsNewCountryModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs shadow-sm hover:bg-purple-500"
                  >
                    + Add New Country Application
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-blue-600 dark:text-sky-400 font-bold">CAS-9001</span>
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5">{selectedCustomer.applyingCountry || 'France'} Schengen {selectedCustomer.visaCategory || 'Tourist'} Visa</p>
                    <p className="text-slate-500">Consultant: {selectedCustomer.assignedConsultant}</p>
                  </div>
                  <StatusBadge status="In Progress" />
                </div>
              </div>
            )}

            {/* Tab 3: Financial & Invoices */}
            {activeTab === 'financial' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-500">Financial Ledger for {selectedCustomer.name}:</p>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">INV-2026-0501 — {selectedCustomer.applyingCountry || 'France'} Visa Service Package</p>
                    <p className="text-slate-500 text-[11px]">Paid: LKR 70,000 | Balance: LKR 65,000</p>
                  </div>
                  <StatusBadge status="Part Paid" />
                </div>
              </div>
            )}
          </div>
        </FormModal>
      )}

      {/* Modal: Apply to Another Country */}
      {selectedCustomer && isNewCountryModalOpen && (
        <ApplyNewCountryModal
          isOpen={isNewCountryModalOpen}
          onClose={() => setIsNewCountryModalOpen(false)}
          customer={selectedCustomer}
          onSuccess={handleNewCountrySuccess}
        />
      )}
    </div>
  );
};

export default CustomersPage;
