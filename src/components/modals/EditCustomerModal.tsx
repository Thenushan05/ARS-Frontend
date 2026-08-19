import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import FormModal from './FormModal';
import { useUpdateCustomer } from '../../features/customers/hooks/useCustomersQueries';
import { useCountryOptions } from '../../hooks/useCountryOptions';
import { useStaffOptions } from '../../hooks/useStaffOptions';
import { GENDER, MARITAL_STATUS, VISA_CATEGORY, LEAD_SOURCE } from '../../utils/enumLabels';
import {
  customerFormSchema,
  CustomerFormValues,
  customerToFormValues,
  buildCustomerPayload,
} from '../../utils/validation';
import { normalizeApiError } from '../../api/errors';
import { ApiCustomer } from '../../types/api';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: ApiCustomer;
  onSuccess: (updatedCustomer: ApiCustomer) => void;
}

const inputClass =
  'w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50';

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ isOpen, onClose, customer, onSuccess }) => {
  const updateCustomer = useUpdateCustomer();
  const { options: countries, isLoading: countriesLoading, enabled: countriesEnabled } = useCountryOptions();
  const { options: staffOptions, isLoading: staffLoading, enabled: staffEnabled } = useStaffOptions();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customerToFormValues(customer),
  });

  const onSubmit = async (values: CustomerFormValues) => {
    try {
      const payload = buildCustomerPayload(values);
      const updated = await updateCustomer.mutateAsync({ id: customer.id, input: payload });
      onSuccess(updated);
      onClose();
    } catch (err) {
      const { message } = normalizeApiError(err);
      setError('root', { message });
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Customer Details — ${customer.fullName} (${customer.customerCode})`}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Alert */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-100">Editing Customer Profile: {customer.customerCode}</p>
              <p className="text-blue-600 dark:text-blue-300">Only Full Name and Mobile Number are required — every other field is optional.</p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
            {customer.customerCode}
          </span>
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
              <input type="text" className={inputClass} {...register('fullName')} />
              {errors.fullName && <p className="text-[11px] text-rose-500 mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Passport Number</label>
              <input type="text" className={`${inputClass} font-mono`} {...register('passportNumber')} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">NIC Number</label>
              <input type="text" className={inputClass} {...register('nic')} />
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
              <input type="text" className={inputClass} {...register('nationality')} />
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
              <input type="text" className={inputClass} {...register('address')} />
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
              <input type="text" className={inputClass} {...register('mobile')} />
              {errors.mobile && <p className="text-[11px] text-rose-500 mt-1">{errors.mobile.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Number</label>
              <input type="text" className={inputClass} {...register('whatsapp')} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input type="email" className={inputClass} {...register('email')} />
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
              <input type="text" className={inputClass} {...register('occupation')} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Income (LKR)</label>
              <input type="number" step="0.01" min="0" className={inputClass} {...register('monthlyIncome')} />
              {errors.monthlyIncome && <p className="text-[11px] text-rose-500 mt-1">{errors.monthlyIncome.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Balance (LKR)</label>
              <input type="number" step="0.01" min="0" className={inputClass} {...register('bankBalance')} />
              {errors.bankBalance && <p className="text-[11px] text-rose-500 mt-1">{errors.bankBalance.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 4: Visa Case & History */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
            4. Applying Visa Case & Travel History
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
              <input type="text" className={inputClass} {...register('travelPurpose')} />
            </div>

            <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" className="rounded" {...register('hasPreviousVisaHistory')} />
                  <span>Has previous visa history</span>
                </label>
                <textarea rows={2} className={inputClass} {...register('previousVisaHistoryNotes')} />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input type="checkbox" className="rounded" {...register('hasPreviousRefusals')} />
                  <span>Has previous refusals</span>
                </label>
                <textarea rows={2} className={inputClass} {...register('previousRefusalNotes')} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Staff Assignment & Lead Source */}
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
              <textarea rows={2} className={inputClass} {...register('notes')} />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
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
            <span>{isSubmitting ? 'Saving Changes...' : 'Update Customer Profile'}</span>
          </button>
        </div>
      </form>
    </FormModal>
  );
};

export default EditCustomerModal;
