import {
  LayoutDashboard,
  UserPlus,
  Users,
  Briefcase,
  Globe2,
  GraduationCap,
  HardHat,
  FileText,
  CalendarClock,
  PhoneCall,
  ReceiptText,
  FileSpreadsheet,
  Wallet,
  BadgeDollarSign,
  TrendingUp,
  TrendingDown,
  Landmark,
  Handshake,
  Tags,
  PackageOpen,
  UserCog,
  BarChart3,
  Settings,
} from 'lucide-react'
import { ROUTES } from './routes'
import { PERMISSIONS } from './permissions'

/**
 * Single source of truth for the sidebar (§3). Each entry's `permission`
 * is checked against PermissionContext — items the user lacks permission
 * for are simply not rendered (see AppSidebar). Route access is enforced
 * again at the router level (PermissionRoute) so a hidden link is never
 * the only thing standing between a user and a page.
 */
export const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD, permission: PERMISSIONS.DASHBOARD_VIEW },
  { key: 'leads', label: 'Leads', icon: UserPlus, path: ROUTES.LEADS, permission: PERMISSIONS.LEADS_VIEW },
  { key: 'customers', label: 'Customers', icon: Users, path: ROUTES.CUSTOMERS, permission: PERMISSIONS.CUSTOMERS_VIEW },
  { key: 'visaCases', label: 'Visa Cases', icon: Briefcase, path: ROUTES.VISA_CASES, permission: PERMISSIONS.CASES_VIEW },
  { key: 'eVisa', label: 'e-Visa', icon: Globe2, path: ROUTES.EVISA, permission: PERMISSIONS.EVISA_VIEW },
  { key: 'student', label: 'Student', icon: GraduationCap, path: ROUTES.STUDENT_VISA, permission: PERMISSIONS.CASES_VIEW },
  { key: 'workVisa', label: 'Work Visa', icon: HardHat, path: ROUTES.WORK_VISA, permission: PERMISSIONS.CASES_VIEW },
  { key: 'documents', label: 'Documents', icon: FileText, path: ROUTES.DOCUMENTS, permission: PERMISSIONS.DOCUMENTS_VIEW },
  { key: 'appointments', label: 'Appointments', icon: CalendarClock, path: ROUTES.APPOINTMENTS, permission: PERMISSIONS.APPOINTMENTS_VIEW },
  { key: 'followups', label: 'Follow-ups', icon: PhoneCall, path: ROUTES.FOLLOWUPS, permission: PERMISSIONS.TASKS_VIEW },
  { key: 'quotations', label: 'Quotations', icon: FileSpreadsheet, path: ROUTES.QUOTATIONS, permission: PERMISSIONS.QUOTATIONS_VIEW },
  { key: 'invoices', label: 'Invoices', icon: ReceiptText, path: ROUTES.INVOICES, permission: PERMISSIONS.INVOICES_VIEW },
  { key: 'payments', label: 'Payments', icon: Wallet, path: ROUTES.PAYMENTS, permission: PERMISSIONS.PAYMENTS_VIEW },
  { key: 'receipts', label: 'Receipts', icon: BadgeDollarSign, path: ROUTES.RECEIPTS, permission: PERMISSIONS.RECEIPTS_VIEW },
  { key: 'income', label: 'Income', icon: TrendingUp, path: ROUTES.INCOME, permission: PERMISSIONS.INCOME_VIEW },
  { key: 'expenses', label: 'Expenses', icon: TrendingDown, path: ROUTES.EXPENSES, permission: PERMISSIONS.EXPENSES_VIEW },
  { key: 'cashAndBank', label: 'Cash & Bank', icon: Landmark, path: ROUTES.CASH_AND_BANK, permission: PERMISSIONS.ACCOUNTS_VIEW },
  { key: 'suppliers', label: 'Agents/Suppliers', icon: Handshake, path: ROUTES.SUPPLIERS, permission: PERMISSIONS.SUPPLIERS_VIEW },
  { key: 'priceList', label: 'Price List', icon: Tags, path: ROUTES.PRICE_LIST, permission: PERMISSIONS.PRICING_VIEW },
  { key: 'packages', label: 'Packages', icon: PackageOpen, path: ROUTES.PACKAGES, permission: PERMISSIONS.PACKAGES_VIEW },
  { key: 'staff', label: 'Staff', icon: UserCog, path: ROUTES.STAFF, permission: PERMISSIONS.STAFF_VIEW },
  { key: 'reports', label: 'Reports', icon: BarChart3, path: ROUTES.REPORTS, permission: PERMISSIONS.REPORTS_VIEW },
  { key: 'settings', label: 'Settings', icon: Settings, path: ROUTES.SETTINGS, permission: PERMISSIONS.SETTINGS_VIEW },
]
