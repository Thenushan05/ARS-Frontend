import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { FormField } from '@/components/forms/FormField'
import { TextInput } from '@/components/forms/TextInput'
import { PasswordInput } from '@/components/forms/PasswordInput'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { loginSchema } from '../schemas'
import { TwoFactorForm } from '../components/TwoFactorForm'

export default function LoginPage() {
  const { login, demoLogin, verifyTwoFactor } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from ?? ROUTES.DASHBOARD

  const [serverError, setServerError] = useState(null)
  const [twoFactor, setTwoFactor] = useState(null) // { challengeToken } | null
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  function handleDemoLogin() {
    demoLogin()
    navigate(redirectTo, { replace: true })
  }

  function handleFillDemoCredentials() {
    setValue('email', 'admin@arsvisa.com')
    setValue('password', 'DemoAdmin123!')
  }

  async function onSubmit(values) {
    setServerError(null)
    setIsSubmitting(true)
    try {
      const result = await login(values)
      if (result.twoFactorRequired) {
        setTwoFactor({ challengeToken: result.challengeToken })
        return
      }
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setServerError(error.response?.data?.message ?? 'Invalid email or password. Click "Quick Demo Sign In" below for frontend demo access.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onVerify({ code }) {
    setServerError(null)
    setIsSubmitting(true)
    try {
      await verifyTwoFactor({ challengeToken: twoFactor.challengeToken, code })
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setServerError(error.response?.data?.message ?? 'Invalid verification code.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (twoFactor) {
    return (
      <TwoFactorForm
        onSubmit={onVerify}
        onBack={() => {
          setTwoFactor(null)
          setServerError(null)
        }}
        isSubmitting={isSubmitting}
        error={serverError}
      />
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">Sign in</h1>
          <button
            type="button"
            onClick={handleFillDemoCredentials}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium underline underline-offset-2"
          >
            Auto-fill Demo Credentials
          </button>
        </div>

        {serverError && (
          <div className="rounded-lg border border-status-danger-border bg-status-danger-bg px-3 py-2 text-sm text-status-danger">
            {serverError}
          </div>
        )}

        <FormField label="Email or Username" error={errors.email?.message} required>
          <TextInput
            {...register('email')}
            hasError={!!errors.email}
            type="text"
            autoComplete="username"
            placeholder="you@arsvisa.com"
            autoFocus
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message} required>
          <PasswordInput {...register('password')} hasError={!!errors.password} autoComplete="current-password" placeholder="••••••••" />
        </FormField>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input type="checkbox" {...register('rememberMe')} className="size-4 rounded border-surface-border text-brand-600 focus:ring-brand-500" />
            Remember me
          </label>
          <Link to={ROUTES.FORGOT_PASSWORD} className="font-medium text-brand-600 hover:text-brand-700">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative bg-white px-3 text-xs uppercase tracking-wider text-slate-400 font-medium">
          Or Quick Demo Access
        </div>
      </div>

      <div className="space-y-2">
        <Button type="button" variant="secondary" className="w-full bg-slate-800 text-white hover:bg-slate-900 border-transparent shadow-sm" onClick={handleDemoLogin}>
          ⚡ Instant Demo Sign In (Admin)
        </Button>
        <p className="text-center text-xs text-slate-500">
          Bypasses backend API & grants full Super Admin access.
        </p>
      </div>
    </div>
  )
}
