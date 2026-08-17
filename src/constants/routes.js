/**
 * Central path registry. Both the router (routes/AppRoutes.jsx) and the
 * sidebar (constants/menuConfig.js) import from here so a path never has to
 * be typed twice and never drifts between the two.
 */
export const ROUTES = Object.freeze({
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',

  DASHBOARD: '/',
  LEADS: '/leads',
  CUSTOMERS: '/customers',
  CUSTOMER_DETAIL: '/customers/:customerId',
  VISA_CASES: '/visa-cases',
  VISA_CASE_DETAIL: '/visa-cases/:caseId',
  EVISA: '/e-visa',
  STUDENT_VISA: '/student-visa',
  WORK_VISA: '/work-visa',
  DOCUMENTS: '/documents',
  APPOINTMENTS: '/appointments',
  FOLLOWUPS: '/follow-ups',
  QUOTATIONS: '/quotations',
  INVOICES: '/invoices',
  PAYMENTS: '/payments',
  RECEIPTS: '/receipts',
  INCOME: '/income',
  EXPENSES: '/expenses',
  CASH_AND_BANK: '/cash-and-bank',
  SUPPLIERS: '/suppliers',
  PRICE_LIST: '/price-list',
  PACKAGES: '/packages',
  STAFF: '/staff',
  REPORTS: '/reports',
  SETTINGS: '/settings',

  CUSTOMER_PORTAL: '/portal',
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',
})
