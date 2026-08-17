/**
 * Staff roles supported by the system (§6, §28).
 * The backend is the source of truth for a logged-in user's role and
 * permissions — this enum exists for display/labeling only (badges,
 * staff forms, filters), never as a basis for granting access.
 */
export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  MANAGING_DIRECTOR: 'managing_director',
  MANAGER: 'manager',
  VISA_CONSULTANT: 'visa_consultant',
  CUSTOMER_SERVICE: 'customer_service',
  ACCOUNTANT: 'accountant',
  MARKETING_STAFF: 'marketing_staff',
})

export const ROLE_LABELS = Object.freeze({
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.MANAGING_DIRECTOR]: 'Managing Director',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.VISA_CONSULTANT]: 'Visa Consultant',
  [ROLES.CUSTOMER_SERVICE]: 'Customer Service',
  [ROLES.ACCOUNTANT]: 'Accountant',
  [ROLES.MARKETING_STAFF]: 'Marketing Staff',
})

export const ROLE_OPTIONS = Object.values(ROLES).map((value) => ({
  value,
  label: ROLE_LABELS[value],
}))
