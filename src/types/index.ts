// Roles are backend-seeded DB rows (Role.name), not a closed frontend enum — the `(string & {})`
// member keeps autocomplete for the known seeded names while still accepting whatever a Super
// Admin creates later via the Roles module (brief §19: role name is a label, never a security
// boundary — `User.isSuperAdmin` / `permissions` are what actually gate anything).
export type UserRole =
  | 'Super Admin'
  | 'Admin'
  | 'Managing Director'
  | 'Manager'
  | 'Visa Consultant'
  | 'Customer Service'
  | 'Accountant'
  | 'Marketing Staff'
  | 'Customer'
  | (string & {});

// The real backend permission-key catalog (Backend `src/common/constants/permissions.constant.ts`,
// ~90 keys as of this integration) — kept here purely for editor autocomplete; the `(string & {})`
// member means an unrecognized string still compiles (so this list drifting slightly behind the
// backend's is a DX papercut, not a build break). Treat the backend's catalog as the source of
// truth: `GET /permissions` returns it live. Several routes/guards elsewhere in this app still use
// pre-integration placeholder keys (e.g. `visa.view`, `finance.income.view`, `reports.view`) that
// don't exist in this catalog — flagged in INTEGRATION_PLAN.md §8 for correction module-by-module,
// not fixed in this pass to avoid a repo-wide sweep outside Phase 1's scope.
export type Permission =
  | 'dashboard.view' | 'dashboard.finance.view'
  | 'lead.view' | 'lead.create' | 'lead.update' | 'lead.convert' | 'lead.archive'
  | 'customer.view' | 'customer.create' | 'customer.update' | 'customer.archive'
  | 'case.view' | 'case.create' | 'case.update' | 'case.status.update' | 'case.archive'
  | 'document.view' | 'document.upload' | 'document.verify' | 'document.delete'
  | 'requirements.view' | 'requirements.manage'
  | 'country.view' | 'country.manage' | 'visa_type.view' | 'visa_type.manage'
  | 'evisa.view' | 'evisa.create' | 'evisa.update' | 'evisa.internal_cost.view'
  | 'pricing.view' | 'pricing.create' | 'pricing.update' | 'pricing.internal_cost.view'
  | 'package.view' | 'package.create' | 'package.update' | 'package.discount' | 'package.internal_cost.view'
  | 'quotation.view' | 'quotation.create' | 'quotation.update' | 'quotation.discount'
  | 'invoice.view' | 'invoice.create' | 'invoice.update' | 'invoice.discount' | 'invoice.cancel'
  | 'payment.view' | 'payment.create' | 'payment.reverse'
  | 'receipt.view' | 'income.view'
  | 'expense.view' | 'expense.create' | 'expense.update'
  | 'finance.account.view' | 'finance.account.manage' | 'finance.transfer.create' | 'finance.profit.view'
  | 'supplier.view' | 'supplier.create' | 'supplier.update' | 'supplier.cost.view' | 'supplier.payment.manage'
  | 'task.view' | 'task.manage'
  | 'follow_up.view' | 'follow_up.manage'
  | 'appointment.view' | 'appointment.manage'
  | 'visa_decision.view' | 'visa_decision.manage'
  | 'staff.view' | 'staff.manage' | 'staff.permissions.manage'
  | 'reports.finance.view' | 'reports.visa.view' | 'reports.marketing.view' | 'reports.staff.view'
  | 'audit.view' | 'activity.view' | 'login_history.view'
  | 'settings.view' | 'settings.manage'
  | 'branch.view' | 'branch.manage'
  | 'customer_portal.access'
  | (string & {});

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Drives all real permission checks (see AuthContext.hasPermission) — mirrors the backend's
   *  own PermissionsGuard: an isSuperAdmin user always passes, regardless of role name or the
   *  `permissions` list below. */
  isSuperAdmin: boolean;
  avatar?: string;
  phone?: string;
  branch?: string;
  /** Effective permission keys for THIS user, as returned by `GET /auth/me` — role permissions
   *  merged with their personal grant/revoke overrides, already resolved server-side. */
  permissions: Permission[];
}

export type LeadStatus =
  | 'New Lead'
  | 'Contacted'
  | 'Interested'
  | 'Appointment'
  | 'Registered'
  | 'Not Interested'
  | 'Follow-up Later';

export type LeadSource =
  | 'Facebook'
  | 'TikTok'
  | 'Instagram'
  | 'Google'
  | 'Website'
  | 'WhatsApp'
  | 'Walk-in'
  | 'Referral'
  | 'Agent'
  | 'Other';

export interface Lead {
  id: string;
  leadId: string;
  name: string;
  phone: string;
  email?: string;
  country: string;
  visaType: string;
  source: LeadSource;
  assignedStaff: string;
  assignedStaffId?: string;
  status: LeadStatus;
  notes?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  customerId: string; // e.g. ARS-2026-00001
  name: string;
  passportNumber: string;
  nic?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  nationality?: string;
  address?: string;
  phone: string;
  whatsApp: string;
  email: string;
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  occupation?: string;
  monthlyIncome?: number;
  bankBalance?: number;
  applyingCountry?: string;
  visaCategory?: VisaCategory;
  travelPurpose?: string;
  previousVisaHistory?: string;
  previousRefusals?: string;
  assignedConsultant: string;
  assignedConsultantId?: string;
  leadSource?: LeadSource;
  notes?: string;
  activeCasesCount: number;
  status: 'Active' | 'Inactive' | 'Archived';
  createdAt: string;
}

export type VisaStatus =
  | 'New Case'
  | 'Document Collection'
  | 'Documents Pending'
  | 'Documents Completed'
  | 'Appointment Booked'
  | 'Ready for Submission'
  | 'Submitted'
  | 'Processing'
  | 'Additional Documents Requested'
  | 'Decision Received'
  | 'Approved'
  | 'Refused'
  | 'Closed';

export type VisaCategory = 'Tourist' | 'Student' | 'Work' | 'Business' | 'Sponsor' | 'e-Visa';

export interface VisaCase {
  id: string;
  caseId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  country: string;
  visaCategory: VisaCategory;
  visaType: string;
  consultant: string;
  consultantId?: string;
  status: VisaStatus;
  submissionDate?: string;
  appointmentDate?: string;
  decisionDate?: string;
  validityPeriod?: string;
  refusalReason?: string;
  notes?: string;
  createdAt: string;
}

export interface EVisaService {
  id: string;
  country: string;
  visaName: string;
  entryType: 'Single Entry' | 'Double Entry' | 'Multiple Entry';
  validity: string;
  stayPeriod: string;
  processingTime: string;
  customerSellingPrice: number;
  currency: string;
  status: 'Active' | 'Inactive';
  lastUpdated: string;
  // Guarded financial fields
  governmentFee?: number;
  supplierCost?: number;
  otherCost?: number;
  arsServiceCharge?: number;
  estimatedProfit?: number;
}

export type ServiceCategory = 'Visa Services' | 'Additional Services';

export interface MasterPriceItem {
  id: string;
  serviceName: string;
  category: ServiceCategory;
  subcategory?: string;
  sellingPrice: number;
  currency: string;
  status: 'Active' | 'Inactive';
  // Guarded fields
  costPrice?: number;
  serviceCharge?: number;
  profit?: number;
}

export interface PackageItem {
  id: string;
  packageId: string;
  packageName: string;
  country: string;
  visaType: string;
  servicesIncluded: string[];
  normalTotal: number;
  packagePrice: number;
  discount: number;
  finalPrice: number;
  status: 'Active' | 'Inactive';
  discountReason?: string;
  discountType?: 'percentage' | 'amount';
  discountValue?: number;
  authorizedBy?: string;
  // Guarded fields
  internalCost?: number;
  estimatedProfit?: number;
}

export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired' | 'Converted';

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  country: string;
  visaType: string;
  services: { serviceName: string; price: number }[];
  packageName?: string;
  subtotal: number;
  discount: number;
  total: number;
  validityDate: string;
  paymentTerms: string;
  termsAndConditions: string;
  status: QuotationStatus;
  createdAt: string;
}

export type InvoiceStatus = 'Unpaid' | 'Part Paid' | 'Paid' | 'Overdue' | 'Cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  caseId?: string;
  items: { description: string; amount: number }[];
  total: number;
  paid: number;
  balance: number;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
  consultant?: string;
  country?: string;
  branch?: string;
}

export type PaymentType = 'Full Payment' | 'Advance' | 'Part Payment' | 'Installment' | 'Balance Payment';
export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Card' | 'Online' | 'Other';

export interface Payment {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  date: string;
  type: PaymentType;
  method: PaymentMethod;
  receivedBy: string;
  account: string;
  bankReference?: string;
  proofUrl?: string;
  notes?: string;
  status: 'Completed' | 'Pending Verification' | 'Rejected';
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  paymentId: string;
  customerName: string;
  caseId?: string;
  country?: string;
  visaType?: string;
  amountReceived: number;
  paymentFor: string;
  paymentMethod: PaymentMethod;
  remainingBalance: number;
  date: string;
  receivedBy: string;
}

export interface Income {
  id: string;
  transactionId: string;
  date: string;
  customerName: string;
  caseId?: string;
  category: 
    | 'Visa Service Income'
    | 'e-Visa Income'
    | 'Student Service Income'
    | 'Work Visa Service Income'
    | 'Tourist Visa Income'
    | 'Consultation'
    | 'Document Service'
    | 'Translation'
    | 'Insurance Commission'
    | 'Air Ticket Commission'
    | 'Agent Commission'
    | 'Other Income';
  amount: number;
  paymentMethod: PaymentMethod;
  account: string;
  source: string;
}

export interface Expense {
  id: string;
  expenseId: string;
  category: 'Office' | 'Staff' | 'Marketing' | 'Visa Operations' | 'Transport' | 'Other';
  subcategory: string;
  description: string;
  supplier?: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  paidFrom: string;
  customerName?: string;
  caseId?: string;
  receiptUrl?: string;
  notes?: string;
}

export interface BankAccount {
  id: string;
  accountName: string;
  accountNumber?: string;
  bankName?: string;
  type: 'Cash' | 'Bank' | 'Card/Online';
  currentBalance: number;
  currency: string;
  lastUpdated: string;
}

export interface AccountTransfer {
  id: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  date: string;
  reference: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  supplierName: string;
  company: string;
  country: string;
  phone: string;
  whatsApp: string;
  services: string[];
  casesHandled: number;
  status: 'Active' | 'Inactive';
  // Guarded financial fields
  amountPaid?: number;
  amountPayable?: number;
}

export interface StaffMember {
  id: string;
  staffId: string;
  name: string;
  role: UserRole;
  branch: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
  joinedDate: string;
}

export interface StaffPerformance {
  staffId: string;
  name: string;
  leadsHandled: number;
  callsCount: number;
  whatsAppCount: number;
  registrations: number;
  appointments: number;
  visaCases: number;
  paymentsCollected: number;
  conversionRate: number; // percentage
  pendingFollowups: number;
}

export interface TaskItem {
  id: string;
  title: string;
  type: 'Call Customer' | 'Collect Documents' | 'Check Application' | 'Appointment' | 'Payment Collection' | 'Embassy Follow-up' | 'Agent Follow-up' | 'General';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'Overdue';
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: string;
  dueDate: string;
  customerName?: string;
  caseId?: string;
}

export interface AppointmentItem {
  id: string;
  title: string;
  customerName: string;
  phone?: string;
  type: 'Office Appointment' | 'Online Consultation' | 'VFS Appointment' | 'Embassy Appointment' | 'Biometrics' | 'Medical' | 'Interview';
  date: string;
  time: string;
  location?: string;
  consultant: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  notes?: string;
}

export interface DocumentItem {
  id: string;
  fileName: string;
  documentType: 
    | 'Passport'
    | 'NIC'
    | 'Birth Certificate'
    | 'Bank Statement'
    | 'Employment Letter'
    | 'Invitation Letter'
    | 'Cover Letter'
    | 'SOP'
    | 'Visa Application'
    | 'Insurance'
    | 'Hotel Booking'
    | 'Flight Reservation'
    | 'Refusal Letter'
    | 'Other';
  customerName: string;
  caseId?: string;
  status: 'Required' | 'Requested' | 'Received' | 'Verified' | 'Rejected' | 'Expired';
  uploadedDate?: string;
  uploadedBy?: string;
  verifiedBy?: string;
  fileUrl?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterParams {
  search?: string;
  status?: string;
  source?: string;
  category?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
