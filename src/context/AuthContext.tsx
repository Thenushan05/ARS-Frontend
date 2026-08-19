import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User, Permission } from '../types';
import { authApi, BackendUser } from '../api/authApi';
import { tokenStore } from '../api/tokenStore';
import { attemptSilentRefresh, registerAuthFailureHandler } from '../api/axiosInstance';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission | Permission[]) => boolean;
  /** Local-only permission-view preview for the Roles & Permissions screen (does NOT call the
   *  backend) — kept for that page's existing "activate role for testing" workflow, to be
   *  replaced when Phase 6 wires real `PUT /users/:id/permissions` / `PUT /roles/:id/permissions`.
   *  Never affects what the backend will actually authorize. */
  switchRole: (roleName: string, customPermissions?: Permission[]) => void;
  updateUserPermissions: (permissions: Permission[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Adapts the backend's `/auth/me` wire shape to this app's existing UI-facing `User` type, so
 * every current consumer (`user.name`, `user.role`, `user.branch`, ...) keeps working unchanged
 * while the actual data now comes from Supabase via the real API (brief §11 — adapt at the
 * boundary, don't force every screen to change). */
function mapApiUserToUser(apiUser: BackendUser): User {
  return {
    id: apiUser.id,
    name: apiUser.fullName,
    email: apiUser.email,
    role: apiUser.role.name,
    isSuperAdmin: apiUser.isSuperAdmin,
    phone: apiUser.phone ?? undefined,
    branch: apiUser.branch?.name,
    // No signed-URL resolution for profileImageKey yet (that's Documents/Storage-phase work) —
    // UI falls back to its existing stock-photo default when avatar is undefined.
    avatar: undefined,
    permissions: apiUser.permissions as Permission[],
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    // axiosInstance can't import this component (circular import) — register a callback instead,
    // so a failed silent-refresh from ANY request can clear the session and bounce to /login
    // (brief §17) without this module and axiosInstance.ts depending on each other directly.
    registerAuthFailureHandler(() => {
      if (cancelled) return;
      setUser(null);
      queryClient.clear();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    });

    (async () => {
      // No token is ever read from localStorage on boot — only the httpOnly refresh cookie (which
      // JS can't see the value of anyway) can restore a session.
      const restored = await attemptSilentRefresh();
      if (restored) {
        try {
          const me = await authApi.me();
          if (!cancelled) setUser(mapApiUserToUser(me));
        } catch {
          tokenStore.set(null);
        }
      }
      if (!cancelled) setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = true) => {
    const result = await authApi.login(email, password);

    if (result.twoFactorRequired) {
      // Phase 1 wires the primary login flow only — a 2FA-enabled account surfaces a clear error
      // here rather than the frontend silently treating "password correct" as "fully logged in"
      // (the backend never issues tokens until /auth/verify-2fa succeeds, so nothing is bypassed;
      // the code-entry UI itself is a follow-up piece of work, not yet built).
      throw new Error(
        `Two-factor verification (${result.method}) is required for this account. The 2FA challenge screen isn't built yet — ask an admin to disable 2FA temporarily, or use an account without it.`,
      );
    }

    tokenStore.set(result.tokens.accessToken);
    setUser(mapApiUserToUser(result.user));
    // A brand-new session must never inherit a previous user's cached queries (brief §58/§59).
    queryClient.clear();

    if (rememberMe) {
      localStorage.setItem('ars_remembered_email', email);
    } else {
      localStorage.removeItem('ars_remembered_email');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort — even if this call fails, clear local state below; the refresh cookie will
      // simply expire/rotate-fail server-side on its own.
    }
    tokenStore.set(null);
    setUser(null);
    queryClient.clear();
  };

  const hasPermission = (permission: Permission | Permission[]): boolean => {
    if (!user) return false;
    // Mirrors the backend's own PermissionsGuard exactly: isSuperAdmin always passes, checked
    // before (and independently of) the permission-key set — never a role-name string match.
    if (user.isSuperAdmin) return true;

    if (Array.isArray(permission)) {
      return permission.some((p) => user.permissions.includes(p));
    }
    return user.permissions.includes(permission);
  };

  const updateUserPermissions = (permissions: Permission[]) => {
    setUser((current) => (current ? { ...current, permissions } : current));
  };

  const switchRole = (roleName: string, customPermissions?: Permission[]) => {
    setUser((current) => {
      if (!current) return current;
      // Local-only UI preview (see field doc above) — never touches isSuperAdmin, since only the
      // backend's real flag may ever grant the universal-access bypass.
      return { ...current, role: roleName, permissions: customPermissions ?? current.permissions };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        switchRole,
        updateUserPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
