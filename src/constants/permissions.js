/**
 * Permission key catalog (§6, §7, §37).
 *
 * These strings are the contract between frontend and backend. The backend
 * issues a `permissions: string[]` array on the authenticated user (see
 * authApi.getCurrentUser). The frontend never derives permissions from role
 * name — it only ever checks membership in this array via PermissionContext.
 * Hiding UI here is UX only; the backend must enforce the same keys.
 *
 * Naming convention: "<module>.<resource>.<action>"
 */
export const PERMISSIONS = Object.freeze({
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_FINANCE_VIEW: 'dashboard.finance.view',

  // Leads & Customers
  LEADS_VIEW: 'leads.view',
  LEADS_MANAGE: 'leads.manage',
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_MANAGE: 'customers.manage',

  // Visa cases / documents / appointments
  CASES_VIEW: 'cases.view',
  CASES_MANAGE: 'cases.manage',
  CASES_STATUS_CHANGE: 'cases.status.change',
  DOCUMENTS_VIEW: 'documents.view',
  DOCUMENTS_MANAGE: 'documents.manage',
  DOCUMENTS_DOWNLOAD: 'documents.download',
  REQUIREMENTS_MANAGE: 'requirements.manage',
  APPOINTMENTS_VIEW: 'appointments.view',
  APPOINTMENTS_MANAGE: 'appointments.manage',
  TASKS_VIEW: 'tasks.view',
  TASKS_MANAGE: 'tasks.manage',

  // Pricing / packages / quotations — selling side (public to staff)
  PRICING_VIEW: 'pricing.view',
  PRICING_MANAGE: 'pricing.manage',
  PACKAGES_VIEW: 'packages.view',
  PACKAGES_MANAGE: 'packages.manage',
  PACKAGES_DISCOUNT_APPLY: 'packages.discount.apply',
  QUOTATIONS_VIEW: 'quotations.view',
  QUOTATIONS_MANAGE: 'quotations.manage',
  EVISA_VIEW: 'evisa.view',
  EVISA_MANAGE: 'evisa.manage',

  // Restricted financial data (§7) — cost/profit, never selling price
  FINANCE_COST_VIEW: 'finance.cost.view',
  FINANCE_PROFIT_VIEW: 'finance.profit.view',
  FINANCE_SUPPLIER_COST_VIEW: 'finance.supplier_cost.view',

  // Finance operations — invoices/payments/receipts/income/expenses
  INVOICES_VIEW: 'invoices.view',
  INVOICES_MANAGE: 'invoices.manage',
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_MANAGE: 'payments.manage',
  RECEIPTS_VIEW: 'receipts.view',
  INCOME_VIEW: 'income.view',
  INCOME_MANAGE: 'income.manage',
  EXPENSES_VIEW: 'expenses.view',
  EXPENSES_MANAGE: 'expenses.manage',
  ACCOUNTS_VIEW: 'accounts.view',
  ACCOUNTS_MANAGE: 'accounts.manage',
  OUTSTANDING_VIEW: 'outstanding.view',
  PROFIT_LOSS_VIEW: 'profit_loss.view',

  // Suppliers/agents
  SUPPLIERS_VIEW: 'suppliers.view',
  SUPPLIERS_MANAGE: 'suppliers.manage',
  SUPPLIERS_PAYABLE_VIEW: 'suppliers.payable.view',

  // Staff / management
  STAFF_VIEW: 'staff.view',
  STAFF_MANAGE: 'staff.manage',
  STAFF_PERMISSIONS_MANAGE: 'staff.permissions.manage',
  STAFF_PERFORMANCE_VIEW: 'staff.performance.view',

  // Reports / audit / security
  REPORTS_VIEW: 'reports.view',
  REPORTS_FINANCE_VIEW: 'reports.finance.view',
  AUDIT_LOG_VIEW: 'audit_log.view',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',
})

/**
 * Convenience group used by PermissionGuard consumers that need to gate an
 * entire "internal cost / profit" surface at once (§7). Equivalent to
 * requiring ANY of these keys, most call-sites will check ALL relevant ones.
 */
export const RESTRICTED_FINANCE_PERMISSIONS = [
  PERMISSIONS.FINANCE_COST_VIEW,
  PERMISSIONS.FINANCE_PROFIT_VIEW,
  PERMISSIONS.FINANCE_SUPPLIER_COST_VIEW,
]
