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
} as const;
