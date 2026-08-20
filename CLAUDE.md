# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

React + TypeScript + Vite frontend for the ARS VISA & CONSULTANTS Management System. Stack:
React 19, React Router 7, TanStack Query 5, React Hook Form + Zod, Tailwind v4, axios, Recharts,
FullCalendar. Path alias `@/*` → `src/*`. The backend (NestJS, complete, live on Supabase) is a
separate repo at `C:\data\Backend` — see its `docs/ARCHITECTURE.md` for the authoritative API
contract (response envelope, enums, permission keys).

**Read `C:\data\INTEGRATION_PLAN.md` before touching any feature module** — it's the live record
of the frontend→real-backend migration and is the single most important piece of context in this
repo: this app started as 100% mock-data-driven and is being migrated module by module.

## Commands

```bash
npm run dev        # vite dev server
npm run build       # tsc -b && vite build
npm run lint         # oxlint
npm run preview       # preview a production build
```

No test runner is configured yet.

## Architecture

### Migration status — check before assuming a pattern

This codebase has **two coexisting patterns** for talking to the backend, and which one applies
to a given feature depends entirely on whether that module has been migrated yet:

- **Migrated (real backend only, no mock fallback)**: Auth, Leads, Customers, Tasks,
  Appointments, Dashboard. Each has its own `src/api/<name>Api.ts` file and TanStack Query hooks
  under `src/features/<name>/hooks/use<Name>Queries.ts`, registered in `src/api/queryKeys.ts`.
  This is the target pattern for every module going forward.
- **Not yet migrated (legacy mock-fallback)**: everything still read from the monolithic
  `src/api/index.ts` (visa cases, e-Visa, pricing, packages, quotations, invoices, payments,
  receipts, income, expenses, banking, suppliers, staff, documents). Every method there wraps a
  real axios call in `try { ... } catch { return <in-memory mock, from src/api/mockData.ts> }` —
  so these pages silently keep working (and keep *looking* like they work) even when the real
  endpoint 404s, is renamed, or the DTO shape doesn't match. **Never treat a page in this
  category as verified just because it renders** — check the Network tab / actual response.
  These pages also still use manual `useState`+`useEffect` instead of `useQuery`/`useMutation`.

When asked to wire up or fix a not-yet-migrated module, migrate it to the real pattern (dedicated
`<name>Api.ts` typed against `ApiEnvelope`/`PaginatedEnvelope`, TanStack Query hooks, no mock
fallback) rather than patching the try/catch — that fallback is legacy debt being deliberately
removed feature-by-feature, not a convention to extend. `INTEGRATION_PLAN.md`'s endpoint/type/enum
mismatch tables (§3–5) list the specific renames and shape differences already found between what
the frontend currently calls and what the backend actually exposes.

### API layer conventions (the target pattern)

- `src/api/axiosInstance.ts` — the one axios instance (`VITE_API_URL`, default
  `http://localhost:3000/api`), `withCredentials: true` (required for the backend's httpOnly
  refresh cookie). Access token is held in memory only via `tokenStore` — **never localStorage**
  — and attached per-request from there, never read from storage on boot.
- Token refresh: a single shared in-flight `refreshPromise` (`getOrCreateRefreshPromise()` in
  `axiosInstance.ts`) is used by both the response interceptor's 401-retry path and
  `AuthContext`'s boot-time `attemptSilentRefresh()`. Do not add a second, independent call to
  `POST /auth/refresh` anywhere — the backend's refresh token is single-use/rotating, so two
  concurrent calls race and one gets rejected. (This exact bug happened once, from React
  StrictMode double-invoking `AuthContext`'s mount effect — see the comments in
  `axiosInstance.ts` and `INTEGRATION_PLAN.md` §7 before changing this code.)
- `src/api/envelope.ts` — type every new API method's return against `ApiEnvelope<T>` /
  `PaginatedEnvelope<T>`, matching the backend's fixed `{success, message, data[, pagination]}`
  response shape, so a `.data` vs `.data.data` mistake is a compile error, not a runtime bug.
- `src/api/queryKeys.ts` — one block per feature; add a new module's keys here rather than
  inlining ad-hoc query-key arrays in a hook.
- Field-level permission gating: several backend entities omit fields entirely (not `null`) when
  the caller lacks a specific permission (e.g. `evisa.internal_cost.view`,
  `pricing.internal_cost.view`, `package.internal_cost.view`) — type these fields as optional
  (`field?:`) and never assume presence.
- Enums: the backend is 100% `UPPER_SNAKE_CASE` (e.g. `PART_PAID`, `NEW_INQUIRY`). For a migrated
  module, the enum value itself must be the backend's value — map to a human label only at render
  time via a per-module `labels.ts`, never store the Title-Case string as the type/value (the
  legacy mock-era code did this and it's the largest mechanical mismatch called out in
  `INTEGRATION_PLAN.md` §5).

### Auth & permissions

- `AuthContext` (`src/context/AuthContext.tsx`) restores a session only via the httpOnly refresh
  cookie on boot (`attemptSilentRefresh`) — never from localStorage. `hasPermission()` mirrors the
  backend's `PermissionsGuard` exactly: `user.isSuperAdmin` bypasses first, then a flat
  `permissions: string[]` membership check — never a role-name string comparison.
- `ProtectedRoute` (`src/routes/ProtectedRoute.tsx`) only gates "is anyone logged in" for a whole
  route subtree; per-page permission gating still goes through the separate `PermissionGuard`
  component/route-level permission props in `AppRoutes.tsx`.
- A logout or a failed silent-refresh must call `queryClient.clear()` before/while redirecting to
  `/login` — a new session must never inherit the previous user's cached query data.

### Feature module shape

Each `src/features/<name>/` holds its page component(s) plus, once migrated, a `hooks/` folder
with one `use<Name>Queries.ts` exporting `useQuery`/`useMutation` hooks (list/detail queries,
create/update/archive mutations). Mutations invalidate by query-key **prefix**
(`{ queryKey: ['leads'], exact: false }`), not just the exact variant the current page used, and
also invalidate any other feature's keys that the same write affects (e.g. converting a lead
invalidates `customers` and `dashboard` too, since it creates a Customer row and changes dashboard
counts) — grep other `use*Queries.ts` files for this cross-invalidation pattern before adding a
new mutation.
