/**
 * Backend enum value -> human display label, one map per Prisma enum this app touches (brief
 * §12/§13: keep the wire/type value machine-friendly, translate to a label only at render time).
 * Also exports the enum's value list (in backend-declaration order) for building <select> options,
 * so every dropdown across the app enumerates the SAME source of truth instead of four independent
 * hand-typed arrays (as the pre-integration Leads/Customers pages each had).
 *
 * Keep in sync with Backend `prisma/schema.prisma` enum blocks — see INTEGRATION_PLAN.md.
 */

function buildLabels<T extends string>(map: Record<T, string>): { values: T[]; labels: Record<T, string> } {
  return { values: Object.keys(map) as T[], labels: map };
}

export const LEAD_STATUS = buildLabels({
  NEW_LEAD: 'New Lead',
  CONTACTED: 'Contacted',
  INTERESTED: 'Interested',
  APPOINTMENT: 'Appointment',
  REGISTERED: 'Registered',
  NOT_INTERESTED: 'Not Interested',
  FOLLOW_UP_LATER: 'Follow-up Later',
});

export const LEAD_SOURCE = buildLabels({
  FACEBOOK: 'Facebook',
  TIKTOK: 'TikTok',
  INSTAGRAM: 'Instagram',
  GOOGLE: 'Google',
  WEBSITE: 'Website',
  WHATSAPP: 'WhatsApp',
  WALK_IN: 'Walk-in',
  REFERRAL: 'Referral',
  AGENT: 'Agent',
  OTHER: 'Other',
});

export const TASK_TYPE = buildLabels({
  CALL_CUSTOMER: 'Call Customer',
  COLLECT_DOCUMENTS: 'Collect Documents',
  CHECK_APPLICATION: 'Check Application',
  APPOINTMENT: 'Appointment',
  PAYMENT_COLLECTION: 'Payment Collection',
  EMBASSY_FOLLOW_UP: 'Embassy Follow-up',
  AGENT_FOLLOW_UP: 'Agent Follow-up',
  GENERAL: 'General',
});

export const TASK_PRIORITY = buildLabels({
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
});

export const TASK_STATUS = buildLabels({
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
});

export const APPOINTMENT_TYPE = buildLabels({
  OFFICE: 'Office',
  ONLINE_CONSULTATION: 'Online Consultation',
  VFS: 'VFS',
  EMBASSY: 'Embassy',
  BIOMETRICS: 'Biometrics',
  MEDICAL: 'Medical',
  INTERVIEW: 'Interview',
});

export const APPOINTMENT_STATUS = buildLabels({
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  RESCHEDULED: 'Rescheduled',
  NO_SHOW: 'No Show',
});

export const GENDER = buildLabels({
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
});

export const MARITAL_STATUS = buildLabels({
  SINGLE: 'Single',
  MARRIED: 'Married',
  DIVORCED: 'Divorced',
  WIDOWED: 'Widowed',
  OTHER: 'Other',
});

export const VISA_CATEGORY = buildLabels({
  TOURIST: 'Tourist',
  STUDENT: 'Student',
  WORK: 'Work',
  BUSINESS: 'Business',
  SPONSOR_FAMILY: 'Sponsor / Family',
  E_VISA: 'e-Visa',
  TRANSIT: 'Transit',
  OTHER: 'Other',
});

/** Fallback for any value not present in a specific map above (e.g. a future backend enum
 * addition this file hasn't been updated for yet) — never render a raw UPPER_SNAKE_CASE string. */
export function humanizeEnum(value: string): string {
  return value
    .trim()
    .replace(/_/g, ' ')
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ');
}
