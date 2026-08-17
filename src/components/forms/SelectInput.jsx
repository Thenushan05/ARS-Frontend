import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

/**
 * Plain <select> for RHF register(): <SelectInput {...register('leadSource')} options={LEAD_SOURCE_OPTIONS} />
 * options: [{ value, label }]
 */
export const SelectInput = forwardRef(function SelectInput({ options, placeholder, hasError, className, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition-colors',
        'disabled:cursor-not-allowed disabled:bg-slate-100',
        hasError
          ? 'border-status-danger-border focus:border-status-danger focus:ring-2 focus:ring-status-danger-bg'
          : 'border-surface-border focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
        className,
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
})
