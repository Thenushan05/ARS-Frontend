import { usePermissionContext } from '@/context/PermissionContext'

/**
 * Preferred entry point for permission checks in feature code:
 *   const { can } = usePermission()
 *   if (can('invoices.manage')) { ... }
 */
export function usePermission() {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissionContext()
  return { can: hasPermission, canAny: hasAnyPermission, canAll: hasAllPermissions }
}
