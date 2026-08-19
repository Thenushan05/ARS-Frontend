import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import FormModal from './FormModal';
import { useCreateCustomer } from '../../features/customers/hooks/useCustomersQueries';
import { useCountryOptions } from '../../hooks/useCountryOptions';
import { useStaffOptions } from '../../hooks/useStaffOptions';
import { GENDER, MARITAL_STATUS, VISA_CATEGORY, LEAD_SOURCE } from '../../utils/enumLabels';
import { customerFormSchema, CustomerFormValues, emptyCustomerFormValues, buildCustomerPayload } from '../../utils/validation';
import { normalizeApiError } from '../../api/errors';
import { ApiCustomer } from '../../types/api';

interface CustomerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: ApiCustomer) => void;
}

const inputClass =
  'w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50';

export const CustomerRegistrationModal: React.FC<CustomerRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const createCustomer = useCreateCustomer();
  const { options: countries, isLoading: countriesLoading, enabled: countriesEnabled } = useCountryOptions();
  const { options: staffOptions, isLoading: staffLoading, enabled: staffEnabled } = useStaffOptions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: emptyCustomerFormValues,
  });

  const handleClose = () => {
    reset(emptyCustomerFormValues);
    onClose();
  };

  const onSubmit = async (values: CustomerFormValues) => {
    try {
      const payload = buildCustomerPayload(values);
      const created = await createCustomer.mutateAsync(payload);
      onSuccess(created);
      reset(emptyCustomerFormValues);
      onClose();
    } catch (err) {
      const { message } = normalizeApiError(err);
      setError('root', { message });
    }
  };

  return (
    <FormModal isOpen={isOpen} onClose={handleClose} title="Customer Registration" maxWidth="4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Info Banner */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium uppercase tracking-wider">New Customer</p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">
              A unique customer code (e.g. ARS-2026-00001) is generated automatically once you submit. Only Full Name and Mobile Number are required.
            </p>
          </div>
        </div>

        {errors.root && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.root.message}</span>
          </div>
        )}

        {/* Section 1: Personal Information */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
            1. Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input type="text" placeholder="e.g. Dilshan Mendis" className={inputClass} {...register('fullName')} />
              {errors.fullName && <p className="text-[11px] text-rose-500 mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Passport Number</label>
              <input type="text" placeholder="e.g. N7894561" className={`${inputClass} font-mono`} {...register('passportNumber')} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">NIC Number</label>
              <input type="text" placeholder="e.g. 199212304567" className={inputClass} {...register('nic')} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
              <input type="date" className={inputClass} {...register('dob')} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              <select className={inputClass} {...register('gender')}>
                <option value="">— Select —</option>
                {GENDER.values.map((v) => (
                  <option key={v} value={v}>{GENDER.labels[v]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nationality</label>
              <input type="text" placeholder="Sri Lankan" className={inputClass} {...register('nationality')} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Marital Status</label>
              <select className={inputClass} {...register('maritalStatus')}>
                <option value="">— Select —</option>
                {MARITAL_STATUS.values.map((v) => (
                  <option key={v} value={v}>{MARITAL_STATUS.labels[v]}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Residential Address</label>
              <input type="text" placeholder="No. 45, Galle Road, Colombo 03" className={inputClass} {...register('address')} />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
            2. Contact Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input type="text" placeholder="+94 77 123 4567" className={inputClass} {...register('mobile')} />
              {errors.mobile && <p className="text-[11px] text-rose-500 mt-1">{errors.mobile.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Number</label>
              <input type="text" placeholder="+94 77 123 4567" className={inputClass} {...register('whatsapp')} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input type="email" placeholder="client@email.com" className={inputClass} {...register('email')} />
              {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Financial Background */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
            3. Financial & Employment Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Occupation / Business</label>
              <input type="text" placeholder="Software Engineer / Business Owner" className={inputClass} {...register('occupation')} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Income (LKR)</label>
              <input type="number" step="0.01" min="0" placeholder="350000" className={inputClass} {...register('monthlyIncome')} />
              {errors.monthlyIncome && <p className="text-[11px] text-rose-500 mt-1">{errors.monthlyIncome.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Balance (LKR)</label>
              <input type="number" step="0.01" min="0" placeholder="4500000" className={inputClass} {...register('bankBalance')} />
              {errors.bankBalance && <p className="text-[11px] text-rose-500 mt-1">{errors.bankBalance.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 4: Visa Application Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
            4. Applying Visa Case Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Applying Country</label>
              <select className={inputClass} disabled={!countriesEnabled} {...register('applyingCountryId')}>
                <option value="">
                  {countriesEnabled ? (countriesLoading ? 'Loading countries…' : '— Select country —') : 'No permission to view countries'}
                </option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Visa Category</label>
              <select className={inputClass} {...register('visaCategory')}>
                <option value="">— Select —</option>
                {VISA_CATEGORY.values.map((v) => (
                  <option key={v} value={v}>{VISA_CATEGORY.labels[v]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Travel Purpose</label>
              <input type="text" placeholder="Tourism / Higher Studies / Business Meeting" className={inputClass} {...register('travelPurpose')} />
            </div>

            <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" className="rounded" {...register('hasPreviousVisaHistory')} />
                  <span>Has previous visa history</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. UK 2024 (Valid), UAE 2023, Singapore 2022"
                  className={inputClass}
                  {...register('previousVisaHistoryNotes')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" className="rounded" {...register('hasPreviousRefusals')} />
                  <span>Has previous refusals</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Canada 2019 (Insufficient ties)"
                  className={inputClass}
                  {...register('previousRefusalNotes')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Assignment, Lead Source & Notes */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
            5. Staff Assignment & Source
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Consultant</label>
              <select className={inputClass} disabled={!staffEnabled} {...register('assignedConsultantId')}>
                <option value="">
                  {staffEnabled ? (staffLoading ? 'Loading staff…' : '— Unassigned —') : 'No permission to view staff'}
                </option>
                {staffOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Lead Source</label>
              <select className={inputClass} {...register('leadSource')}>
                <option value="">— Select —</option>
                {LEAD_SOURCE.values.map((v) => (
                  <option key={v} value={v}>{LEAD_SOURCE.labels[v]}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Additional Notes</label>
              <textarea
                rows={2}
                placeholder="Important client instructions or document requirements..."
                className={inputClass}
                {...register('notes')}
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Registering...' : 'Register Customer'}</span>
          </button>
        </div>
      </form>
    </FormModal>
  );
};

export default CustomerRegistrationModal;
