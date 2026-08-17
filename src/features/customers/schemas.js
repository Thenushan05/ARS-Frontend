import { z } from 'zod'
import { GENDER, MARITAL_STATUS } from './constants'
import { VISA_CATEGORY } from '@/constants/visaCategory'

// Client-side validation is a UX layer only — the backend re-validates
// everything with the equivalent shape in Backend/src/validators/customer.validators.js (§8).
export const customerFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  mobile: z.string().min(1, 'Mobile number is required'),
  whatsapp: z.string().optional(),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  passportNumber: z.string().optional(),
  nic: z.string().optional(),
  dob: z.string().optional(),
  gender: z.enum(Object.values(GENDER)).optional().or(z.literal('')),
  nationality: z.string().optional(),
  address: z.string().optional(),
  maritalStatus: z.enum(Object.values(MARITAL_STATUS)).optional().or(z.literal('')),
  occupation: z.string().optional(),
  monthlyIncome: z.union([z.coerce.number().nonnegative(), z.literal('')]).optional(),
  bankBalance: z.union([z.coerce.number().nonnegative(), z.literal('')]).optional(),
  applyingCountry: z.string().optional(),
  visaCategory: z.enum(Object.values(VISA_CATEGORY)).optional().or(z.literal('')),
  travelPurpose: z.string().optional(),
  previousVisaHistory: z.string().optional(),
  previousRefusals: z.string().optional(),
  assignedConsultant: z.object({ value: z.string(), label: z.string() }).nullable().optional(),
  branch: z.string().optional(),
  notes: z.string().optional(),
})
