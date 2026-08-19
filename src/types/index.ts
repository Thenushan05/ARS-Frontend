export type UserRole = 
  | 'Super Admin'
  | 'Managing Director'
  | 'Manager'
  | 'Visa Consultant'
  | 'Customer Service'
  | 'Accountant'
  | 'Marketing Staff'
  | 'Customer';

export type Permission =
  | 'lead.view' | 'lead.create' | 'lead.edit' | 'lead.delete' | 'lead.convert'
  | 'customer.view' | 'customer.create' | 'customer.edit' | 'customer.delete'
  | 'visa.view' | 'visa.create' | 'visa.update' | 'visa.delete'
  | 'evisa.view' | 'evisa.manage'
  | 'quotation.view' | 'quotation.create' | 'quotation.edit'
  | 'invoice.view' | 'invoice.create' | 'invoice.edit'
  | 'payment.view' | 'payment.create' | 'payment.receipt'
  | 'pricing.view' | 'pricing.cost.view' | 'pricing.edit'
  | 'package.view' | 'package.create' | 'package.discount'
  | 'supplier.view' | 'supplier.create' | 'supplier.cost.view'
  | 'finance.income.view' | 'finance.expense.view' | 'finance.profit.view' | 'finance.banking.view'
  | 'staff.manage' | 'staff.performance'
  | 'reports.view' | 'reports.export'
  | 'settings.manage';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  branch?: string;
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
  applicationLink?: string;
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
