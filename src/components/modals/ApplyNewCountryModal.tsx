import React, { useState } from 'react';
import { Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import FormModal from './FormModal';
import { Customer, VisaCategory, VisaCase } from '../../types';

interface ApplyNewCountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onSuccess: (newCase: VisaCase) => void;
}

export const ApplyNewCountryModal: React.FC<ApplyNewCountryModalProps> = ({
  isOpen,
  onClose,
  customer,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    country: 'Canada',
    visaCategory: 'Tourist' as VisaCategory,
    travelPurpose: '',
    consultant: customer.assignedConsultant || 'Saman Jayasinghe',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countries = [
    'France',
    'United Kingdom',
    'Canada',
    'Australia',
    'United Arab Emirates',
    'Italy',
    'Germany',
    'United States',
    'Japan',
    'Singapore',
    'New Zealand',
    'Schengen Area (Other)'
  ];

  const visaCategories: VisaCategory[] = [
    'Tourist',
    'Student',
    'Work',
    'Business',
    'Sponsor',
    'e-Visa'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { visaCasesApi } = await import('../../api');
      const newCase = await visaCasesApi.create({
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        country: formData.country,
        visaCategory: formData.visaCategory,
        visaType: `${formData.country} ${formData.visaCategory} Visa`,
        consultant: formData.consultant,
        status: 'New Case',
        notes: formData.notes || `Multi-country application created for existing customer ${customer.customerId}.`
      });

      customer.activeCasesCount = (customer.activeCasesCount || 0) + 1;
      onSuccess(newCase);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create visa case.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply for Another Country — ${customer.name} (${customer.customerId})`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 flex items-center gap-3">
          <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
          <div>
            <p className="font-bold">Existing Customer Linked Application</p>
            <p className="text-[11px] opacity-80">
              Creates a New Visa Case under existing customer profile <strong>{customer.customerId}</strong> without creating duplicate records.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Applying Country</label>
          <select
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Visa Category</label>
          <select
            value={formData.visaCategory}
            onChange={(e) => setFormData(prev => ({ ...prev, visaCategory: e.target.value as VisaCategory }))}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            {visaCategories.map(vc => (
              <option key={vc} value={vc}>{vc}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Travel Purpose</label>
          <input
            type="text"
            value={formData.travelPurpose}
            onChange={(e) => setFormData(prev => ({ ...prev, travelPurpose: e.target.value }))}
            placeholder="e.g. Higher studies / Business meetings / Vacation"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Consultant</label>
          <select
            value={formData.consultant}
            onChange={(e) => setFormData(prev => ({ ...prev, consultant: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="Saman Jayasinghe">Saman Jayasinghe</option>
            <option value="Nimali Fernando">Nimali Fernando</option>
            <option value="Thenushan Sritharan">Thenushan Sritharan</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Special case notes..."
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/20 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Creating Case...' : 'Create Visa Case'}</span>
          </button>
        </div>
      </form>
    </FormModal>
  );
};

export default ApplyNewCountryModal;
