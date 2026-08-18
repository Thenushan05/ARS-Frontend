import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, Check, Lock, Eye, Plus, Edit, Trash2, 
  DollarSign, FileSpreadsheet, Users, Settings, Award, Layers, Sparkles, 
  RotateCcw, ShieldAlert, ArrowRight, CheckCircle2, UserPlus, FileText, Activity
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import PermissionGuard from '../../components/common/PermissionGuard';
import { useAuth } from '../../context/AuthContext';
import { UserRole, Permission } from '../../types';

interface RoleInfo {
  name: UserRole;
  description: string;
  userCount: number;
  badgeColor: string;
  defaultPermissions: Permission[];
}

interface PermissionCategory {
  categoryName: string;
  description: string;
  permissions: {
    key: Permission;
    label: string;
    description: string;
  }[];
}

export const RolesPermissionsPage: React.FC = () => {
  const { user, switchRole, hasPermission, updateUserPermissions } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'Super Admin');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // System Roles List
  const roles: RoleInfo[] = [
    {
      name: 'Super Admin',
      description: 'Unrestricted system-wide access and configuration control.',
      userCount: 2,
      badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      defaultPermissions: [
        'lead.view', 'lead.create', 'lead.edit', 'lead.delete', 'lead.convert',
        'customer.view', 'customer.create', 'customer.edit', 'customer.delete',
        'visa.view', 'visa.create', 'visa.update', 'visa.delete',
        'evisa.view', 'evisa.manage',
        'quotation.view', 'quotation.create', 'quotation.edit',
        'invoice.view', 'invoice.create', 'invoice.edit',
        'payment.view', 'payment.create', 'payment.receipt',
        'pricing.view', 'pricing.cost.view', 'pricing.edit',
        'package.view', 'package.create', 'package.discount',
        'supplier.view', 'supplier.create', 'supplier.cost.view',
        'finance.income.view', 'finance.expense.view', 'finance.profit.view', 'finance.banking.view',
        'staff.manage', 'staff.performance',
        'reports.view', 'reports.export',
        'settings.manage'
      ]
    },
    {
      name: 'Managing Director',
      description: 'Executive management overview, financial reports, profit metrics, and high-level strategy.',
      userCount: 1,
      badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
      defaultPermissions: [
        'lead.view', 'customer.view', 'visa.view', 'evisa.view',
        'quotation.view', 'invoice.view', 'payment.view',
        'pricing.view', 'pricing.cost.view',
        'supplier.view', 'supplier.cost.view',
        'finance.income.view', 'finance.expense.view', 'finance.profit.view', 'finance.banking.view',
        'staff.manage', 'staff.performance',
        'reports.view', 'reports.export',
        'settings.manage'
      ]
    },
    {
      name: 'Manager',
      description: 'Branch operations leader managing staff, leads, customer onboarding, cases, and invoices.',
      userCount: 4,
      badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-sky-400 border-blue-500/30',
      defaultPermissions: [
        'lead.view', 'lead.create', 'lead.edit', 'lead.convert', 'lead.delete',
        'customer.view', 'customer.create', 'customer.edit',
        'visa.view', 'visa.create', 'visa.update',
        'evisa.view', 'evisa.manage',
        'quotation.view', 'quotation.create', 'quotation.edit',
        'invoice.view', 'invoice.create', 'invoice.edit',
        'payment.view', 'payment.create', 'payment.receipt',
        'pricing.view', 'pricing.cost.view',
        'package.view', 'package.create',
        'supplier.view', 'supplier.create',
        'finance.income.view', 'finance.expense.view', 'finance.profit.view', 'finance.banking.view',
        'staff.manage', 'staff.performance',
        'reports.view', 'reports.export'
      ]
    },
    {
      name: 'Visa Consultant',
      description: 'Frontline consultant registering clients, creating visa cases, and drafting quotations.',
      userCount: 12,
      badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      defaultPermissions: [
        'lead.view', 'lead.create', 'lead.edit', 'lead.convert',
        'customer.view', 'customer.create', 'customer.edit',
        'visa.view', 'visa.create', 'visa.update',
        'evisa.view',
        'quotation.view', 'quotation.create',
        'invoice.view', 'payment.view'
      ]
    },
    {
      name: 'Customer Service',
      description: 'Client intake, lead capture, appointment scheduling, and basic record queries.',
      userCount: 8,
      badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      defaultPermissions: [
        'lead.view', 'lead.create', 'lead.edit',
        'customer.view', 'customer.create',
        'visa.view',
        'quotation.view'
      ]
    },
    {
      name: 'Accountant',
      description: 'Financial transactions, payments, receipts, supplier cost audit, and expense tracking.',
      userCount: 3,
      badgeColor: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
      defaultPermissions: [
        'invoice.view', 'invoice.create', 'invoice.edit',
        'payment.view', 'payment.create', 'payment.receipt',
        'pricing.view', 'pricing.cost.view',
        'supplier.view', 'supplier.cost.view',
        'finance.income.view', 'finance.expense.view', 'finance.profit.view', 'finance.banking.view',
        'reports.view', 'reports.export'
      ]
    },
    {
      name: 'Marketing Staff',
      description: 'Lead generation, marketing source performance tracking, and campaign metrics.',
      userCount: 5,
      badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      defaultPermissions: [
        'lead.view', 'lead.create', 'lead.edit',
        'customer.view',
        'reports.view'
      ]
    }
  ];

  // Grouped Permission Categories
  const permissionCategories: PermissionCategory[] = [
    {
      categoryName: 'Lead Management (Leads)',
      description: 'Controls lead generation, viewing, editing, deletion, and client conversion.',
      permissions: [
        { key: 'lead.view', label: 'View Leads', description: 'Access lead pipeline, search, and directory.' },
        { key: 'lead.create', label: 'Create Leads', description: 'Add new leads manually or via social channels.' },
        { key: 'lead.edit', label: 'Edit Leads', description: 'Modify lead contact details, status, and follow-ups.' },
        { key: 'lead.convert', label: 'Convert to Customer', description: 'Convert qualified leads into registered customers.' },
        { key: 'lead.delete', label: 'Delete Leads', description: 'Permanently purge invalid lead records.' },
      ]
    },
    {
      categoryName: 'Customer Directory (Customers)',
      description: 'Manages ARS client database, 360 profiles, passport data, and family links.',
      permissions: [
        { key: 'customer.view', label: 'View Customers', description: 'Access customer profiles, passport numbers, and case history.' },
        { key: 'customer.create', label: 'Register Customer (9. CUSTOMER REGISTRATION)', description: 'Generate ARS-2026-XXXXX customer IDs and basic files.' },
        { key: 'customer.edit', label: 'Edit Customer Info', description: 'Update passport info, NIC, phone numbers, and financial details.' },
        { key: 'customer.delete', label: 'Delete Customer Record', description: 'Remove customer files from system.' },
      ]
    },
    {
      categoryName: 'Visa Cases & e-Visa Catalog',
      description: 'Controls visa application workflows, status tracking, and document verification.',
      permissions: [
        { key: 'visa.view', label: 'View Visa Cases', description: 'Monitor visa case statuses, checklists, and embassy dates.' },
        { key: 'visa.create', label: 'Create Visa Case', description: 'Initialize new embassy application files.' },
        { key: 'visa.update', label: 'Update Case Status', description: 'Progress cases through workflow milestones.' },
        { key: 'visa.delete', label: 'Delete Visa Case', description: 'Cancel or purge application cases.' },
        { key: 'evisa.view', label: 'View e-Visa Catalog', description: 'Browse active e-visa rates, requirements, and SLAs.' },
        { key: 'evisa.manage', label: 'Manage e-Visa Services', description: 'Create and update country e-visa portal items.' },
      ]
    },
    {
      categoryName: 'Sales, Invoicing & Payments',
      description: 'Controls quotations, customer invoices, payment collection, and receipts.',
      permissions: [
        { key: 'quotation.view', label: 'View Quotations', description: 'Inspect price quotes and fee breakdowns.' },
        { key: 'quotation.create', label: 'Create Quotation', description: 'Generate custom fee quotations for clients.' },
        { key: 'invoice.view', label: 'View Invoices', description: 'Access tax invoices and outstanding balances.' },
        { key: 'invoice.create', label: 'Issue Invoice', description: 'Generate official ARS invoices.' },
        { key: 'payment.view', label: 'View Payments', description: 'View payment transactions and receipts.' },
        { key: 'payment.create', label: 'Collect Payment', description: 'Record client payments and issue receipts.' },
      ]
    },
    {
      categoryName: 'Financial Costs & Net Profitability (Restricted)',
      description: 'High-security financial permissions controlling supplier net costs, profit margins, and bank accounts.',
      permissions: [
        { key: 'pricing.cost.view', label: 'View Emb/Cost Prices (pricing.cost.view)', description: 'Display net cost prices vs selling prices.' },
        { key: 'supplier.cost.view', label: 'View Supplier Costs (supplier.cost.view)', description: 'Display wholesale supplier rates.' },
        { key: 'finance.profit.view', label: 'View Net Profit Margins (finance.profit.view)', description: 'Access company net profit figures and financial reports.' },
        { key: 'finance.banking.view', label: 'View Bank & Cash Accounts', description: 'Access company bank account balances and transfers.' },
        { key: 'finance.income.view', label: 'View Revenue & Income', description: 'Access gross revenue ledgers.' },
        { key: 'finance.expense.view', label: 'View Company Expenses', description: 'Access operational expense logs.' },
      ]
    },
    {
      categoryName: 'Staff & System Administration',
      description: 'Controls team member management, performance audits, and system configuration.',
      permissions: [
        { key: 'staff.manage', label: 'Manage Staff Members (staff.manage)', description: 'Add/edit staff accounts, roles, and commissions.' },
        { key: 'staff.performance', label: 'View Staff Performance', description: 'Inspect conversion KPIs and revenue per staff member.' },
        { key: 'reports.view', label: 'View Analytics & Reports', description: 'Access management reports and charts.' },
        { key: 'reports.export', label: 'Export Reports (CSV/PDF)', description: 'Download sensitive business reporting data.' },
        { key: 'settings.manage', label: 'Manage System Settings (settings.manage)', description: 'Configure company profile, branches, and system rules.' },
      ]
    }
  ];

  // State for active role permission customization
  const [rolePermissionsState, setRolePermissionsState] = useState<Record<UserRole, Permission[]>>(() => {
    const initial: Record<UserRole, Permission[]> = {} as any;
    roles.forEach(r => {
      initial[r.name] = r.defaultPermissions;
    });
    return initial;
  });

  const activeRoleData = roles.find(r => r.name === selectedRole) || roles[0];
  const activePermissions = rolePermissionsState[selectedRole] || [];

  const handleTogglePermission = (permKey: Permission) => {
    if (selectedRole === 'Super Admin') {
      setToastMessage('Super Admin role automatically retains all system permissions by default.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    const currentList = rolePermissionsState[selectedRole] || [];
    const isGranted = currentList.includes(permKey);
    const updated = isGranted 
      ? currentList.filter(p => p !== permKey) 
      : [...currentList, permKey];

    setRolePermissionsState(prev => ({
      ...prev,
      [selectedRole]: updated
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveRolePermissions = () => {
    if (user && user.role === selectedRole) {
      updateUserPermissions(activePermissions);
    }
    setHasUnsavedChanges(false);
    setToastMessage(`Successfully saved permission matrix for "${selectedRole}" role!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleActivateRoleForTesting = (roleName: UserRole) => {
    switchRole(roleName, rolePermissionsState[roleName]);
    setSelectedRole(roleName);
    setToastMessage(`Switched active user session to "${roleName}" role! Sidebar navigation & UI guards updated.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role & Permission Management (1. ROLE AND PERMISSION UI)"
        subtitle="Configure role-based access control (RBAC), permission matrix, and verify frontend UI guards with backend payload integration."
        breadcrumbs={[{ label: 'System Settings', href: '/settings' }, { label: 'Roles & Permissions' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleActivateRoleForTesting(selectedRole)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate Session as {selectedRole}</span>
            </button>
          </div>
        }
      />

      {/* Security Architecture Principle Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-amber-900 dark:text-amber-100 flex items-center gap-2">
              <span>Frontend Security Control Principle</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 uppercase tracking-wider">
                Mandatory Security Rule
              </span>
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
              Frontend permission guards (e.g. <code className="font-mono bg-amber-200/60 dark:bg-amber-900/60 px-1 py-0.5 rounded">&lt;PermissionGuard permission="finance.profit.view"&gt;</code>) are <strong>UI presentation controls only</strong> designed to streamline user experience. <strong>Never assume hiding a component provides real security.</strong> All business operations, cost price queries, and mutations must be strictly enforced on backend REST API endpoints using JWT claims and database authorization middleware.
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs underline font-bold">Dismiss</button>
        </div>
      )}

      {/* Role Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            <span>1. System Roles ({roles.length} Roles)</span>
          </h3>
          <span className="text-xs text-slate-500">Select a role to inspect or customize its permission matrix</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roles.map((r) => {
            const isSelected = selectedRole === r.name;
            const isCurrentSessionRole = user?.role === r.name;

            return (
              <div
                key={r.name}
                onClick={() => setSelectedRole(r.name)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-sky-500/10 border-blue-500 dark:border-sky-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${r.badgeColor}`}>
                    {r.name}
                  </span>
                  {isCurrentSessionRole && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                      ACTIVE SESSION
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[32px]">
                  {r.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {r.userCount} Assigned Staff
                  </span>
                  <span className="font-mono text-blue-600 dark:text-sky-400 font-bold">
                    {rolePermissionsState[r.name]?.length || 0} Perms
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permission Matrix Editor */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Permission Matrix for <span className="text-blue-600 dark:text-sky-400 font-black">{selectedRole}</span>
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${activeRoleData.badgeColor}`}>
                {activePermissions.length} Enabled
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Toggle specific permission flags received from backend authorization response.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleActivateRoleForTesting(selectedRole)}
              className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
            >
              Switch Session to {selectedRole}
            </button>
            <button
              onClick={handleSaveRolePermissions}
              disabled={!hasUnsavedChanges}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all disabled:opacity-40"
            >
              <Check className="w-4 h-4" />
              <span>Save Matrix</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {permissionCategories.map((cat, idx) => (
            <div key={idx} className="space-y-3">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{cat.categoryName}</span>
                </h4>
                <p className="text-[11px] text-slate-500">{cat.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.permissions.map((p) => {
                  const isGranted = selectedRole === 'Super Admin' || activePermissions.includes(p.key);

                  return (
                    <div
                      key={p.key}
                      onClick={() => handleTogglePermission(p.key)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isGranted
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-slate-900 dark:text-slate-100'
                          : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-70'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-xs ${isGranted ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-500'}`}>
                            {p.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {p.description}
                        </p>
                        <span className="inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                          {p.key}
                        </span>
                      </div>

                      {/* Toggle Switch */}
                      <div className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${isGranted ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isGranted ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Interactive PermissionGuard Component Tester */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-sky-400" />
              <span>Live Reusable &lt;PermissionGuard&gt; Component Tester</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Testing active session role: <strong className="text-purple-600 dark:text-purple-400">{user?.role}</strong> against UI controls.
            </p>
          </div>

          {/* Quick Session Role Switcher Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {roles.map(r => (
              <button
                key={r.name}
                onClick={() => handleActivateRoleForTesting(r.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  user?.role === r.name
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Case 1: finance.profit.view */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-sky-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-sky-500/30">
                Permission Guard: "finance.profit.view"
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                hasPermission('finance.profit.view') 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {hasPermission('finance.profit.view') ? 'ALLOWED (Visible)' : 'DENIED (Hidden/Fallback)'}
              </span>
            </div>

            <PermissionGuard
              permission="finance.profit.view"
              fallback={
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-1">
                  <Lock className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Net Profit Control Locked</p>
                  <p className="text-[11px] text-slate-400">Hidden because role "{user?.role}" lacks "finance.profit.view".</p>
                </div>
              }
            >
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">Company Net Profit Margin</span>
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-black font-mono">LKR 4,850,000</div>
                <p className="text-[11px] opacity-80">Visible only to executive roles (Super Admin, MD, Accountant).</p>
              </div>
            </PermissionGuard>
          </div>

          {/* Test Case 2: supplier.cost.view */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-500/30">
                Permission Guard: "supplier.cost.view"
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                hasPermission('supplier.cost.view') 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {hasPermission('supplier.cost.view') ? 'ALLOWED (Visible)' : 'DENIED (Hidden/Fallback)'}
              </span>
            </div>

            <PermissionGuard
              permission="supplier.cost.view"
              fallback={
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-1">
                  <Lock className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Supplier Net Rate Hidden</p>
                  <p className="text-[11px] text-slate-400">Hidden because role "{user?.role}" lacks "supplier.cost.view".</p>
                </div>
              }
            >
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">Embassy Net Cost Price</span>
                  <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-black font-mono">LKR 125,000 / Case</div>
                <p className="text-[11px] opacity-80">Visible only when supplier net cost permission is assigned.</p>
              </div>
            </PermissionGuard>
          </div>

          {/* Test Case 3: lead.delete */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-500/30">
                Permission Guard: "lead.delete"
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                hasPermission('lead.delete') 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {hasPermission('lead.delete') ? 'ALLOWED (Visible)' : 'DENIED (Hidden)'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Lead Record: Dilshan Mendis (LD-8842)</p>
                <p className="text-[11px] text-slate-500">Status: Interested | France Tourist</p>
              </div>

              <PermissionGuard permission="lead.delete">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 shadow-sm">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Lead</span>
                </button>
              </PermissionGuard>
            </div>
          </div>

          {/* Test Case 4: settings.manage */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-500/30">
                Permission Guard: "settings.manage"
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                hasPermission('settings.manage') 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {hasPermission('settings.manage') ? 'ALLOWED (Visible)' : 'DENIED (Hidden/Fallback)'}
              </span>
            </div>

            <PermissionGuard
              permission="settings.manage"
              fallback={
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>System Configuration Panel hidden for role "{user?.role}".</span>
                </div>
              }
            >
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-100 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="font-bold">System Configuration & API Keys Control</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-100 font-bold">ADMIN ONLY</span>
              </div>
            </PermissionGuard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissionsPage;
