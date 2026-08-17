import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { PermissionProvider } from '@/context/PermissionContext'
import { ToastProvider } from '@/context/ToastContext'
import { Toaster } from '@/components/common/Toaster'
import { AppRoutes } from '@/routes/AppRoutes'

/**
 * §41/§44 data-fetching defaults: no background refetch storms, a single
 * retry (so a genuinely-down backend fails fast into ErrorState instead of
 * retrying silently for a while), and short-lived caching appropriate for
 * data that changes via other staff members' actions.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * Provider order matters: QueryClient has no dependency on the others.
 * AuthProvider must be above PermissionProvider (permissions are derived
 * from the authenticated user). ToastProvider is used inside AuthProvider
 * (session-expired notice) so it wraps everything.
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <PermissionProvider>
              <AppRoutes />
            </PermissionProvider>
          </AuthProvider>
        </BrowserRouter>
        <Toaster />
      </ToastProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
