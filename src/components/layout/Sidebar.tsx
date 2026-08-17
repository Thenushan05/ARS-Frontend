import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserCheck, FileText, Globe, DollarSign, 
  Receipt, FileSpreadsheet, Package, CreditCard, Landmark, Truck, 
  Award, Shield, Calendar, CheckSquare, TrendingUp, Settings, 
  ChevronLeft, ChevronRight, Briefcase, FileCheck, Layers, PieChart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Permission } from '../../types';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ElementType;
  permission?: Permission;
  badge?: string;
}

interface SidebarGroup {
  groupName: string;
  items: SidebarItem[];
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { hasPermission } = useAuth();

  const navGroups: SidebarGroup[] = [
    {
      groupName: 'Core CRM',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Leads', path: '/leads', icon: Users, permission: 'lead.view' },
        { label: 'Customers', path: '/customers', icon: UserCheck, permission: 'customer.view' },
        { label: 'Tasks & Follow-ups', path: '/tasks', icon: CheckSquare },
        { label: 'Appointments', path: '/appointments', icon: Calendar },
      ]
    },
    {
      groupName: 'Visa Operations',
      items: [
        { label: 'Visa Cases', path: '/visa-cases', icon: Briefcase, permission: 'visa.view' },
        { label: 'e-Visa Catalog', path: '/evisa', icon: Globe, permission: 'evisa.view' },
        { label: 'Document Vault', path: '/documents', icon: FileCheck },
      ]
    },
    {
      groupName: 'Sales & Billing',
      items: [
        { label: 'Master Price List', path: '/pricing', icon: Layers, permission: 'pricing.view' },
        { label: 'Packages', path: '/packages', icon: Package, permission: 'package.view' },
        { label: 'Quotations', path: '/quotations', icon: FileText, permission: 'quotation.view' },
        { label: 'Invoices', path: '/invoices', icon: FileSpreadsheet, permission: 'invoice.view' },
        { label: 'Payments', path: '/payments', icon: CreditCard, permission: 'payment.view' },
        { label: 'Receipts', path: '/receipts', icon: Receipt, permission: 'payment.view' },
        { label: 'Outstanding Pay', path: '/outstanding', icon: TrendingUp, permission: 'invoice.view' },
      ]
    },
    {
      groupName: 'Financial Accounts',
      items: [
        { label: 'Income Management', path: '/income', icon: DollarSign, permission: 'finance.income.view' },
        { label: 'Expense Management', path: '/expenses', icon: Receipt, permission: 'finance.expense.view' },
        { label: 'Cash & Bank', path: '/banking', icon: Landmark, permission: 'finance.banking.view' },
        { label: 'Suppliers & Agents', path: '/suppliers', icon: Truck, permission: 'supplier.view' },
      ]
    },
    {
      groupName: 'Management',
      items: [
        { label: 'Staff Management', path: '/staff', icon: Award, permission: 'staff.manage' },
        { label: 'Reports & Analytics', path: '/reports', icon: PieChart, permission: 'reports.view' },
        { label: 'System Settings', path: '/settings', icon: Settings, permission: 'settings.manage' },
      ]
    }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20 shrink-0">
            ARS
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-wide leading-none">
                ARS VISA
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase mt-1">
                & Consultants
              </span>
            </div>
          )}
        </NavLink>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group, idx) => {
          const visibleItems = group.items.filter(
            item => !item.permission || hasPermission(item.permission)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {group.groupName}
                </p>
              )}
              {visibleItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-50 dark:bg-sky-500/20 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-sky-500/30 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/80'
                      } ${collapsed ? 'justify-center' : ''}`
                    }
                  >
                    <IconComponent className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer Version Info */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 text-center">
          ARS CRM/ERP v2.4 Enterprise
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
