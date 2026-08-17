import { STATUS_TONES } from '@/constants/statusColors'

/**
 * Wire-format values MUST match Backend/src/constants/leadEnums.js exactly
 * — lowercase snake_case, same convention as constants/roles.js.
 */
export const LEAD_STATUS = Object.freeze({
  NEW_LEAD: 'new_lead',
  CONTACTED: 'contacted',
  INTERESTED: 'interested',
  APPOINTMENT: 'appointment',
  REGISTERED: 'registered',
  NOT_INTERESTED: 'not_interested',
  FOLLOW_UP_LATER: 'follow_up_later',
})

export const LEAD_STATUS_LABELS = Object.freeze({
  [LEAD_STATUS.NEW_LEAD]: 'New Lead',
  [LEAD_STATUS.CONTACTED]: 'Contacted',
  [LEAD_STATUS.INTERESTED]: 'Interested',
  [LEAD_STATUS.APPOINTMENT]: 'Appointment',
  [LEAD_STATUS.REGISTERED]: 'Registered',
  [LEAD_STATUS.NOT_INTERESTED]: 'Not Interested',
  [LEAD_STATUS.FOLLOW_UP_LATER]: 'Follow-up Later',
})

// Kept local to the leads feature rather than added to the shared
// constants/statusColors.js STATUS_TONE_MAP — that map already uses the
// word "registered" for the visa-case flow (§12) with a different meaning
// (info, not success). Passing an explicit `tone` to <StatusBadge> avoids
// the collision instead of overloading one shared key two different ways.
export const LEAD_STATUS_TONE = Object.freeze({
  [LEAD_STATUS.NEW_LEAD]: STATUS_TONES.NEUTRAL,
  [LEAD_STATUS.CONTACTED]: STATUS_TONES.INFO,
  [LEAD_STATUS.INTERESTED]: STATUS_TONES.INFO,
  [LEAD_STATUS.APPOINTMENT]: STATUS_TONES.WARNING,
  [LEAD_STATUS.REGISTERED]: STATUS_TONES.SUCCESS,
  [LEAD_STATUS.NOT_INTERESTED]: STATUS_TONES.DANGER,
  [LEAD_STATUS.FOLLOW_UP_LATER]: STATUS_TONES.WARNING,
})

export const LEAD_STATUS_OPTIONS = Object.values(LEAD_STATUS).map((value) => ({
  value,
  label: LEAD_STATUS_LABELS[value],
}))

export const LEAD_SOURCE = Object.freeze({
  FACEBOOK: 'facebook',
  TIKTOK: 'tiktok',
  INSTAGRAM: 'instagram',
  GOOGLE: 'google',
  WEBSITE: 'website',
  WHATSAPP: 'whatsapp',
  WALK_IN: 'walk_in',
  REFERRAL: 'referral',
  AGENT: 'agent',
  OTHER: 'other',
})

export const LEAD_SOURCE_LABELS = Object.freeze({
  [LEAD_SOURCE.FACEBOOK]: 'Facebook',
  [LEAD_SOURCE.TIKTOK]: 'TikTok',
  [LEAD_SOURCE.INSTAGRAM]: 'Instagram',
  [LEAD_SOURCE.GOOGLE]: 'Google',
  [LEAD_SOURCE.WEBSITE]: 'Website',
  [LEAD_SOURCE.WHATSAPP]: 'WhatsApp',
  [LEAD_SOURCE.WALK_IN]: 'Walk-in',
  [LEAD_SOURCE.REFERRAL]: 'Referral',
  [LEAD_SOURCE.AGENT]: 'Agent',
  [LEAD_SOURCE.OTHER]: 'Other',
})

export const LEAD_SOURCE_OPTIONS = Object.values(LEAD_SOURCE).map((value) => ({
  value,
  label: LEAD_SOURCE_LABELS[value],
}))

// §11 visa category list — same controlled vocabulary the lead carries
// through to a real VisaCase once converted (Phase 3).
export const VISA_CATEGORY = Object.freeze({
  TOURIST: 'tourist_visa',
  STUDENT: 'student_visa',
  WORK: 'work_visa',
  BUSINESS: 'business_visa',
  SPONSOR_FAMILY: 'sponsor_family_visa',
  E_VISA: 'e_visa',
  TRANSIT: 'transit_visa',
  OTHER: 'other_visa',
})

export const VISA_CATEGORY_LABELS = Object.freeze({
  [VISA_CATEGORY.TOURIST]: 'Tourist Visa',
  [VISA_CATEGORY.STUDENT]: 'Student Visa',
  [VISA_CATEGORY.WORK]: 'Work Visa',
  [VISA_CATEGORY.BUSINESS]: 'Business Visa',
  [VISA_CATEGORY.SPONSOR_FAMILY]: 'Sponsor/Family Visa',
  [VISA_CATEGORY.E_VISA]: 'e-Visa',
  [VISA_CATEGORY.TRANSIT]: 'Transit Visa',
  [VISA_CATEGORY.OTHER]: 'Other Visa',
})

export const VISA_CATEGORY_OPTIONS = Object.values(VISA_CATEGORY).map((value) => ({
  value,
  label: VISA_CATEGORY_LABELS[value],
}))

export const FOLLOW_UP_METHOD = Object.freeze({
  CALL: 'call',
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
  SMS: 'sms',
  VISIT: 'visit',
  OTHER: 'other',
})

export const FOLLOW_UP_METHOD_LABELS = Object.freeze({
  [FOLLOW_UP_METHOD.CALL]: 'Phone Call',
  [FOLLOW_UP_METHOD.WHATSAPP]: 'WhatsApp',
  [FOLLOW_UP_METHOD.EMAIL]: 'Email',
  [FOLLOW_UP_METHOD.SMS]: 'SMS',
  [FOLLOW_UP_METHOD.VISIT]: 'Visit',
  [FOLLOW_UP_METHOD.OTHER]: 'Other',
})

export const FOLLOW_UP_METHOD_OPTIONS = Object.values(FOLLOW_UP_METHOD).map((value) => ({
  value,
  label: FOLLOW_UP_METHOD_LABELS[value],
}))
