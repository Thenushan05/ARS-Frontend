import { Link } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { ROUTES } from '@/constants/routes'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-center">
      <p className="text-5xl font-bold text-slate-300">404</p>
      <p className="text-lg font-medium text-slate-800">Page not found</p>
      <p className="text-sm text-slate-500">The page you're looking for doesn't exist or has moved.</p>
      <Link to={ROUTES.DASHBOARD}>
        <Button className="mt-2">Back to dashboard</Button>
      </Link>
    </div>
  )
}
