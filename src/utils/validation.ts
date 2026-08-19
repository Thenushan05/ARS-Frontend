import { z } from 'zod';
import {
  ApiCustomer,
  ApiGender,
  ApiLeadSource,
  ApiMaritalStatus,
  ApiVisaCategory,
  CreateCustomerInput,
} from '../types/api';

// 43. VALIDATION SCHEMAS USING ZOD

// 1. Email Validator
export const emailSchema = z.string().email({ message: 'Please enter a valid email address (e.g. name@company.com)' });

// 2. Phone Validator (Sri Lanka +94 format or 10-digit international)
export const phoneSchema = z.string().refine(
  (val) => /^(\+94\s?\d{2}\s?\d{3}\s?\d{4}|07\d{8}|\+\d{1,3}\d{9,10})$/.test(val.trim()),
  { message: 'Valid phone number required (e.g. +94 77 123 4567 or 0771234567)' }
);

// 3. Passport Validator
export const passportSchema = z.string().refine(
  (val) => /^[A-Z]{1,2}[0-9]{7,8}$/i.test(val.trim()),
  { message: 'Valid Passport Number required (e.g. N1234567 or PA987654)' }
);

// 4. Numeric Amount & Positive Payments
export const positiveAmountSchema = z.number({ invalid_type_error: 'Amount must be a number' })
  .positive({ message: 'Payment amount must be greater than 0' });

// 5. Valid Date Validator
export const dateSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Please select a valid date' }
);

// 6. File Type Validator (PDF, PNG, JPG)
export const fileTypeSchema = z.custom<File>((file) => {
  if (!(file instanceof File)) return false;
  const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  return allowed.includes(file.type);
}, { message: 'Only PDF, PNG, and JPG file formats are allowed' });

// 7. File Size Validator (Max 5MB)
export const fileSizeSchema = z.custom<File>((file) => {
  if (!(file instanceof File)) return false;
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  return file.size <= MAX_SIZE;
}, { message: 'File size must be less than 5 MB' });

// ---------------------------------------------------------------------------
// Customer Registration / Edit form (real `CreateCustomerDto`/`UpdateCustomerDto` contract —
// see Backend `src/modules/customers/dto/create-customer.dto.ts`). Only `fullName` and `mobile`
// are actually required server-side; every other field is optional. Shared by
// `CustomerRegistrationModal` and `EditCustomerModal` so both forms validate identically.
// ---------------------------------------------------------------------------

/** Every field is the raw string/boolean an <input>/<select>/<checkbox> can hold — converted to
 * the real `CreateCustomerInput`/`UpdateCustomerInput` wire shape only at submit time, by
 * `buildCustomerPayload` below (never sent as empty strings). */
export const customerFormSchema = z.object({
  fullName: z.string().trim().min(1, { message: 'Full name is required' }),
  mobile: z.string().trim().min(1, { message: 'Mobile number is required' }),
  whatsapp: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: 'Please enter a valid email address',
    }),
  passportNumber: z.string().optional(),
  nic: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  maritalStatus: z.string().optional(),
  occupation: z.string().optional(),
  monthlyIncome: z
    .string()
    .optional()
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
      message: 'Must be a number 0 or greater',
    }),
  bankBalance: z
    .string()
    .optional()
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
      message: 'Must be a number 0 or greater',
    }),
  applyingCountryId: z.string().optional(),
  visaCategory: z.string().optional(),
  travelPurpose: z.string().optional(),
  hasPreviousVisaHistory: z.boolean().optional(),
  previousVisaHistoryNotes: z.string().optional(),
  hasPreviousRefusals: z.boolean().optional(),
  previousRefusalNotes: z.string().optional(),
  assignedConsultantId: z.string().optional(),
  leadSource: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const emptyCustomerFormValues: CustomerFormValues = {
  fullName: '',
  mobile: '',
  whatsapp: '',
  email: '',
  passportNumber: '',
  nic: '',
  dob: '',
  gender: '',
  nationality: '',
  address: '',
  maritalStatus: '',
  occupation: '',
  monthlyIncome: '',
  bankBalance: '',
  applyingCountryId: '',
  visaCategory: '',
  travelPurpose: '',
  hasPreviousVisaHistory: false,
  previousVisaHistoryNotes: '',
  hasPreviousRefusals: false,
  previousRefusalNotes: '',
  assignedConsultantId: '',
  leadSource: '',
  notes: '',
};

/** Prefills the Edit form from a real `ApiCustomer` record — null relation ids/enum values
 * collapse to '' (the "— Select —" option), and numbers become strings for the <input>s. */
export function customerToFormValues(customer: ApiCustomer): CustomerFormValues {
  return {
    fullName: customer.fullName,
    mobile: customer.mobile,
    whatsapp: customer.whatsapp ?? '',
    email: customer.email ?? '',
    passportNumber: customer.passportNumber ?? '',
    nic: customer.nic ?? '',
    dob: customer.dob ? customer.dob.slice(0, 10) : '',
    gender: customer.gender ?? '',
    nationality: customer.nationality ?? '',
    address: customer.address ?? '',
    maritalStatus: customer.maritalStatus ?? '',
    occupation: customer.occupation ?? '',
    monthlyIncome: customer.monthlyIncome != null ? String(customer.monthlyIncome) : '',
    bankBalance: customer.bankBalance != null ? String(customer.bankBalance) : '',
    applyingCountryId: customer.applyingCountryId ?? '',
    visaCategory: customer.visaCategory ?? '',
    travelPurpose: customer.travelPurpose ?? '',
    hasPreviousVisaHistory: customer.hasPreviousVisaHistory,
    previousVisaHistoryNotes: customer.previousVisaHistoryNotes ?? '',
    hasPreviousRefusals: customer.hasPreviousRefusals,
    previousRefusalNotes: customer.previousRefusalNotes ?? '',
    assignedConsultantId: customer.assignedConsultantId ?? '',
    leadSource: customer.leadSource ?? '',
    notes: customer.notes ?? '',
  };
}

/** Converts validated form values into the exact `CreateCustomerInput`/`UpdateCustomerInput` wire
 * shape — empty strings become `undefined` (never sent as `""`), and monthlyIncome/bankBalance
 * become real numbers, never currency-formatted strings (brief: these are plain `number` fields
 * on the wire). `UpdateCustomerInput` is `Partial<CreateCustomerInput>`, so this same return value
 * is valid for both create and update calls. */
export function buildCustomerPayload(values: CustomerFormValues): CreateCustomerInput {
  const str = (v?: string): string | undefined => (v && v.trim() ? v.trim() : undefined);
  const num = (v?: string): number | undefined => (v && v.trim() ? Number(v) : undefined);

  return {
    fullName: values.fullName.trim(),
    mobile: values.mobile.trim(),
    whatsapp: str(values.whatsapp),
    email: str(values.email),
    passportNumber: str(values.passportNumber),
    nic: str(values.nic),
    dob: str(values.dob),
    gender: str(values.gender) as ApiGender | undefined,
    nationality: str(values.nationality),
    address: str(values.address),
    maritalStatus: str(values.maritalStatus) as ApiMaritalStatus | undefined,
    occupation: str(values.occupation),
    monthlyIncome: num(values.monthlyIncome),
    bankBalance: num(values.bankBalance),
    applyingCountryId: str(values.applyingCountryId),
    visaCategory: str(values.visaCategory) as ApiVisaCategory | undefined,
    travelPurpose: str(values.travelPurpose),
    hasPreviousVisaHistory: values.hasPreviousVisaHistory,
    previousVisaHistoryNotes: str(values.previousVisaHistoryNotes),
    hasPreviousRefusals: values.hasPreviousRefusals,
    previousRefusalNotes: str(values.previousRefusalNotes),
    assignedConsultantId: str(values.assignedConsultantId),
    leadSource: str(values.leadSource) as ApiLeadSource | undefined,
    notes: str(values.notes),
  };
}

// Expense Entry Zod Schema
export const expenseEntrySchema = z.object({
  category: z.string().min(1, { message: 'Expense category is required' }),
  subcategory: z.string().min(1, { message: 'Expense subcategory is required' }),
  description: z.string().min(3, { message: 'Description is required' }),
  amount: positiveAmountSchema,
  date: dateSchema,
  paymentMethod: z.string().min(1, { message: 'Payment method is required' }),
});

// Payment Entry Zod Schema
export const paymentEntrySchema = z.object({
  invoiceId: z.string().min(1, { message: 'Invoice ID is required' }),
  amount: positiveAmountSchema,
  paymentMethod: z.string().min(1, { message: 'Payment method is required' }),
  date: dateSchema,
});
