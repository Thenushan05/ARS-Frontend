import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export const TextAreaInput = forwardRef(function TextAreaInput({ hasError, className, rows = 3, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors',
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
