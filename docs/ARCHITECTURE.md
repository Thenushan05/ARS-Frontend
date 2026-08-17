# ARS Visa & Consultants — Frontend Architecture

This document is the §49 deliverable: folder structure, routing, layout,
permission, API, component, data-fetching, and validation architecture —
written before Phase 2+ feature pages are built on top of the Phase 1
foundation implemented alongside this document.

---

## 1. Folder structure

Feature-based, under `client/src` (this repo's client root is `frontend/`,
by agreement with the project owner — the spec's `ars-visa-management/client`
layout is otherwise followed as-is):

```text
src/
├── api/                 # axiosInstance + one *Api.js module per feature
├── assets/
├── components/
│   ├── common/          # PermissionGuard, StatusBadge, StatCard, selectors, buttons/cards, Toaster...
│   ├── forms/            # RHF-bound inputs: FormField, TextInput, SelectInput, TextAreaInput, PasswordInput
│   ├── tables/            # DataTable, Pagination, SearchBar, FilterBar, DateRangePicker
│   ├── charts/            # ChartCard (Recharts wrapper)
│   ├── modals/            # Modal, ConfirmationDialog, FormDialog, Drawer
│   ├── upload/            # FileUploader, FilePreview
│   └── layout/            # AppSidebar, AppHeader, Breadcrumb
├── features/              # one folder per business domain (see §4) — pages/components/api/hooks
├── hooks/                 # useAuth, usePermission, useToast, useDebounce
├── context/               # AuthContext, PermissionContext, ToastContext
├── constants/             # roles, permissions, routes, menuConfig, statusColors
├── layouts/               # MainLayout (staff), AuthLayout, CustomerPortalLayout
├── routes/                # AppRoutes, ProtectedRoute, PermissionRoute
├── utils/                 # cn, formatCurrency, formatDate
├── App.jsx                # provider tree
└── main.jsx
```

Every `features/<name>/` folder was scaffolded with `pages/`, `components/`,
`api/`, `hooks/` subfolders up front (§4) so later phases drop files into a
structure that already exists, instead of improvising one per feature.

## 2. Route architecture

Single registry: **`constants/routes.js`** defines every path once;
**`constants/menuConfig.js`** maps each sidebar item to a path, icon and
required permission, importing from `routes.js`. `routes/AppRoutes.jsx`
builds the actual `<Routes>` tree from the same `MENU_ITEMS` array — a menu
entry and its route can never drift apart because they're generated from
one source.

Layered guards, applied in this order for every staff route:

```text
<ProtectedRoute>              — is there a session at all? (redirects to /login)
  <MainLayout>                 — sidebar + header shell
    <PermissionRoute perm=X>   — does this user have permission X? (redirects to /403)
      <FeaturePage/>
```

`ProtectedRoute` remembers the attempted path (`location.state.from`) so
`LoginPage` returns the user to where they were headed. `PermissionRoute` is
deliberately a *second*, independent check from the sidebar's own
permission filter — hiding a link is not access control, so a directly
typed URL is checked again at the route level (§6, §37).

The customer-facing tree (`/portal/*`, §34) mounts `CustomerPortalLayout`
under the same `ProtectedRoute` for now; if customer auth ends up on a
separate token/session scheme from staff auth, this becomes its own
`ProtectedCustomerRoute` — isolated to `routes/AppRoutes.jsx`, nothing else
changes.

Until each feature's real page exists (§48 phases), its route renders
`<ComingSoonPage>` behind the correct permission — so navigation and access
control are provably correct before there's a page behind them.

## 3. Layout architecture

Three layout shells, chosen per route subtree:

- **`MainLayout`** — staff/admin: fixed `AppSidebar` (collapses to an
  off-canvas drawer under `lg`) + `AppHeader` (search, notifications, user
  menu) + scrollable `<Outlet/>`. Every feature page renders its own
  `PageHeader` (title, breadcrumb, actions) inside that outlet rather than
  the layout owning page-specific chrome.
- **`AuthLayout`** — centered card for Login / Forgot Password.
- **`CustomerPortalLayout`** — mobile-first: slim top bar + bottom tab bar,
  max-width column, no sidebar. Optimized for the phone-first customer
  audience (§45) as opposed to the desktop-dense staff app.

`AppSidebar` filters `MENU_ITEMS` through `usePermission()` before
rendering — see §4 below for why that's UX-only.

## 4. Permission-aware UI architecture

Single flow, backend-issued, never role-derived on the frontend:

```text
login/refresh response → user.role, user.permissions: string[]
        │
   AuthContext (owns `user`)
        │
   PermissionContext  →  Set(user.permissions)
        │
   usePermission() → { can(key), canAny([...]), canAll([...]) }
        │
   <PermissionGuard permission="finance.profit.view"> ... </PermissionGuard>
   <PermissionRoute permission="staff.manage" />
   AppSidebar filtering MENU_ITEMS
```

`constants/permissions.js` is the full key catalog (`"<module>.<resource>.<action>"`),
shared vocabulary between frontend and backend. `constants/roles.js` is
**display-only** (role badges, staff forms) — it is never used to compute
access; only `user.permissions` is. This directly implements §6/§7/§37: the
frontend hides UI for UX, the backend is the actual security boundary, and
restricted financial keys (`finance.cost.view`, `finance.profit.view`,
`finance.supplier_cost.view`) exist as their own permissions distinct from
the general `*.view`/`*.manage` keys so "can see selling price" and "can see
cost/profit" are always separately grantable.

## 5. API integration architecture

One Axios instance (`api/axiosInstance.js`), one file per feature
(`api/customersApi.js`, `api/pricingApi.js`, ...) — components and hooks
never call `axios` directly (§41).

```text
component → useQuery/useMutation → <feature>Api.method() → axiosInstance → REST API
```

`axiosInstance` owns the JWT/refresh-token lifecycle (§5) so no feature API
file has to think about it:

- Access token lives in memory only (`api/tokenStore.js`), never
  localStorage — limits XSS blast radius.
- Refresh token is assumed to be an httpOnly cookie the backend sets;
  `axiosInstance` calls `/auth/refresh` with `withCredentials: true`.
- A response interceptor catches `401`s, refreshes once (concurrent 401s
  share one in-flight refresh promise), retries the original request, and
  — if refresh itself fails — clears the token and fires a
  `ars:session-expired` window event that `AuthContext` listens for to log
  the user out automatically (§5 "automatic logout when session expires").

Only `authApi.js` plus the minimal `search()` endpoints backing the four
shared selectors (`customersApi`, `visaCasesApi`, `pricingApi`, `staffApi`)
exist as of Phase 1 — the rest of the modules listed in §41 are added
feature-by-feature per the §48 phase order, following the same pattern
(thin, typed request/response mapping, no logic beyond that).

## 6. Shared component plan

Grouped by `components/<folder>` per §4/§40; the full current inventory:

| Folder | Components |
|---|---|
| `common/` | Button, Card, PageHeader, StatusBadge, CurrencyDisplay, StatCard, PermissionGuard, EmptyState, ErrorState, LoadingSkeleton/TableSkeleton, Toaster, AsyncSelect + CustomerSelector/CaseSelector/ServiceSelector/StaffSelector, ComingSoonPage |
| `forms/` | FormField, TextInput, PasswordInput, SelectInput, TextAreaInput |
| `tables/` | DataTable, Pagination, SearchBar, FilterBar, DateRangePicker |
| `charts/` | ChartCard |
| `modals/` | Modal (base), ConfirmationDialog, FormDialog, Drawer |
| `upload/` | FileUploader, FilePreview |
| `layout/` | AppSidebar, AppHeader, Breadcrumb |

Each entity selector (`CustomerSelector`, etc.) is a thin, labeled wrapper
around one generic `AsyncSelect` — new entity pickers should follow that
pattern rather than reimplementing combobox behavior. `DataTable` never
paginates/sorts/filters client-side (§42) — it renders whatever page the
caller already fetched and emits `onSortChange`/row-click callbacks; the
caller (via TanStack Query) owns the actual params.

## 7. Data-fetching strategy (TanStack Query)

- All server reads go through `useQuery`, all writes through `useMutation`
  — no `useEffect` + manual `axios` calls in feature code.
- Query keys are arrays scoped by feature and current params, e.g.
  `['customers', 'list', { page, search, filters }]`, so pagination/search/
  filter changes each get their own cache entry and back/forward
  navigation doesn't show stale results.
- Global defaults (`App.jsx`): `retry: 1`, `staleTime: 30s`,
  `refetchOnWindowFocus: false` — enough retry to survive a blip, short
  enough staleness that another staff member's edit shows up soon, no
  refetch storms when a user tabs back in mid-task.
- Every query-driven component implements the full state set from §44 via
  the shared components: `isLoading` → `TableSkeleton`/`LoadingSkeleton`,
  empty data → `EmptyState`, `isError` → `ErrorState` with `onRetry`, and
  `isFetching` (background refetch) as a subtle inline indicator rather
  than a full-page spinner.
- Mutations invalidate the affected query keys on success and surface
  errors via `useToast()`; the mutation's own values are never used to
  optimistically recompute money fields — success just triggers a refetch
  of the authoritative backend numbers (§20/§47).

## 8. Form validation strategy (React Hook Form + Zod)

- Each feature owns a `schemas.js` (see `features/auth/schemas.js`) of Zod
  objects — one schema per form, colocated with that feature.
- Forms use `useForm({ resolver: zodResolver(schema) })`; every input is a
  forwardRef component (`TextInput`, `SelectInput`, ...) so it can be
  `register()`'d directly, with a `hasError` prop for styling and
  `FormField` wrapping it for the label/error/hint row.
- Validation coverage required everywhere (§43): required fields, email,
  phone, passport format, numeric/positive amounts, valid dates, file
  type/size (`FileUploader`'s `accept`/`maxSizeMb`). Cross-field and
  business-rule validation (e.g. "refusal reason required if status =
  Refused") lives in `.refine()`/`.superRefine()` on the relevant schema.
- Client-side validation is a UX layer only — the backend re-validates
  everything; a 422 from the API is mapped back onto the relevant field via
  `setError()` where the shape allows it, otherwise shown as a form-level
  banner (see `LoginPage`'s `serverError` state for the pattern).

---

## Implementation status

**Phase 1 — Foundation: done.** Vite + Tailwind v4, router, Auth context
(login/2FA-ready/refresh/logout), Permission context, MainLayout/AuthLayout/
CustomerPortalLayout, Axios client with refresh-token handling, and the
full shared component set above.

Phases 2–7 (§48) are not yet built — their routes exist and are
permission-gated but render `ComingSoonPage` until each phase lands.
