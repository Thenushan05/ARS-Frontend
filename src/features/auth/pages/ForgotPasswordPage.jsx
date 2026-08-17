import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { FormField } from '@/components/forms/FormField'
import { TextInput } from '@/components/forms/TextInput'
import { authApi } from '@/api/authApi'
import { ROUTES } from '@/constants/routes'
import { forgotPasswordSchema } from '../schemas'

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [isSent, setIsSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } })

  async function onSubmit(values) {
    setServerError(null)
    setIsSubmitting(true)
    try {
      await authApi.forgotPassword(values)
      setIsSent(true)
    } catch (error) {
      setServerError(error.response?.data?.message ?? 'Could not send reset link. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSent) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-status-success-bg text-status-success">
          <CheckCircle2 className="size-5" />
        </div>
        <p className="text-sm text-slate-600">If an account exists for that email, a reset link has been sent.</p>
        <Link to={ROUTES.LOGIN} className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your email and we'll send you a reset link.</p>
      </div>

      {serverError && (
        <div className="rounded-lg border border-status-danger-border bg-status-danger-bg px-3 py-2 text-sm text-status-danger">
          {serverError}
        </div>
      )}

      <FormField label="Email" error={errors.email?.message} required>
        <TextInput {...register('email')} hasError={!!errors.email} type="email" autoComplete="email" placeholder="you@arsvisa.com" autoFocus />
      </FormField>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Send reset link
      </Button>
      <Link to={ROUTES.LOGIN} className="block text-center text-sm text-slate-500 hover:text-slate-700">
        Back to sign in
      </Link>
    </form>
  )
}
