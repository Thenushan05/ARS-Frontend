import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { FormField } from '@/components/forms/FormField'
import { TextInput } from '@/components/forms/TextInput'
import { twoFactorSchema } from '../schemas'

/** Step 2 of login when the account has 2FA enabled (§5, §37). */
export function TwoFactorForm({ onSubmit, onBack, isSubmitting, error }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(twoFactorSchema), defaultValues: { code: '' } })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <ShieldCheck className="size-5" />
        </div>
        <p className="text-sm text-slate-600">Enter the 6-digit code from your authenticator app.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-status-danger-border bg-status-danger-bg px-3 py-2 text-sm text-status-danger">
          {error}
        </div>
      )}

      <FormField label="Verification code" error={errors.code?.message}>
        <TextInput
          {...register('code')}
          hasError={!!errors.code}
          inputMode="numeric"
          maxLength={6}
          autoFocus
          placeholder="123456"
          className="text-center tracking-[0.5em]"
        />
      </FormField>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Verify & sign in
      </Button>
      <button type="button" onClick={onBack} className="w-full text-center text-sm text-slate-500 hover:text-slate-700">
        Back to sign in
      </button>
    </form>
  )
}
