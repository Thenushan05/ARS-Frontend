import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Permission } from '../types';
import { authApi } from '../api';
import { CURRENT_USER_MOCK } from '../api/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission | Permission[]) => boolean;
  switchRole: (roleName: string, customPermissions?: Permission[]) => void;
  updateUserPermissions: (permissions: Permission[]) => void;
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

  const login = async (email: string, pass: string, rememberMe: boolean = true) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, pass);
      localStorage.setItem('ars_auth_token', res.token);
      localStorage.setItem('ars_user', JSON.stringify(res.user));
      if (rememberMe) {
        localStorage.setItem('ars_remembered_email', email);
      } else {
        localStorage.removeItem('ars_remembered_email');
      }
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
    if (user.role === 'Super Admin') return true; // Super Admin bypasses UI controls
    
    if (Array.isArray(permission)) {
      return permission.some(p => user.permissions.includes(p));
    }
    return user.permissions.includes(permission);
  };

  const updateUserPermissions = (permissions: Permission[]) => {
    if (!user) return;
    const updatedUser: User = { ...user, permissions };
    setUser(updatedUser);
    localStorage.setItem('ars_user', JSON.stringify(updatedUser));
  };

  const switchRole = (roleName: string, customPermissions?: Permission[]) => {
    if (!user) return;
    let newPerms: Permission[] = customPermissions || [];
    
    if (!customPermissions) {
      if (roleName === 'Super Admin' || roleName === 'Managing Director') {
        newPerms = CURRENT_USER_MOCK.permissions;
      } else if (roleName === 'Manager') {
        newPerms = [
          'lead.view', 'lead.create', 'lead.edit', 'lead.convert', 'lead.delete',
          'customer.view', 'customer.create', 'customer.edit',
          'visa.view', 'visa.create', 'visa.update',
          'evisa.view', 'evisa.manage',
          'quotation.view', 'quotation.create', 'quotation.edit',
          'invoice.view', 'invoice.create', 'invoice.edit',
          'payment.view', 'payment.create', 'payment.receipt',
          'pricing.view', 'pricing.cost.view',
          'package.view', 'package.create',
          'supplier.view', 'supplier.create',
          'finance.income.view', 'finance.expense.view', 'finance.profit.view', 'finance.banking.view',
          'staff.manage', 'staff.performance', 'reports.view', 'reports.export'
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
      } else if (roleName === 'Accountant') {
        newPerms = [
          'invoice.view', 'invoice.create', 'invoice.edit',
          'payment.view', 'payment.create', 'payment.receipt',
          'pricing.view', 'pricing.cost.view',
          'supplier.view', 'supplier.cost.view',
          'finance.income.view', 'finance.expense.view', 'finance.profit.view', 'finance.banking.view',
          'reports.view', 'reports.export'
        ];
      } else if (roleName === 'Customer Service') {
        newPerms = [
          'lead.view', 'lead.create', 'lead.edit',
          'customer.view', 'customer.create',
          'visa.view',
          'quotation.view'
        ];
      } else if (roleName === 'Marketing Staff') {
        newPerms = [
          'lead.view', 'lead.create', 'lead.edit',
          'customer.view',
          'reports.view'
        ];
      }
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
        switchRole,
        updateUserPermissions
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
