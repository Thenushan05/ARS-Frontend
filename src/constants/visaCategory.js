/**
 * §11 visa category list — shared between the Leads and Customers features
 * (a lead's "interested visa type" and a customer's "visa category" use
 * the same controlled vocabulary, matching Backend/src/constants/visaCategory.js
 * value-for-value). Lives here, not inside features/leads, now that
 * Customers needs it too.
 */
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
