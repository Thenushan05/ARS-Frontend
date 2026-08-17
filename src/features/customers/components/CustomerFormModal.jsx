import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormDialog } from '@/components/modals/FormDialog'
import { FormField } from '@/components/forms/FormField'
import { TextInput } from '@/components/forms/TextInput'
import { SelectInput } from '@/components/forms/SelectInput'
import { TextAreaInput } from '@/components/forms/TextAreaInput'
import { StaffSelector } from '@/components/common/StaffSelector'
import { customerFormSchema } from '../schemas'
import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, VISA_CATEGORY_OPTIONS } from '../constants'

const EMPTY_VALUES = {
  fullName: '', mobile: '', whatsapp: '', email: '', passportNumber: '', nic: '', dob: '',
  gender: '', nationality: '', address: '', maritalStatus: '', occupation: '', monthlyIncome: '', bankBalance: '',
  applyingCountry: '', visaCategory: '', travelPurpose: '', previousVisaHistory: '', previousRefusals: '',
  assignedConsultant: null, notes: '',
}

function toDateInputValue(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

function SectionHeading({ children }) {
  return <h4 className="col-span-full mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400 first:mt-0">{children}</h4>
}

/** Shared "Add Customer" / "Edit Customer" form (§9). */
export function CustomerFormModal({ isOpen, onClose, onSubmit, isSubmitting, mode = 'add', customer }) {
  const isEdit = mode === 'edit'

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(customerFormSchema), defaultValues: EMPTY_VALUES })

  useEffect(() => {
    if (!isOpen) return
    if (isEdit && customer) {
      reset({
        fullName: customer.fullName,
        mobile: customer.mobile,
        whatsapp: customer.whatsapp ?? '',
        email: customer.email ?? '',
        passportNumber: customer.passportNumber ?? '',
        nic: customer.nic ?? '',
        dob: toDateInputValue(customer.dob),
        gender: customer.gender ?? '',
        nationality: customer.nationality ?? '',
        address: customer.address ?? '',
        maritalStatus: customer.maritalStatus ?? '',
        occupation: customer.occupation ?? '',
        monthlyIncome: customer.monthlyIncome ?? '',
        bankBalance: customer.bankBalance ?? '',
        applyingCountry: customer.applyingCountry ?? '',
        visaCategory: customer.visaCategory ?? '',
        travelPurpose: customer.travelPurpose ?? '',
        previousVisaHistory: customer.previousVisaHistory ?? '',
        previousRefusals: customer.previousRefusals ?? '',
        assignedConsultant: customer.assignedConsultant ? { value: customer.assignedConsultant.id, label: customer.assignedConsultant.name } : null,
        notes: customer.notes ?? '',
      })
    } else {
      reset(EMPTY_VALUES)
    }
  }, [isOpen, isEdit, customer, reset])

  function submit(values) {
    const payload = {
      ...values,
      assignedConsultant: values.assignedConsultant?.value || undefined,
      email: values.email || undefined,
      gender: values.gender || undefined,
      maritalStatus: values.maritalStatus || undefined,
      visaCategory: values.visaCategory || undefined,
      dob: values.dob || undefined,
      monthlyIncome: values.monthlyIncome === '' ? undefined : values.monthlyIncome,
      bankBalance: values.bankBalance === '' ? undefined : values.bankBalance,
    }
    onSubmit(payload)
  }

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Customer — ${customer?.customerId ?? ''}` : 'Add Customer'}
      size="xl"
      onSubmit={handleSubmit(submit)}
      submitLabel={isEdit ? 'Save Changes' : 'Register Customer'}
      isSubmitting={isSubmitting}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SectionHeading>Personal Information</SectionHeading>
        <FormField label="Full Name" error={errors.fullName?.message} required>
          <TextInput {...register('fullName')} hasError={!!errors.fullName} autoFocus />
        </FormField>
        <FormField label="Mobile" error={errors.mobile?.message} required>
          <TextInput {...register('mobile')} hasError={!!errors.mobile} placeholder="07XXXXXXXX" />
        </FormField>
        <FormField label="WhatsApp" error={errors.whatsapp?.message}>
          <TextInput {...register('whatsapp')} placeholder="07XXXXXXXX" />
        </FormField>
        <FormField label="Email" error={errors.email?.message}>
          <TextInput {...register('email')} hasError={!!errors.email} type="email" />
        </FormField>
        <FormField label="Passport Number" error={errors.passportNumber?.message}>
          <TextInput {...register('passportNumber')} />
        </FormField>
        <FormField label="NIC" error={errors.nic?.message}>
          <TextInput {...register('nic')} />
        </FormField>
        <FormField label="Date of Birth" error={errors.dob?.message}>
          <TextInput {...register('dob')} type="date" />
        </FormField>
        <FormField label="Gender" error={errors.gender?.message}>
          <SelectInput {...register('gender')} options={GENDER_OPTIONS} placeholder="Select gender" />
        </FormField>
        <FormField label="Nationality" error={errors.nationality?.message}>
          <TextInput {...register('nationality')} />
        </FormField>
        <FormField label="Marital Status" error={errors.maritalStatus?.message}>
          <SelectInput {...register('maritalStatus')} options={MARITAL_STATUS_OPTIONS} placeholder="Select status" />
        </FormField>
        <FormField label="Occupation" error={errors.occupation?.message}>
          <TextInput {...register('occupation')} />
        </FormField>

        <SectionHeading>Address & Financial</SectionHeading>
        <FormField label="Address" error={errors.address?.message} className="sm:col-span-2 lg:col-span-3">
          <TextAreaInput {...register('address')} rows={2} />
        </FormField>
        <FormField label="Monthly Income (LKR)" error={errors.monthlyIncome?.message}>
          <TextInput {...register('monthlyIncome')} type="number" min="0" step="0.01" />
        </FormField>
        <FormField label="Bank Balance (LKR)" error={errors.bankBalance?.message}>
          <TextInput {...register('bankBalance')} type="number" min="0" step="0.01" />
        </FormField>

        <SectionHeading>Visa Interest</SectionHeading>
        <FormField label="Applying Country" error={errors.applyingCountry?.message}>
          <TextInput {...register('applyingCountry')} placeholder="e.g. Canada" />
        </FormField>
        <FormField label="Visa Category" error={errors.visaCategory?.message}>
          <SelectInput {...register('visaCategory')} options={VISA_CATEGORY_OPTIONS} placeholder="Select category" />
        </FormField>
        <FormField label="Assigned Consultant" error={errors.assignedConsultant?.message}>
          <Controller
            control={control}
            name="assignedConsultant"
            render={({ field }) => <StaffSelector value={field.value} onChange={field.onChange} placeholder="Search staff..." />}
          />
        </FormField>
        <FormField label="Travel Purpose" error={errors.travelPurpose?.message} className="sm:col-span-2 lg:col-span-3">
          <TextAreaInput {...register('travelPurpose')} rows={2} />
        </FormField>
        <FormField label="Previous Visa History" error={errors.previousVisaHistory?.message} className="sm:col-span-2 lg:col-span-3">
          <TextAreaInput {...register('previousVisaHistory')} rows={2} />
        </FormField>
        <FormField label="Previous Refusals" error={errors.previousRefusals?.message} className="sm:col-span-2 lg:col-span-3">
          <TextAreaInput {...register('previousRefusals')} rows={2} />
        </FormField>
        <FormField label="Notes" error={errors.notes?.message} className="sm:col-span-2 lg:col-span-3">
          <TextAreaInput {...register('notes')} rows={2} />
        </FormField>
      </div>
    </FormDialog>
  )
}
