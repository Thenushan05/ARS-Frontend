import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Permission } from '../types';
import { authApi } from '../api';
import { CURRENT_USER_MOCK } from '../api/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission | Permission[]) => boolean;
  switchRole: (roleName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('ars_auth_token');
      const savedUser = localStorage.getItem('ars_user');
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(CURRENT_USER_MOCK);
        }
      } else {
        // Default to logged-in Super Admin for seamless demo/initial load
        setUser(CURRENT_USER_MOCK);
        localStorage.setItem('ars_auth_token', 'demo-admin-token');
        localStorage.setItem('ars_user', JSON.stringify(CURRENT_USER_MOCK));
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, pass);
      localStorage.setItem('ars_auth_token', res.token);
      localStorage.setItem('ars_user', JSON.stringify(res.user));
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ars_auth_token');
    localStorage.removeItem('ars_user');
    setUser(null);
  };

  const hasPermission = (permission: Permission | Permission[]): boolean => {
    if (!user) return false;
    if (user.role === 'Super Admin') return true; // Super admin has all permissions
    
    if (Array.isArray(permission)) {
      return permission.some(p => user.permissions.includes(p));
    }
    return user.permissions.includes(permission);
  };

  // Helper for quick demo role-switching in header
  const switchRole = (roleName: string) => {
    if (!user) return;
    let newPerms: Permission[] = [];
    if (roleName === 'Super Admin' || roleName === 'Managing Director') {
      newPerms = CURRENT_USER_MOCK.permissions;
    } else if (roleName === 'Accountant') {
      newPerms = [
        'invoice.view', 'invoice.create', 'invoice.edit',
        'payment.view', 'payment.create', 'payment.receipt',
        'pricing.view', 'pricing.cost.view',
        'supplier.view', 'supplier.cost.view',
        'finance.income.view', 'finance.expense.view', 'finance.profit.view', 'finance.banking.view',
        'reports.view', 'reports.export'
      ];
    } else if (roleName === 'Visa Consultant') {
      newPerms = [
        'lead.view', 'lead.create', 'lead.edit', 'lead.convert',
        'customer.view', 'customer.create', 'customer.edit',
        'visa.view', 'visa.create', 'visa.update',
        'evisa.view',
        'quotation.view', 'quotation.create',
        'invoice.view', 'payment.view'
      ];
    } else {
      // Customer Service / Marketing
      newPerms = [
        'lead.view', 'lead.create', 'lead.edit',
        'customer.view', 'customer.create',
        'visa.view',
        'quotation.view'
      ];
    }

    const updatedUser: User = {
      ...user,
      role: roleName as any,
      permissions: newPerms
    };
    setUser(updatedUser);
    localStorage.setItem('ars_user', JSON.stringify(updatedUser));
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
        switchRole
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
