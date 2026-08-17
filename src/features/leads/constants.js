import { STATUS_TONES } from '@/constants/statusColors'

// Re-exported so existing `from '../constants'` imports in this feature's
// components keep working unchanged now that Customers needs the same
// vocabulary too and it moved to a shared location.
export { VISA_CATEGORY, VISA_CATEGORY_LABELS, VISA_CATEGORY_OPTIONS } from '@/constants/visaCategory'

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
