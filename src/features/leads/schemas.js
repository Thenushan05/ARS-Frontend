import { z } from 'zod'
import { LEAD_SOURCE, LEAD_STATUS, VISA_CATEGORY, FOLLOW_UP_METHOD } from './constants'

// Client-side validation is a UX layer only — the backend re-validates
// everything with the equivalent shape in Backend/src/validators/lead.validators.js (§8).
export const leadFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(1, 'Mobile number is required'),
  whatsapp: z.string().optional(),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  interestedCountry: z.string().optional(),
  interestedVisaType: z.enum(Object.values(VISA_CATEGORY)).optional().or(z.literal('')),
  leadSource: z.enum(Object.values(LEAD_SOURCE), { message: 'Select a lead source' }),
  assignedStaff: z.object({ value: z.string(), label: z.string() }).nullable().optional(),
  status: z.enum(Object.values(LEAD_STATUS)).optional(),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
})

export const followUpFormSchema = z.object({
  method: z.enum(Object.values(FOLLOW_UP_METHOD), { message: 'Select a method' }),
  notes: z.string().min(1, 'Notes are required'),
  nextFollowUpDate: z.string().optional(),
})

export const convertFormSchema = z.object({
  applyingCountry: z.string().optional(),
  visaCategory: z.enum(Object.values(VISA_CATEGORY)).optional().or(z.literal('')),
  notes: z.string().optional(),
})
