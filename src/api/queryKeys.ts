/**
 * Central TanStack Query key registry (integration brief §9). One block per feature, added when
 * that feature's integration phase lands — keeps every module's key shape consistent instead of
 * ad-hoc strings scattered across pages. Only `auth` is populated in Phase 1; the rest are
 * reserved names for Phase 2+ so the convention is fixed up front.
 */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  dashboard: (filters?: unknown) => ['dashboard', filters] as const,
  leads: {
    list: (filters?: unknown) => ['leads', filters] as const,
    detail: (id: string) => ['lead', id] as const,
  },
  customers: {
    list: (filters?: unknown) => ['customers', filters] as const,
    detail: (id: string) => ['customer', id] as const,
  },
  tasks: {
    list: (filters?: unknown) => ['tasks', filters] as const,
    detail: (id: string) => ['task', id] as const,
  },
  appointments: {
    list: (filters?: unknown) => ['appointments', filters] as const,
    detail: (id: string) => ['appointment', id] as const,
  },
} as const;
