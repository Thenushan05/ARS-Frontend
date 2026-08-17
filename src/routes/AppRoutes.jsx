import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { CustomerPortalLayout } from '@/layouts/CustomerPortalLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { PermissionRoute } from './PermissionRoute'
import { ROUTES } from '@/constants/routes'
import { MENU_ITEMS } from '@/constants/menuConfig'
import { PERMISSIONS } from '@/constants/permissions'
import { ComingSoonPage } from '@/components/common/ComingSoonPage'
import { EmptyState } from '@/components/common/EmptyState'

import LoginPage from '@/features/auth/pages/LoginPage'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import NotFoundPage from '@/features/dashboard/pages/NotFoundPage'
import ForbiddenPage from '@/features/dashboard/pages/ForbiddenPage'
import LeadListPage from '@/features/leads/pages/LeadListPage'

// Every menu destination other than Dashboard and Leads is still a
// Phase 2+ feature (§48) — rendered as a permission-gated placeholder
// until that phase lands, so navigation and access control can be
// exercised end-to-end now.
const PLACEHOLDER_ITEMS = MENU_ITEMS.filter((item) => item.key !== 'dashboard' && item.key !== 'leads')

/**
 * §49 route architecture, in one place:
 *   /login, /forgot-password          → public, AuthLayout
 *   /                                  → ProtectedRoute → MainLayout → PermissionRoute per menu item
 *   /portal/*                          → ProtectedRoute → CustomerPortalLayout (Phase 7)
 *   /403, /404                         → standalone, no guard
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<DashboardPage />} />

          <Route element={<PermissionRoute permission={PERMISSIONS.LEADS_VIEW} />}>
            <Route path={ROUTES.LEADS} element={<LeadListPage />} />
          </Route>

          {PLACEHOLDER_ITEMS.map(({ key, path, label, permission }) => (
            <Route key={key} element={<PermissionRoute permission={permission} />}>
              <Route path={path} element={<ComingSoonPage title={label} phase="a later phase" />} />
            </Route>
          ))}
        </Route>

        <Route path="/portal/*" element={<CustomerPortalLayout />}>
          <Route index element={<ComingSoonPage title="Customer Portal" phase="Phase 7" />} />
          <Route path="*" element={<EmptyState title="Coming soon" />} />
        </Route>
      </Route>

      <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
    </Routes>
  )
}
