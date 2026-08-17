import { Outlet } from 'react-router-dom'

/** Centered card shell for Login / Forgot Password / Reset Password (§5). */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            ARS
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">ARS Visa & Consultants</p>
            <p className="text-sm text-slate-500">Management System</p>
          </div>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface p-6 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
