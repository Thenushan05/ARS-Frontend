import React, { useState, useEffect } from 'react';
import { Plus, User, Phone, Mail, FileText, CreditCard, Calendar, Briefcase, Activity, Shield } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import { Customer } from '../../types';
import { customersApi, visaCasesApi, paymentsApi, invoicesApi } from '../../api';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'payments' | 'invoices' | 'activity'>('overview');

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

  const columns: Column<Customer>[] = [
    { key: 'customerId', header: 'Customer ID', render: (c) => <span className="font-mono text-sky-400 font-semibold">{c.customerId}</span> },
    { key: 'name', header: 'Customer Name', render: (c) => (
      <div>
        <div className="font-bold text-slate-100">{c.name}</div>
        <div className="text-xs text-slate-400">Passport: {c.passportNumber}</div>
      </div>
    )},
    { key: 'phone', header: 'Contact', render: (c) => (
      <div>
        <div className="text-slate-200 text-xs">{c.phone}</div>
        <div className="text-xs text-emerald-400">WA: {c.whatsApp}</div>
      </div>
    )},
    { key: 'assignedConsultant', header: 'Consultant', render: (c) => <span className="text-slate-300">{c.assignedConsultant}</span> },
    { key: 'activeCasesCount', header: 'Active Cases', render: (c) => (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
        {c.activeCasesCount} Active
      </span>
    )},
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    { key: 'createdAt', header: 'Registered', render: (c) => <span className="text-xs text-slate-500">{c.createdAt}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Directory & 360 Profiles"
        subtitle="Manage client registrations, active visa applications, financial histories, and case files."
        breadcrumbs={[{ label: 'Customers' }]}
        actions={
          <button
            onClick={() => alert('Use Lead Conversion workflow or quick registration form.')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Registration</span>
          </button>
        }
      />

      <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search customers by name, passport, or phone..." className="max-w-md" />

      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        onRowClick={(c) => setSelectedCustomer(c)}
        actions={(c) => (
          <button
            onClick={() => setSelectedCustomer(c)}
            className="px-3 py-1 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-semibold hover:bg-sky-500/25 transition-all"
          >
            View 360 Profile
          </button>
        )}
      />

      {/* Customer 360 Modal */}
      {selectedCustomer && (
        <FormModal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Customer 360 Profile — ${selectedCustomer.name} (${selectedCustomer.customerId})`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'overview' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('cases')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'cases' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Visa Cases
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'payments' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Payments & Receipts
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'activity' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Activity Log
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="font-bold text-slate-300 text-sm border-b border-slate-800 pb-2">Personal Details</p>
                  <div><span className="text-slate-500">Full Name:</span> <span className="text-slate-200 font-semibold">{selectedCustomer.name}</span></div>
                  <div><span className="text-slate-500">Passport Number:</span> <span className="text-sky-400 font-mono font-semibold">{selectedCustomer.passportNumber}</span></div>
                  <div><span className="text-slate-500">NIC Number:</span> <span className="text-slate-200">{selectedCustomer.nic || '199212304567'}</span></div>
                  <div><span className="text-slate-500">Date of Birth:</span> <span className="text-slate-200">{selectedCustomer.dateOfBirth || '1992-04-12'}</span></div>
                  <div><span className="text-slate-500">Address:</span> <span className="text-slate-200">{selectedCustomer.address || 'No. 45, Galle Road, Colombo'}</span></div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="font-bold text-slate-300 text-sm border-b border-slate-800 pb-2">Consultation Info</p>
                  <div><span className="text-slate-500">Assigned Consultant:</span> <span className="text-purple-400 font-semibold">{selectedCustomer.assignedConsultant}</span></div>
                  <div><span className="text-slate-500">Phone:</span> <span className="text-slate-200">{selectedCustomer.phone}</span></div>
                  <div><span className="text-slate-500">WhatsApp:</span> <span className="text-emerald-400">{selectedCustomer.whatsApp}</span></div>
                  <div><span className="text-slate-500">Email:</span> <span className="text-slate-200">{selectedCustomer.email}</span></div>
                  <div><span className="text-slate-500">Registration Date:</span> <span className="text-slate-200">{selectedCustomer.createdAt}</span></div>
                </div>
              </div>
            )}

            {activeTab === 'cases' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">Associated Visa Cases for {selectedCustomer.name}:</p>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-sky-400 font-semibold">CAS-9001</span>
                    <p className="font-bold text-slate-100 text-sm mt-0.5">France Schengen Tourist Visa</p>
                  </div>
                  <StatusBadge status="Appointment Booked" />
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">Payment & Invoice History:</p>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-100">INV-2026-0501 — France Package</p>
                    <p className="text-slate-400 text-[11px]">Paid: LKR 70,000 | Balance: LKR 65,000</p>
                  </div>
                  <StatusBadge status="Part Paid" />
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-slate-300">Converted from Lead LD-1004</span>
                  <span className="text-slate-500">{selectedCustomer.createdAt}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-slate-300">VFS Appointment Scheduled for 2026-08-22</span>
                  <span className="text-slate-500">2026-08-11</span>
                </div>
              </div>
            )}
          </div>
        </FormModal>
      )}
    </div>
  );
};

export default CustomersPage;
