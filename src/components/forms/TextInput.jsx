import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

/** Register directly with React Hook Form: <TextInput {...register('email')} hasError={!!errors.email} /> */
export const TextInput = forwardRef(function TextInput({ hasError, className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition-colors',
        'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100',
        hasError
          ? 'border-status-danger-border focus:border-status-danger focus:ring-2 focus:ring-status-danger-bg'
          : 'border-surface-border focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
        className,
      )}
      {...props}
    />
  )
})
