import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from '@/api/authApi'
import { onSessionExpired } from '@/api/axiosInstance'
import { setAccessToken, clearAccessToken } from '@/api/tokenStore'
import { useToast } from '@/hooks/useToast'
import { PERMISSIONS } from '@/constants/permissions'
import { ROLES } from '@/constants/roles'

export const AuthContext = createContext(null)

export const DEMO_USER = {
  id: 'demo-admin-01',
  name: 'Demo Administrator',
  email: 'demo@arsvisa.com',
  role: ROLES.SUPER_ADMIN,
  branch: 'Colombo Main Head Office',
  avatarUrl: null,
  twoFactorEnabled: false,
  permissions: Object.values(PERMISSIONS),
}

/**
 * Owns the authenticated user + session lifecycle:
 *  - boot-time silent refresh (so a page reload doesn't force re-login)
 *  - login / 2FA challenge / logout
 *  - demo login for frontend preview
 *  - automatic logout when axiosInstance reports the session expired
 *    (refresh token invalid/expired — see api/axiosInstance.js)
 *
 * PermissionContext reads `user.permissions` from here; nothing else in the
 * app should re-implement auth state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | authenticated | unauthenticated
  const toast = useToast()

  const bootstrap = useCallback(async () => {
    try {
      if (localStorage.getItem('demo_session') === 'true') {
        setAccessToken('demo-access-token')
        setUser(DEMO_USER)
        setStatus('authenticated')
        return
      }
      const { accessToken } = await authApi.refresh()
      setAccessToken(accessToken)
      const currentUser = await authApi.getCurrentUser()
      setUser(currentUser)
      setStatus('authenticated')
    } catch {
      clearAccessToken()
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  useEffect(() => {
    return onSessionExpired(() => {
      localStorage.removeItem('demo_session')
      setUser(null)
      setStatus('unauthenticated')
      toast?.info('Your session has expired. Please sign in again.')
    })
  }, [toast])

  const login = useCallback(async ({ email, password, rememberMe }) => {
    const result = await authApi.login({ email, password, rememberMe })
    if (result.twoFactorRequired) {
      return { twoFactorRequired: true, challengeToken: result.challengeToken }
    }
    localStorage.removeItem('demo_session')
    setAccessToken(result.accessToken)
    setUser(result.user)
    setStatus('authenticated')
    return { twoFactorRequired: false }
  }, [])

  const demoLogin = useCallback((role = ROLES.SUPER_ADMIN) => {
    const demoUser = {
      ...DEMO_USER,
      role,
    }
    localStorage.setItem('demo_session', 'true')
    setAccessToken('demo-access-token')
    setUser(demoUser)
    setStatus('authenticated')
    return { twoFactorRequired: false }
  }, [])

  const verifyTwoFactor = useCallback(async ({ challengeToken, code }) => {
    const result = await authApi.verifyTwoFactor({ challengeToken, code })
    localStorage.removeItem('demo_session')
    setAccessToken(result.accessToken)
    setUser(result.user)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem('demo_session') !== 'true') {
        await authApi.logout()
      }
    } catch {
      // Ignore network failure on logout
    } finally {
      localStorage.removeItem('demo_session')
      clearAccessToken()
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      login,
      demoLogin,
      verifyTwoFactor,
      logout,
    }),
    [user, status, login, demoLogin, verifyTwoFactor, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

