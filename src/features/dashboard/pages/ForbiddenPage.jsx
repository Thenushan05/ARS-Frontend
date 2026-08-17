import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { ROUTES } from '@/constants/routes'

/** Shown when PermissionRoute blocks direct navigation to a URL the user lacks rights to (§6, §37). */
export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-center">
      <ShieldAlert className="size-12 text-status-danger" />
      <p className="text-lg font-medium text-slate-800">You don't have access to this page</p>
      <p className="text-sm text-slate-500">Contact your administrator if you believe this is a mistake.</p>
      <Link to={ROUTES.DASHBOARD}>
        <Button className="mt-2">Back to dashboard</Button>
      </Link>
    </div>
  )
}
