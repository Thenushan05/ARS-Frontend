import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

const TONE_STYLES = {
  success: { icon: CheckCircle2, className: 'border-status-success-border bg-status-success-bg text-status-success' },
  danger: { icon: XCircle, className: 'border-status-danger-border bg-status-danger-bg text-status-danger' },
  warning: { icon: TriangleAlert, className: 'border-status-warning-border bg-status-warning-bg text-status-warning' },
  info: { icon: Info, className: 'border-status-info-border bg-status-info-bg text-status-info' },
}

/** Mounted once near the app root (see App.jsx). Reads from ToastContext. */
export function Toaster() {
  const toast = useToast()
  if (!toast || toast.toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      {toast.toasts.map(({ id, tone, message }) => {
        const { icon: Icon, className } = TONE_STYLES[tone] ?? TONE_STYLES.info
        return (
          <div
            key={id}
            role="status"
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-lg border bg-white px-4 py-3 text-sm shadow-lg',
              className,
            )}
          >
            <Icon className="size-4 shrink-0 translate-y-0.5" />
            <p className="flex-1 text-slate-700">{message}</p>
            <button onClick={() => toast.dismiss(id)} className="text-slate-400 hover:text-slate-600">
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
