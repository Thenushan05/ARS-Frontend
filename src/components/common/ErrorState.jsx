import { AlertTriangle, RotateCw } from 'lucide-react'
import { Button } from './Button'

export function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-status-danger-border bg-status-danger-bg px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-white text-status-danger">
        <AlertTriangle className="size-6" />
      </div>
      <div>
        <p className="font-medium text-slate-800">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-slate-600">{description}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RotateCw className="size-4" />
          Try again
        </Button>
      )}
    </div>
  )
}
