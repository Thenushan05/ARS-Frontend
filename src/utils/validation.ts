import { z } from 'zod';

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

// Customer Registration Zod Schema
export const customerRegistrationSchema = z.object({
  name: z.string().min(2, { message: 'Customer full name is required (min 2 chars)' }),
  email: emailSchema,
  phone: phoneSchema,
  passportNumber: passportSchema,
  nic: z.string().min(10, { message: 'NIC Number is required (e.g. 199012345678 or 901234567V)' }),
  country: z.string().min(1, { message: 'Destination country is required' }),
  visaType: z.string().min(1, { message: 'Visa type is required' }),
});

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
