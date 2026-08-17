import { usePermission } from '@/hooks/usePermission'

/**
 * Conditionally renders children based on the current user's permissions.
 *
 *   <PermissionGuard permission="finance.profit.view">
 *     <ProfitCard />
 *   </PermissionGuard>
 *
 *   <PermissionGuard anyOf={['invoices.manage', 'payments.manage']} fallback={<EmptyState .../>}>
 *     <RecordPaymentButton />
 *   </PermissionGuard>
 *
 * This is UX only (§6, §37) — it stops a user from seeing/clicking
 * something they don't have rights to, it does not stop a network
 * request. The backend enforces the same permission keys server-side.
 */
export function PermissionGuard({ permission, anyOf, allOf, fallback = null, children }) {
  const { can, canAny, canAll } = usePermission()

  let allowed = true
  if (permission) allowed = allowed && can(permission)
  if (anyOf) allowed = allowed && canAny(anyOf)
  if (allOf) allowed = allowed && canAll(allOf)

  return allowed ? children : fallback
}
