import axiosInstance from './axiosInstance';

export interface BackendRole {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
}

export interface BackendBranch {
  id: string;
  code: string;
  name: string;
}

/**
 * Wire shape of `/auth/me` (and the `user` field of a resolved login) — the raw backend user row
 * plus nested `role`/`branch` objects and the flat effective-`permissions` array (added to
 * `AuthController.me()` as part of this integration; see Backend `PermissionsService.
 * getEffectivePermissionKeys()`). This mirrors the backend contract on purpose, not the app's UI
 * `User` type — `mapApiUserToUser()` in AuthContext adapts it at the integration boundary rather
 * than forcing every existing UI consumer to change field names (brief §11).
 */
export interface BackendUser {
  id: string;
  employeeCode: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  jobTitle: string | null;
  profileImageKey: string | null;
  branchId: string | null;
  roleId: string;
  isSuperAdmin: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  role: BackendRole;
  branch: BackendBranch | null;
  permissions: string[];
}

export interface LoginResolved {
  twoFactorRequired: false;
  user: BackendUser;
  tokens: { accessToken: string; accessTokenExpiresIn: string };
}

export interface LoginTwoFactorRequired {
  twoFactorRequired: true;
  challengeToken: string;
  method: 'EMAIL' | 'TOTP' | 'SMS';
}

export type LoginResult = LoginResolved | LoginTwoFactorRequired;

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResult> {
    const res = await axiosInstance.post<ApiEnvelope<LoginResult>>('/auth/login', {
      email,
      password,
    });
    return res.data.data;
  },

  async verifyTwoFactor(challengeToken: string, code: string): Promise<LoginResolved> {
    const res = await axiosInstance.post<ApiEnvelope<LoginResolved>>('/auth/verify-2fa', {
      challengeToken,
      code,
    });
    return res.data.data;
  },

  async me(): Promise<BackendUser> {
    const res = await axiosInstance.get<ApiEnvelope<BackendUser>>('/auth/me');
    return res.data.data;
  },

  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout');
  },

  async forgotPassword(email: string): Promise<void> {
    await axiosInstance.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await axiosInstance.post('/auth/reset-password', { token, newPassword });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await axiosInstance.post('/auth/change-password', { currentPassword, newPassword });
  },
};
