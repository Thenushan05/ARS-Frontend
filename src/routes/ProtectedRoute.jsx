import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'

/**
 * Gate for anything requiring an authenticated session. Redirects to
 * /login and remembers the attempted location so LoginPage can send the
 * user back after a successful sign-in (§5).
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSkeleton className="h-8 w-40" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
