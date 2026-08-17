import { Navigate, Outlet } from 'react-router-dom'
import { usePermission } from '@/hooks/usePermission'
import { ROUTES } from '@/constants/routes'

/**
 * Second, independent gate layered under <ProtectedRoute>: even if a menu
 * item was hidden by the sidebar's own permission filter, someone could
 * still type the URL directly, so every route also checks here (§6, §37).
 * The backend re-checks the same permission key server-side — this only
 * controls what renders.
 */
export function PermissionRoute({ permission, anyOf }) {
  const { can, canAny } = usePermission()
  const allowed = permission ? can(permission) : anyOf ? canAny(anyOf) : true

  if (!allowed) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />
  }

  return <Outlet />
}
