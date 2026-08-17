import { STATUS_TONES } from '@/constants/statusColors'

export { VISA_CATEGORY, VISA_CATEGORY_LABELS, VISA_CATEGORY_OPTIONS } from '@/constants/visaCategory'

// Wire-format values MUST match Backend/src/constants/customerEnums.js exactly.
export const CUSTOMER_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
})

export const CUSTOMER_STATUS_LABELS = Object.freeze({
  [CUSTOMER_STATUS.ACTIVE]: 'Active',
  [CUSTOMER_STATUS.ARCHIVED]: 'Archived',
})

export const CUSTOMER_STATUS_TONE = Object.freeze({
  [CUSTOMER_STATUS.ACTIVE]: STATUS_TONES.SUCCESS,
  [CUSTOMER_STATUS.ARCHIVED]: STATUS_TONES.NEUTRAL,
})

export const CUSTOMER_STATUS_OPTIONS = Object.values(CUSTOMER_STATUS).map((value) => ({
  value,
  label: CUSTOMER_STATUS_LABELS[value],
}))

export const GENDER = Object.freeze({ MALE: 'male', FEMALE: 'female', OTHER: 'other' })

export const GENDER_LABELS = Object.freeze({
  [GENDER.MALE]: 'Male',
  [GENDER.FEMALE]: 'Female',
  [GENDER.OTHER]: 'Other',
})

export const GENDER_OPTIONS = Object.values(GENDER).map((value) => ({ value, label: GENDER_LABELS[value] }))

export const MARITAL_STATUS = Object.freeze({
  SINGLE: 'single',
  MARRIED: 'married',
  DIVORCED: 'divorced',
  WIDOWED: 'widowed',
  OTHER: 'other',
})

export const MARITAL_STATUS_LABELS = Object.freeze({
  [MARITAL_STATUS.SINGLE]: 'Single',
  [MARITAL_STATUS.MARRIED]: 'Married',
  [MARITAL_STATUS.DIVORCED]: 'Divorced',
  [MARITAL_STATUS.WIDOWED]: 'Widowed',
  [MARITAL_STATUS.OTHER]: 'Other',
})

export const MARITAL_STATUS_OPTIONS = Object.values(MARITAL_STATUS).map((value) => ({
  value,
  label: MARITAL_STATUS_LABELS[value],
}))
