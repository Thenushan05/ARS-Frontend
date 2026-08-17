import React from 'react';
import { Permission } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface PermissionGuardProps {
  permission: Permission | Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Reusable permission guard component.
 * Ensures strict UI element visibility based on permissions received from backend auth payload.
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null
}) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
