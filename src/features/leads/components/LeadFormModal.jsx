import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormDialog } from '@/components/modals/FormDialog'
import { FormField } from '@/components/forms/FormField'
import { TextInput } from '@/components/forms/TextInput'
import { SelectInput } from '@/components/forms/SelectInput'
import { TextAreaInput } from '@/components/forms/TextAreaInput'
import { StaffSelector } from '@/components/common/StaffSelector'
import { leadFormSchema } from '../schemas'
import { LEAD_SOURCE_OPTIONS, VISA_CATEGORY_OPTIONS, LEAD_STATUS, LEAD_STATUS_OPTIONS } from '../constants'

// REGISTERED only ever happens via "Convert to Customer" (it creates the
// linked Customer record) — never offered as a plain status option here,
// mirroring the backend's own guard in lead.service.js.
const EDITABLE_STATUS_OPTIONS = LEAD_STATUS_OPTIONS.filter((option) => option.value !== LEAD_STATUS.REGISTERED)

const EMPTY_VALUES = {
  name: '',
  mobile: '',
  whatsapp: '',
  email: '',
  interestedCountry: '',
  interestedVisaType: '',
  leadSource: '',
  assignedStaff: null,
  status: LEAD_STATUS.NEW_LEAD,
  followUpDate: '',
  notes: '',
}

function toDateInputValue(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

/**
 * Shared "Add Lead" / "Edit Lead" form. `mode` picks which title/submit
 * label to show and whether the Status field is offered at all.
 */
export function LeadFormModal({ isOpen, onClose, onSubmit, isSubmitting, mode = 'add', lead }) {
  const isEdit = mode === 'edit'

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(leadFormSchema), defaultValues: EMPTY_VALUES })

  useEffect(() => {
    if (!isOpen) return
    if (isEdit && lead) {
      reset({
        name: lead.name,
        mobile: lead.mobile,
        whatsapp: lead.whatsapp ?? '',
        email: lead.email ?? '',
        interestedCountry: lead.interestedCountry ?? '',
        interestedVisaType: lead.interestedVisaType ?? '',
        leadSource: lead.leadSource,
        assignedStaff: lead.assignedStaff ? { value: lead.assignedStaff.id, label: lead.assignedStaff.name } : null,
        status: lead.status,
        followUpDate: toDateInputValue(lead.followUpDate),
        notes: lead.notes ?? '',
      })
    } else {
      reset(EMPTY_VALUES)
    }
  }, [isOpen, isEdit, lead, reset])

  function submit(values) {
    const payload = {
      ...values,
      assignedStaff: values.assignedStaff?.value || undefined,
      email: values.email || undefined,
      interestedVisaType: values.interestedVisaType || undefined,
      followUpDate: values.followUpDate || undefined,
    }
    if (!isEdit) delete payload.status
    onSubmit(payload)
  }

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Lead — ${lead?.leadId ?? ''}` : 'Add Lead'}
      size="lg"
      onSubmit={handleSubmit(submit)}
      submitLabel={isEdit ? 'Save Changes' : 'Add Lead'}
      isSubmitting={isSubmitting}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Full Name" error={errors.name?.message} required>
          <TextInput {...register('name')} hasError={!!errors.name} placeholder="Kasun Perera" autoFocus />
        </FormField>

        <FormField label="Mobile" error={errors.mobile?.message} required>
          <TextInput {...register('mobile')} hasError={!!errors.mobile} placeholder="07XXXXXXXX" />
        </FormField>

        <FormField label="WhatsApp" error={errors.whatsapp?.message}>
          <TextInput {...register('whatsapp')} placeholder="07XXXXXXXX" />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <TextInput {...register('email')} hasError={!!errors.email} type="email" placeholder="name@example.com" />
        </FormField>

        <FormField label="Interested Country" error={errors.interestedCountry?.message}>
          <TextInput {...register('interestedCountry')} placeholder="e.g. Canada" />
        </FormField>

        <FormField label="Visa Type" error={errors.interestedVisaType?.message}>
          <SelectInput {...register('interestedVisaType')} options={VISA_CATEGORY_OPTIONS} placeholder="Select visa type" />
        </FormField>

        <FormField label="Lead Source" error={errors.leadSource?.message} required>
          <SelectInput
            {...register('leadSource')}
            options={LEAD_SOURCE_OPTIONS}
            placeholder="Select source"
            hasError={!!errors.leadSource}
          />
        </FormField>

        <FormField label="Assigned Staff" error={errors.assignedStaff?.message}>
          <Controller
            control={control}
            name="assignedStaff"
            render={({ field }) => (
              <StaffSelector value={field.value} onChange={field.onChange} placeholder="Search staff..." />
            )}
          />
        </FormField>

        {isEdit && (
          <FormField label="Status" error={errors.status?.message}>
            <SelectInput {...register('status')} options={EDITABLE_STATUS_OPTIONS} />
          </FormField>
        )}

        <FormField label="Follow-up Date" error={errors.followUpDate?.message}>
          <TextInput {...register('followUpDate')} type="date" />
        </FormField>
      </div>

      <FormField label="Notes" error={errors.notes?.message}>
        <TextAreaInput {...register('notes')} placeholder="Any additional notes..." />
      </FormField>
    </FormDialog>
  )
}
