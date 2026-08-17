import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormDialog } from '@/components/modals/FormDialog'
import { FormField } from '@/components/forms/FormField'
import { TextInput } from '@/components/forms/TextInput'
import { SelectInput } from '@/components/forms/SelectInput'
import { TextAreaInput } from '@/components/forms/TextAreaInput'
import { convertFormSchema } from '../schemas'
import { VISA_CATEGORY_OPTIONS, VISA_CATEGORY_LABELS } from '../constants'

/**
 * "Convert to Customer" — creates (or, if the mobile/email already matches
 * someone, links to) a real Customer record. Country/visa type default
 * from the lead's own fields but can be corrected here before converting.
 */
export function ConvertToCustomerModal({ isOpen, onClose, onSubmit, isSubmitting, lead }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(convertFormSchema), defaultValues: { applyingCountry: '', visaCategory: '', notes: '' } })

  useEffect(() => {
    if (isOpen && lead) {
      reset({
        applyingCountry: lead.interestedCountry ?? '',
        visaCategory: lead.interestedVisaType ?? '',
        notes: '',
      })
    }
  }, [isOpen, lead, reset])

  function submit(values) {
    onSubmit({
      applyingCountry: values.applyingCountry || undefined,
      visaCategory: values.visaCategory || undefined,
      notes: values.notes || undefined,
    })
  }

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Convert to Customer — ${lead?.leadId ?? ''}`}
      onSubmit={handleSubmit(submit)}
      submitLabel="Convert"
      isSubmitting={isSubmitting}
    >
      <p className="text-sm text-slate-600">
        This creates a customer record for <span className="font-medium text-slate-800">{lead?.name}</span> (or links to
        an existing one if the mobile/email already matches a customer) and marks this lead as Registered.
      </p>

      <FormField label="Applying Country" error={errors.applyingCountry?.message} hint="Defaults to the lead's interested country.">
        <TextInput {...register('applyingCountry')} placeholder="e.g. Canada" />
      </FormField>

      <FormField label="Visa Category" error={errors.visaCategory?.message} hint="Defaults to the lead's interested visa type.">
        <SelectInput {...register('visaCategory')} options={VISA_CATEGORY_OPTIONS} placeholder="Select visa category" />
      </FormField>

      <FormField label="Notes" error={errors.notes?.message}>
        <TextAreaInput {...register('notes')} placeholder="Optional notes to carry onto the customer record..." />
      </FormField>

      {lead?.interestedVisaType && (
        <p className="text-xs text-slate-400">
          Lead's original interest: {lead.interestedCountry || '—'} · {VISA_CATEGORY_LABELS[lead.interestedVisaType] ?? lead.interestedVisaType}
        </p>
      )}
    </FormDialog>
  )
}
