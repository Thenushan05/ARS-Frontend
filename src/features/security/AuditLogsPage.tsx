import React, { useState } from 'react';
import { 
  ShieldCheck, Shield, KeyRound, Clock, UserCheck, Lock, Eye, 
  Search, Filter, History, FileText, AlertTriangle, CheckCircle2, QrCode, Laptop, Globe, Smartphone, RefreshCw
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';

interface AuditLogEntry {
  id: string;
  user: string;
  role: 'Super Admin' | 'Managing Director' | 'Manager' | 'Visa Consultant' | 'Accountant' | 'Marketing Staff';
  action: 'Changed' | 'Recorded' | 'Applied Discount' | 'Updated Status' | 'Deleted' | 'Created';
  module: 'Customers' | 'Payments' | 'Packages' | 'Visa Cases' | 'Suppliers' | 'Pricing';
  record: string;
  date: string;
  time: string;
  details?: string;
  ipAddress?: string;
}

interface LoginHistoryEntry {
  id: string;
  user: string;
  role: string;
  ipAddress: string;
  device: string;
  location: string;
  date: string;
  time: string;
  status: 'Success' | 'Failed';
}

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    user: 'Saman Jayasinghe',
    role: 'Manager',
    action: 'Changed',
    module: 'Customers',
    record: 'Sanduni De Silva (CUST-002)',
    date: '2026-08-18',
    time: '11:45 AM',
    details: 'Manager changed customer details (Updated passport expiry date and emergency contact)',
    ipAddress: '192.168.1.104'
  },
  {
    id: 'aud-2',
    user: 'Nimali Fernando',
    role: 'Accountant',
    action: 'Recorded',
    module: 'Payments',
    record: 'Payment REC-2026-101 (LKR 70,000)',
    date: '2026-08-18',
    time: '10:30 AM',
    details: 'Accountant recorded payment for France Schengen Package via Bank Transfer',
    ipAddress: '192.168.1.112'
  },
  {
    id: 'aud-3',
    user: 'Kasun Perera',
    role: 'Managing Director',
    action: 'Applied Discount',
    module: 'Packages',
    record: 'UK Student Premium Package (PKG-401)',
    date: '2026-08-17',
    time: '04:15 PM',
    details: 'Managing Director applied discount of 15% (LKR 20,000 waiver applied)',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'aud-4',
    user: 'Thenushan Sritharan',
    role: 'Visa Consultant',
    action: 'Updated Status',
    module: 'Visa Cases',
    record: 'France Schengen Case (CAS-9002)',
    date: '2026-08-17',
    time: '02:20 PM',
    details: 'Consultant changed visa status from Document Verification to VFS Appointment Booked',
    ipAddress: '192.168.1.108'
  },
  {
    id: 'aud-5',
    user: 'Super Admin',
    role: 'Super Admin',
    action: 'Changed',
    module: 'Suppliers',
    record: 'VFS Global Services (SUP-001)',
    date: '2026-08-16',
    time: '09:00 AM',
    details: 'Admin changed supplier cost rate for Schengen biometrics filing from €80 to €85',
    ipAddress: '192.168.1.101'
  }
];

const MOCK_LOGIN_HISTORY: LoginHistoryEntry[] = [
  { id: 'log-1', user: 'Thenushan Sritharan', role: 'Visa Consultant', ipAddress: '192.168.1.108', device: 'Chrome on Windows 11', location: 'Colombo, Sri Lanka', date: '2026-08-18', time: '08:30 AM', status: 'Success' },
  { id: 'log-2', user: 'Nimali Fernando', role: 'Accountant', ipAddress: '192.168.1.112', device: 'Firefox on macOS', location: 'Colombo, Sri Lanka', date: '2026-08-18', time: '09:12 AM', status: 'Success' },
  { id: 'log-3', user: 'Unknown Login', role: 'Guest', ipAddress: '178.62.19.44', device: 'Unknown Browser', location: 'Frankfurt, Germany', date: '2026-08-17', time: '11:45 PM', status: 'Failed' }
];

export const AuditLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'AuditLogs' | 'SecuritySettings' | 'LoginHistory'>('AuditLogs');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('All');

  // 2FA Security Settings State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [autoLogoutTime, setAutoLogoutTime] = useState('30 mins');
  const [docAccessLevel, setDocAccessLevel] = useState('Confidential');

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);

  // Filter Audit Logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.record.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = selectedRoleFilter === 'All' || log.role === selectedRoleFilter;
    const matchesModule = selectedModuleFilter === 'All' || log.module === selectedModuleFilter;

    return matchesSearch && matchesRole && matchesModule;
  });

  // 7 REQUIRED AUDIT COLUMNS
  const auditColumns: Column<AuditLogEntry>[] = [
    { 
      key: 'user', 
      header: '1. User', 
      render: (log) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 flex items-center justify-center font-bold text-xs">
            {log.user.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{log.user}</div>
            <div className="text-[10px] text-slate-500 font-mono">{log.ipAddress || 'Internal IP'}</div>
          </div>
        </div>
      ) 
    },
    { 
      key: 'role', 
      header: '2. Role', 
      render: (log) => (
        <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
          {log.role}
        </span>
      ) 
    },
    { 
      key: 'action', 
      header: '3. Action', 
      render: (log) => {
        let style = 'bg-blue-50 text-blue-700 border-blue-200';
        if (log.action === 'Deleted') style = 'bg-rose-50 text-rose-700 border-rose-200';
        if (log.action === 'Recorded' || log.action === 'Created') style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (log.action === 'Applied Discount') style = 'bg-purple-50 text-purple-700 border-purple-200';
        if (log.action === 'Changed') style = 'bg-amber-50 text-amber-700 border-amber-200';

        return (
          <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${style}`}>
            {log.action}
          </span>
        );
      } 
    },
    { 
      key: 'module', 
      header: '4. Module', 
      render: (log) => (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
          {log.module}
        </span>
      ) 
    },
    { 
      key: 'record', 
      header: '5. Record', 
      render: (log) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{log.record}</div>
          {log.details && <p className="text-[11px] text-slate-500 font-medium max-w-xs truncate" title={log.details}>{log.details}</p>}
        </div>
      ) 
    },
    { 
      key: 'date', 
      header: '6. Date', 
      render: (log) => <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{log.date}</span> 
    },
    { 
      key: 'time', 
      header: '7. Time', 
      render: (log) => <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{log.time}</span> 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          title="Security & System Audit Trail"
          subtitle="Management inspection logs tracking user edits, payment recordings, discounts, status changes, and 2FA settings."
          breadcrumbs={[{ label: 'Security & Audit Logs' }]}
        />

        {/* Toast Notification */}
        {notification && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 text-emerald-900 dark:text-emerald-100 text-xs font-bold flex items-center justify-between shadow-xs">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-emerald-600 font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Top Security KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Audit Trails" value={auditLogs.length} icon={History} colorScheme="blue" subtitle="tracked user actions" />
          <StatCard title="2FA Security Status" value={twoFactorEnabled ? 'Active' : 'Disabled'} icon={ShieldCheck} colorScheme="emerald" subtitle="TOTP authentication" />
          <StatCard title="Session Timeout" value={autoLogoutTime} icon={Clock} colorScheme="amber" subtitle="auto inactivity logout" />
          <StatCard title="Login Integrity" value="98.4%" icon={Lock} colorScheme="purple" subtitle="verified IP access" />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900/60 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => setActiveTab('AuditLogs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'AuditLogs'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>38. Audit Logs Table ({filteredAuditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SecuritySettings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'SecuritySettings'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security Configuration (2FA & Session)</span>
          </button>

          <button
            onClick={() => setActiveTab('LoginHistory')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'LoginHistory'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Login History Log</span>
          </button>
        </div>

        {/* TAB 1: AUDIT LOGS TABLE */}
        {activeTab === 'AuditLogs' && (
          <div className="space-y-4">
            {/* Search & Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search audit trail by user, record, or details..."
                className="w-full lg:w-80"
              />

              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto text-xs">
                {/* Role Filter */}
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-600 dark:text-slate-400">Role:</span>
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="All">All Roles</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Managing Director">Managing Director</option>
                    <option value="Manager">Manager</option>
                    <option value="Visa Consultant">Visa Consultant</option>
                    <option value="Accountant">Accountant</option>
                  </select>
                </div>

                {/* Module Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-600 dark:text-slate-400">Module:</span>
                  <select
                    value={selectedModuleFilter}
                    onChange={(e) => setSelectedModuleFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="All">All Modules</option>
                    <option value="Customers">Customers</option>
                    <option value="Payments">Payments</option>
                    <option value="Packages">Packages</option>
                    <option value="Visa Cases">Visa Cases</option>
                    <option value="Suppliers">Suppliers</option>
                  </select>
                </div>
              </div>
            </div>

            {/* DataTable (7 Required Columns) */}
            <DataTable
              columns={auditColumns}
              data={filteredAuditLogs}
              emptyText="No audit logs matching search criteria."
            />
          </div>
        )}

        {/* TAB 2: SECURITY CONFIGURATION (2FA, SESSION LOGOUT, DOC ACCESS) */}
        {activeTab === 'SecuritySettings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Two-Factor Authentication (2FA) */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm">Two-Factor Authentication (2FA)</h3>
                    <p className="text-xs text-slate-500">Require TOTP authenticator code upon staff login</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  twoFactorEnabled ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}>
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Protect employee accounts using Google Authenticator, Authy, or Microsoft Authenticator TOTP tokens.
              </p>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setIs2FAModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  Configure 2FA Setup
                </button>
                <button
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    setNotification(`2FA Authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'} system-wide.`);
                    setTimeout(() => setNotification(null), 4000);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                    twoFactorEnabled ? 'border-rose-300 text-rose-600 hover:bg-rose-50' : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </div>

            {/* 2. Automatic Session Logout */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm">Automatic Session Inactivity Logout</h3>
                  <p className="text-xs text-slate-500">Automatically lock screen when idle</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <label className="block font-bold text-slate-700 dark:text-slate-300">Inactivity Timeout Limit</label>
                <select
                  value={autoLogoutTime}
                  onChange={(e) => {
                    setAutoLogoutTime(e.target.value);
                    setNotification(`Automatic session logout timeout set to ${e.target.value}.`);
                    setTimeout(() => setNotification(null), 4000);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="15 mins">15 Minutes Inactivity</option>
                  <option value="30 mins">30 Minutes Inactivity (Recommended)</option>
                  <option value="1 hour">1 Hour Inactivity</option>
                  <option value="Never">Never (Disable Auto Logout)</option>
                </select>
                <p className="text-[11px] text-slate-500 italic">Sessions will automatically expire and redirect user to login screen after specified idle duration.</p>
              </div>
            </div>

            {/* 3. Document Access Permissions Level */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm">Document Access Permissions</h3>
                  <p className="text-xs text-slate-500">Default document vault security classification level</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <label className="block font-bold text-slate-700 dark:text-slate-300">Classification Policy</label>
                <select
                  value={docAccessLevel}
                  onChange={(e) => {
                    setDocAccessLevel(e.target.value);
                    setNotification(`Document clearance level updated to ${e.target.value}.`);
                    setTimeout(() => setNotification(null), 4000);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="Restricted">Restricted (Management & Assigned Consultant Only)</option>
                  <option value="Confidential">Confidential (Internal Staff Only)</option>
                  <option value="Public">Public (Accessible to Client Portal)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOGIN HISTORY LOG */}
        {activeTab === 'LoginHistory' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-3">Recent Authentication Attempts & IP History</h3>
              <div className="space-y-2 text-xs">
                {MOCK_LOGIN_HISTORY.map(log => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{log.user}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">{log.role}</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">IP: {log.ipAddress} | Device: {log.device} | Location: {log.location}</p>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        log.status === 'Success' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}>
                        {log.status}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono mt-1">{log.date} at {log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2FA SETUP MODAL */}
      {is2FAModalOpen && (
        <FormModal
          isOpen={is2FAModalOpen}
          onClose={() => setIs2FAModalOpen(false)}
          title="Configure Two-Factor Authentication (TOTP)"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950 text-center space-y-3 border border-slate-200 dark:border-slate-800">
              <QrCode className="w-24 h-24 text-slate-900 dark:text-slate-100 mx-auto" />
              <p className="font-mono text-xs font-bold text-blue-600">SECRET KEY: JBSWY3DPEHPK3PXP</p>
              <p className="text-[11px] text-slate-500">Scan this QR code with Google Authenticator or Authy to bind your device.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Enter 6-Digit TOTP Code</label>
              <input
                type="text"
                placeholder="123456"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-center tracking-widest text-base focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIs2FAModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setTwoFactorEnabled(true);
                  setNotification('2FA bind verified successfully!');
                  setTimeout(() => setNotification(null), 4000);
                  setIs2FAModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
              >
                Verify & Bind 2FA
              </button>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
};

export default AuditLogsPage;
