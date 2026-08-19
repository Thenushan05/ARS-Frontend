/**
 * Backend-accurate types for entities that have been wired to the real API (Phase 2: Dashboard,
 * Leads, Customers, Tasks, Appointments — see INTEGRATION_PLAN.md).
 *
 * Deliberately a SEPARATE file/namespace from `types/index.ts`, not a reshape of its existing
 * `Lead`/`Customer`/`TaskItem`/`AppointmentItem` types in place. Those old types (and their
 * Title-Case `LeadStatus`/`LeadSource`/`VisaCategory` unions) are still load-bearing for ~20 other
 * pages that remain on mock data (Invoices, Payments, Quotations, Pricing, Reports, VisaCases,
 * e-Visa, ...) — reshaping them now would cascade-break every one of those unrelated, not-yet-
 * integrated modules. As each subsequent phase lands and a legacy type's last consumer is gone,
 * fold its `Api*` replacement here back into `types/index.ts` under the plain name and delete the
 * old one — tracked in INTEGRATION_PLAN.md's checklist, not done in one big pass.
 *
 * Field names/types/enum values here are taken directly from the backend DTOs and Prisma schema
 * (`prisma/schema.prisma`), not invented — see Backend `src/modules/{leads,customers,tasks,
 * appointments,dashboard}/**`.
 */

// ---------------------------------------------------------------------------
// Shared nested "summary" shapes — what a relation actually resolves to on the
// wire, per each module's Prisma `include` (see INTEGRATION_PLAN.md's backend audit).
// ---------------------------------------------------------------------------

export interface ApiStaffSummary {
  id: string;
  fullName: string;
  email: string;
}

export interface ApiCustomerSummary {
  id: string;
  customerCode: string;
  fullName: string;
}

export interface ApiLeadSummary {
  id: string;
  leadCode: string;
  fullName: string;
}

export interface ApiCountry {
  id: string;
  name: string;
  iso2: string | null;
  iso3: string | null;
  isActive: boolean;
}

export interface ApiBranch {
  id: string;
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Enums (Prisma schema, verbatim values)
// ---------------------------------------------------------------------------

export type ApiLeadStatus =
  | 'NEW_LEAD' | 'CONTACTED' | 'INTERESTED' | 'APPOINTMENT' | 'REGISTERED'
  | 'NOT_INTERESTED' | 'FOLLOW_UP_LATER';

export type ApiLeadSource =
  | 'FACEBOOK' | 'TIKTOK' | 'INSTAGRAM' | 'GOOGLE' | 'WEBSITE' | 'WHATSAPP'
  | 'WALK_IN' | 'REFERRAL' | 'AGENT' | 'OTHER';

export type ApiGender = 'MALE' | 'FEMALE' | 'OTHER';

export type ApiMaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'OTHER';

export type ApiVisaCategory =
  | 'TOURIST' | 'STUDENT' | 'WORK' | 'BUSINESS' | 'SPONSOR_FAMILY' | 'E_VISA' | 'TRANSIT' | 'OTHER';

export type ApiTaskType =
  | 'CALL_CUSTOMER' | 'COLLECT_DOCUMENTS' | 'CHECK_APPLICATION' | 'APPOINTMENT'
  | 'PAYMENT_COLLECTION' | 'EMBASSY_FOLLOW_UP' | 'AGENT_FOLLOW_UP' | 'GENERAL';

export type ApiTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ApiTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';

export type ApiAppointmentType =
  | 'OFFICE' | 'ONLINE_CONSULTATION' | 'VFS' | 'EMBASSY' | 'BIOMETRICS' | 'MEDICAL' | 'INTERVIEW';

export type ApiAppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';

// ---------------------------------------------------------------------------
// Lead
// ---------------------------------------------------------------------------

export interface ApiLead {
  id: string;
  leadCode: string;
  fullName: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  interestedCountryId: string | null;
  interestedCountry: ApiCountry | null;
  interestedVisaType: string | null;
  inquiry: string | null;
  source: ApiLeadSource;
  assignedStaffId: string | null;
  assignedStaff: ApiStaffSummary | null;
  status: ApiLeadStatus;
  nextFollowUpAt: string | null;
  notes: string | null;
  convertedCustomerId: string | null;
  convertedCustomer: ApiCustomerSummary | null;
  branchId: string | null;
  branch: ApiBranch | null;
  isArchived: boolean;
  createdById: string | null;
  createdBy: ApiStaffSummary | null;
  createdAt: string;
  updatedAt: string;
}

/** `POST /leads` body — matches `CreateLeadDto` exactly. */
export interface CreateLeadInput {
  fullName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  interestedCountryId?: string;
  interestedVisaType?: string;
  inquiry?: string;
  source: ApiLeadSource;
  assignedStaffId?: string;
  nextFollowUpAt?: string;
  notes?: string;
  branchId?: string;
}

/** `PATCH /leads/:id` body — `UpdateLeadDto` (all CreateLeadInput fields optional, plus status). */
export type UpdateLeadInput = Partial<CreateLeadInput> & { status?: ApiLeadStatus };

export interface LeadFilters {
  search?: string;
  status?: ApiLeadStatus;
  source?: ApiLeadSource;
  assignedStaffId?: string;
  branchId?: string;
  page?: number;
  limit?: number;
}

/** `POST /leads/:id/convert` body — `ConvertLeadDto` = CreateCustomerInput minus the fields the
 * backend copies over from the Lead itself (fullName/mobile/whatsapp/email/applyingCountryId/
 * leadSource/branchId) — see Backend `ConvertLeadDto`. Every remaining field stays optional. */
export type ConvertLeadInput = Omit<
  CreateCustomerInput,
  'fullName' | 'mobile' | 'whatsapp' | 'email' | 'applyingCountryId' | 'leadSource' | 'branchId'
>;

/** `POST /leads/:id/convert` response shape — `{ lead, customer }`, never a bare Customer and
 * never a VisaCase (conversion does not create a case). */
export interface ConvertLeadResult {
  lead: ApiLead;
  customer: ApiCustomer;
}

// ---------------------------------------------------------------------------
// Customer
// ---------------------------------------------------------------------------

export interface ApiCustomer {
  id: string;
  customerCode: string;
  fullName: string;
  passportNumber: string | null;
  nic: string | null;
  dob: string | null;
  gender: ApiGender | null;
  nationality: string | null;
  address: string | null;
  mobile: string;
  whatsapp: string | null;
  email: string | null;
  maritalStatus: ApiMaritalStatus | null;
  occupation: string | null;
  monthlyIncome: number | null;
  bankBalance: number | null;
  applyingCountryId: string | null;
  applyingCountry: ApiCountry | null;
  visaCategory: ApiVisaCategory | null;
  travelPurpose: string | null;
  hasPreviousVisaHistory: boolean;
  previousVisaHistoryNotes: string | null;
  hasPreviousRefusals: boolean;
  previousRefusalNotes: string | null;
  assignedConsultantId: string | null;
  assignedConsultant: ApiStaffSummary | null;
  leadSource: ApiLeadSource | null;
  branchId: string | null;
  branch: ApiBranch | null;
  notes: string | null;
  isArchived: boolean;
  createdById: string | null;
  createdBy: ApiStaffSummary | null;
  createdAt: string;
  updatedAt: string;
}

/** `POST /customers` body — matches `CreateCustomerDto` exactly (field order/names/optionality). */
export interface CreateCustomerInput {
  fullName: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  passportNumber?: string;
  nic?: string;
  dob?: string;
  gender?: ApiGender;
  nationality?: string;
  address?: string;
  maritalStatus?: ApiMaritalStatus;
  occupation?: string;
  monthlyIncome?: number;
  bankBalance?: number;
  applyingCountryId?: string;
  visaCategory?: ApiVisaCategory;
  travelPurpose?: string;
  hasPreviousVisaHistory?: boolean;
  previousVisaHistoryNotes?: string;
  hasPreviousRefusals?: boolean;
  previousRefusalNotes?: string;
  assignedConsultantId?: string;
  leadSource?: ApiLeadSource;
  branchId?: string;
  notes?: string;
}

/** `PATCH /customers/:id` body — `UpdateCustomerDto` (every field optional, no additions). */
export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export interface CustomerFilters {
  search?: string;
  branchId?: string;
  assignedConsultantId?: string;
  applyingCountryId?: string;
  visaCategory?: ApiVisaCategory;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Task
// ---------------------------------------------------------------------------

export interface ApiTask {
  id: string;
  title: string;
  type: ApiTaskType;
  description: string | null;
  leadId: string | null;
  lead: ApiLeadSummary | null;
  customerId: string | null;
  customer: ApiCustomerSummary | null;
  /** Raw scalar only — Task's Prisma `include` does NOT resolve a nested case object (see
   * INTEGRATION_PLAN.md backend audit). Fetch the case separately if details are needed. */
  caseId: string | null;
  assignedToId: string | null;
  assignedTo: ApiStaffSummary | null;
  createdById: string | null;
  priority: ApiTaskPriority;
  dueDate: string | null;
  dueTime: string | null;
  status: ApiTaskStatus;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** `POST /tasks` body — matches `CreateTaskDto` exactly. */
export interface CreateTaskInput {
  title: string;
  type: ApiTaskType;
  description?: string;
  leadId?: string;
  customerId?: string;
  caseId?: string;
  assignedToId?: string;
  priority?: ApiTaskPriority;
  dueDate?: string;
  /** Free-form 'HH:mm'-style string — no format validation on the backend. */
  dueTime?: string;
  notes?: string;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface TaskFilters {
  status?: ApiTaskStatus;
  type?: ApiTaskType;
  priority?: ApiTaskPriority;
  assignedToId?: string;
  leadId?: string;
  customerId?: string;
  caseId?: string;
  dueBefore?: string;
  page?: number;
  limit?: number;
  // NOTE: `search` is accepted by the backend's TaskQueryDto but silently ignored server-side
  // (no text-search branch in TasksService.findAll) — don't wire a search box to this param.
}

// ---------------------------------------------------------------------------
// Appointment
// ---------------------------------------------------------------------------

export interface ApiAppointment {
  id: string;
  customerId: string | null;
  customer: ApiCustomerSummary | null;
  /** Raw scalar only — same gap as Task.caseId, no nested case object resolved. */
  caseId: string | null;
  type: ApiAppointmentType;
  scheduledAt: string;
  location: string | null;
  assignedStaffId: string | null;
  assignedStaff: ApiStaffSummary | null;
  notes: string | null;
  status: ApiAppointmentStatus;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

/** `POST /appointments` body — matches `CreateAppointmentDto` exactly. */
export interface CreateAppointmentInput {
  customerId?: string;
  caseId?: string;
  type: ApiAppointmentType;
  scheduledAt: string;
  location?: string;
  assignedStaffId?: string;
  notes?: string;
}

/** `PATCH /appointments/:id` body. NOTE: if `scheduledAt` changes, the backend silently flips
 * `status` to RESCHEDULED server-side even if `status` isn't sent — don't also set a manual
 * status alongside a scheduledAt change unless that's genuinely intended. */
export type UpdateAppointmentInput = Partial<CreateAppointmentInput>;

export interface AppointmentFilters {
  status?: ApiAppointmentStatus;
  type?: ApiAppointmentType;
  assignedStaffId?: string;
  customerId?: string;
  caseId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  // NOTE: `search` is accepted by AppointmentQueryDto but unused server-side, same as Tasks.
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface DashboardFilters {
  fromDate?: string;
  toDate?: string;
  preset?: 'today' | 'week' | 'month' | 'year' | 'custom';
  branchId?: string;
}

export interface ApiDashboardResponse {
  range: { from: string; to: string };
  customer: {
    totalCustomers: number;
    newInquiries: number;
    newRegistrations: number;
    activeCases: number;
    documentsPending: number;
    applicationsSubmitted: number;
    decisionsPending: number;
    visasApproved: number;
    visasRefused: number;
  };
  followUp: {
    todayCalls: number;
    todayWhatsapp: number;
    appointmentsToday: number;
    missingDocumentReminders: number;
    overdueCases: number;
  };
  /** Present ONLY when the caller holds `dashboard.finance.view` — key is absent (not null) for
   * everyone else. Always check `'finance' in data` / `data.finance !== undefined`, not truthiness
   * of a nested field. */
  finance?: {
    todayIncome: number;
    todayExpense: number;
    todayProfit: number;
    monthIncome: number;
    monthExpense: number;
    netProfitMonth: number;
    customerOutstanding: number;
    agentPayable: number;
    upcomingPaymentsCount: number;
    upcomingPaymentsAmount: number;
  };
}
