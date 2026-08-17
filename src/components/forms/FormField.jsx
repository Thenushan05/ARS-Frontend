import { cn } from '@/utils/cn'

/**
 * Label + error-message wrapper around any input. Pairs with React Hook
 * Form's fieldState.error:
 *
 *   <FormField label="Passport Number" error={errors.passportNumber?.message} required>
 *     <TextInput {...register('passportNumber')} />
 *   </FormField>
 */
export function FormField({ label, htmlFor, error, required, hint, className, children }) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-status-danger">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-status-danger">{error}</p>}
    </div>
  )
}
