# ARS Visa & Consultants — Frontend

React (Vite) frontend for the ARS Visa & Consultants Management System.
Frontend only — the backend (Node/Express/MongoDB) is a separate project.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full folder,
routing, permission, API, component, data-fetching and validation
architecture, and the implementation-phase plan.

## Stack

React 19 · Vite · Tailwind CSS v4 · React Router v7 · Axios · TanStack Query
· React Hook Form + Zod · Recharts · FullCalendar · Lucide icons

## Getting started

```bash
npm install
cp .env.example .env      # set VITE_API_BASE_URL once the backend exists
npm run dev
```

The app currently requires a real backend to sign in — there is no mock/
fake auth (by design, see `docs/ARCHITECTURE.md` §5). Without a backend
running, `/login` will show a submit error and the dashboard will show its
`ErrorState` — both are the correct, intended behavior for a frontend-only
build against a REST contract that doesn't exist yet.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint |

## Status

Phase 1 (Foundation) is complete: auth, permission-aware routing/layout,
the Axios client, and the full shared component library. Every sidebar
destination beyond the dashboard renders a permission-gated "coming soon"
placeholder until its phase (§48 of the spec) is implemented.
