
# ENT Clinic CRM — Foundation Setup

MVP for a single ENT doctor. This step builds only the shell: layout, routing, design tokens, navigation, and empty module pages. No data logic, no Supabase calls yet (preparation only).

## 1. Design System (`src/styles.css`)

Calm clinical aesthetic — not generic SaaS purple. Soft white background, deep teal primary, warm neutral text.

- `--primary`: deep teal (`oklch(0.55 0.09 200)`)
- `--accent`: soft mint for highlights
- `--background`: near-white (`oklch(0.99 0.005 200)`)
- `--card`: pure white with subtle border
- `--foreground`: slate-900 ish
- `--muted`: cool gray
- Custom tokens: `--shadow-card`, `--shadow-elevated`, `--gradient-header`, `--radius: 0.75rem`
- Font: Inter via `<link>` in `__root.tsx` head; `--font-sans` mapped in `@theme`
- Dark mode tokens included but app defaults to light (medical context)

## 2. Routing Structure

```text
src/routes/
  __root.tsx                  (shell + Inter font link + QueryClient)
  index.tsx                   (redirect to /dashboard)
  auth.tsx                    (placeholder sign-in screen)
  _authenticated/
    route.tsx                 (Supabase-managed auth gate — created when Cloud enabled later; for now a simple pass-through layout under a non-underscore folder)
  dashboard.tsx               (overview: stat cards, upcoming follow-ups placeholder)
  patients.tsx                (layout w/ Outlet)
  patients.index.tsx          (patient list placeholder)
  patients.new.tsx            (create patient placeholder)
  patients.$patientId.tsx     (patient profile layout w/ tabs Outlet)
  patients.$patientId.index.tsx       (Overview tab)
  patients.$patientId.visits.tsx      (Visits tab)
  patients.$patientId.surgeries.tsx   (Surgeries tab)
  patients.$patientId.treatments.tsx  (Treatments tab)
  patients.$patientId.followups.tsx   (Follow-ups tab)
  patients.$patientId.timeline.tsx    (Timeline tab)
  visits.tsx                  (global visits list placeholder)
  surgeries.tsx               (global surgeries list placeholder)
  followups.tsx               (upcoming follow-ups placeholder)
  settings.tsx                (placeholder)
```

Auth gate note: Cloud isn't enabled yet, so for this step routes are not actually protected. The `_authenticated` managed layout will be added when Cloud is enabled in a later step. Pages are public placeholders for now.

Each route file sets a unique `head()` title/description.

## 3. App Shell Layout

Sidebar + topbar dashboard using shadcn `Sidebar`:

- `src/components/layout/AppSidebar.tsx` — collapsible icon sidebar with sections:
  - Dashboard, Patients, Visits, Surgeries, Follow-ups, Settings
  - Lucide icons: LayoutDashboard, Users, Stethoscope, Scissors, CalendarClock, Settings
  - Active route highlighting via `useRouterState`
- `src/components/layout/AppHeader.tsx` — `SidebarTrigger`, global patient search input (non-functional placeholder), user menu stub
- `src/components/layout/AppShell.tsx` — wraps `SidebarProvider` + sidebar + header + `<main>` with `<Outlet />`
- Applied in a pathless layout `src/routes/_app.tsx` so all dashboard routes share the shell; auth route stays outside

## 4. Reusable UI Primitives (`src/components/common/`)

- `PageHeader.tsx` — title, description, actions slot
- `SectionCard.tsx` — titled card wrapper (uses shadcn Card)
- `EmptyState.tsx` — icon + heading + description + CTA
- `StatCard.tsx` — metric card for dashboard (label, value, icon, trend)
- `DataTable.tsx` — thin wrapper around shadcn Table with empty/loading states
- `PatientAvatar.tsx` — initials avatar
- `LoadingState.tsx` — skeleton block
- `ConfirmDialog.tsx` — wraps AlertDialog

## 5. Module Organization (Supabase-ready, no calls yet)

```text
src/modules/
  patients/{types.ts, queries.ts (stub), components/}
  visits/{types.ts, queries.ts, components/}
  surgeries/{types.ts, queries.ts, components/}
  treatments/{types.ts, queries.ts, components/}
  followups/{types.ts, queries.ts, components/}
```

Each `types.ts` defines the entity interface mirroring the planned DB (Patient → Visits → Surgeries → Treatments → Medications → Follow-ups). `queries.ts` exports placeholder `queryOptions` factories returning empty arrays so loaders/components can be wired later without refactors.

## 6. Dashboard Page

Static placeholder with:
- 4 StatCards (Total Patients, Visits Today, Upcoming Follow-ups, Surgeries This Month) — all show "—"
- Two SectionCards: "Recent Patients" and "Upcoming Follow-ups" with `EmptyState`

## 7. Patient Profile Tabs

`patients.$patientId.tsx` renders:
- Patient header (avatar, name, age/sex, contact — all placeholder)
- Tab nav using `Link` to the six sub-routes (Overview, Visits, Surgeries, Treatments, Follow-ups, Timeline)
- `<Outlet />` for tab content; each tab page renders an `EmptyState`

## 8. Cleanup

- Remove placeholder content from `src/routes/index.tsx` (redirect to `/dashboard`)
- Update root `head()` to "ENT Clinic CRM"
- Add Inter font `<link>` in `__root.tsx` head

## Out of Scope (later phases)

- Enabling Lovable Cloud / Supabase tables, RLS, auth screens
- Any CRUD logic, forms validation, real data fetching
- Timeline aggregation, search functionality
- Settings content

After this foundation is in place, work stops and waits for the next instruction (likely Phase 1: enable Cloud + auth).
