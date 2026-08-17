import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormDialog } from '@/components/modals/FormDialog'
import { FormField } from '@/components/forms/FormField'
import { TextInput } from '@/components/forms/TextInput'
import { SelectInput } from '@/components/forms/SelectInput'
import { TextAreaInput } from '@/components/forms/TextAreaInput'
import { followUpFormSchema } from '../schemas'
import { FOLLOW_UP_METHOD_OPTIONS } from '../constants'

const EMPTY_VALUES = { method: '', notes: '', nextFollowUpDate: '' }

/** "Add Follow-up" — logs a call/WhatsApp/etc. contact against a lead and
 * optionally schedules the next one (updates the list's Follow-up Date
 * column and, for a brand-new lead, auto-advances it out of New Lead). */
export function AddFollowUpModal({ isOpen, onClose, onSubmit, isSubmitting, lead }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(followUpFormSchema), defaultValues: EMPTY_VALUES })

  useEffect(() => {
    if (isOpen) reset(EMPTY_VALUES)
  }, [isOpen, reset])

  function submit(values) {
    onSubmit({ ...values, nextFollowUpDate: values.nextFollowUpDate || undefined })
  }

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Follow-up — ${lead?.leadId ?? ''}`}
      onSubmit={handleSubmit(submit)}
      submitLabel="Save Follow-up"
      isSubmitting={isSubmitting}
    >
      <FormField label="Method" error={errors.method?.message} required>
        <SelectInput
          {...register('method')}
          options={FOLLOW_UP_METHOD_OPTIONS}
          placeholder="How was the lead contacted?"
          hasError={!!errors.method}
          autoFocus
        />
      </FormField>

      <FormField label="Notes" error={errors.notes?.message} required>
        <TextAreaInput {...register('notes')} hasError={!!errors.notes} placeholder="What was discussed / outcome..." />
      </FormField>

      <FormField label="Next Follow-up Date" error={errors.nextFollowUpDate?.message} hint="Leave blank if no further follow-up is needed yet.">
        <TextInput {...register('nextFollowUpDate')} type="date" />
      </FormField>
    </FormDialog>
  )
}
