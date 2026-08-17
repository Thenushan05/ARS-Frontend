import { createContext, useCallback, useContext, useMemo } from 'react'
import { AuthContext } from './AuthContext'

const PermissionContext = createContext(null)

/**
 * Derives permission checks from the authenticated user's `permissions`
 * array (issued by the backend at login/refresh — see api/authApi.js).
 * This is the ONLY place in the app that should read `user.permissions`
 * directly; everything else goes through hasPermission/hasAnyPermission
 * or the <PermissionGuard> component.
 *
 * Reminder (§6, §37): this gates UI only. The backend enforces the same
 * permission keys on every endpoint — never treat a hidden button as
 * a security control on its own.
 */
export function PermissionProvider({ children }) {
  const auth = useContext(AuthContext)
  const permissions = useMemo(() => new Set(auth?.user?.permissions ?? []), [auth?.user])

  const hasPermission = useCallback((permission) => {
    if (!permission) return true
    return permissions.has(permission)
  }, [permissions])

  const hasAnyPermission = useCallback((requiredPermissions = []) => {
    if (!requiredPermissions.length) return true
    return requiredPermissions.some((permission) => permissions.has(permission))
  }, [permissions])

  const hasAllPermissions = useCallback((requiredPermissions = []) => {
    if (!requiredPermissions.length) return true
    return requiredPermissions.every((permission) => permissions.has(permission))
  }, [permissions])

  const value = useMemo(
    () => ({ permissions, hasPermission, hasAnyPermission, hasAllPermissions }),
    [permissions, hasPermission, hasAnyPermission, hasAllPermissions],
  )

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
}

export function usePermissionContext() {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermissionContext must be used within a PermissionProvider')
  }
  return context
}
