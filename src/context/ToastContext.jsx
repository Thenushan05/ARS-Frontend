import { createContext, useCallback, useMemo, useState } from 'react'

export const ToastContext = createContext(null)

let idCounter = 0

/**
 * App-wide toast notifications (§44 "Use toast notifications"). Feature
 * code should consume this via the useToast() hook rather than importing
 * the context directly.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback((tone, message, { duration = 4000 } = {}) => {
    idCounter += 1
    const id = idCounter
    setToasts((current) => [...current, { id, tone, message }])
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }, [dismiss])

  const api = useMemo(
    () => ({
      toasts,
      dismiss,
      success: (message, opts) => push('success', message, opts),
      error: (message, opts) => push('danger', message, opts),
      info: (message, opts) => push('info', message, opts),
      warning: (message, opts) => push('warning', message, opts),
    }),
    [toasts, dismiss, push],
  )

  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>
}
