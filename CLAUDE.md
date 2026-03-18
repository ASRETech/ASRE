# AgentOS

The business operating system for KW agents. "Command manages who you know. AgentOS manages how you build."

React + Vite + TailwindCSS v4 + Shadcn/ui frontend, Express + tRPC backend, Drizzle ORM + MySQL, Anthropic Claude API.

## Commands

- `pnpm dev` — start dev server (frontend + backend)
- `pnpm check` — TypeScript check (must be zero errors after every edit session)
- `pnpm test` — run all tests (must all pass before wrapping up)
- `pnpm db:push` — apply schema changes to DB
- `pnpm build` — production build check
- `pnpm format` — run Prettier

## Key Files

- `drizzle/schema.ts` — 27+ tables, source of truth for all data shapes
- `server/routers.ts` — all tRPC routers (~1,500 lines, 22 routers)
- `server/db.ts` — all database helper functions
- `client/src/lib/store.ts` — frontend state, Lead interface, app-wide types
- `client/src/contexts/AppContext.tsx` — global state and dispatch
- `client/src/App.tsx` — all routes
- `client/src/components/AppSidebar.tsx` — navigation

## Architecture

- AI calls use `invokeLLM()` from `server/_core/llm.ts` (Anthropic Claude API)
- Auth is session-cookie based
- tRPC for all client-server communication
- Wouter for client-side routing (NOT react-router)
- Shadcn/ui components in `client/src/components/ui/`

## Stack Rules

- Do NOT add packages without flagging it first. The stack is locked.
- Read the full file before editing it. Never make blind string replacements.
- Run `pnpm check` after every session of edits — zero TypeScript errors is non-negotiable.
- Run `pnpm test` before wrapping up — all existing tests must continue passing.

## CRM Guard — NEVER VIOLATE

AgentOS is NOT a CRM. It works above Command, not instead of it.

### Fields that MUST NOT exist on the leads table:
- `lastContactedAt` — REMOVED. Do not re-add.
- `nextAction` — REMOVED. Do not re-add.

### Behavior that MUST NOT exist anywhere:
- Auto-generating AI responses when a lead is added
- Calculating "days since last contact" from any field
- Hot/warm/cold lead segmentation based on contact timing
- Any background job that reads contact frequency from leads
- "DB Contacts Touched" metric on any dashboard
- Outreach Queue or stale lead detection

### What DOES exist and is correct:
- `createdAt` on leads → used for "Added [date]" display only
- `stage` on leads → manually set by agent
- `notes` on leads → manually written by agent
- 36:12:3 calculator → uses manually-entered database size, not leads.length
- Database Marketing segments → based on stage and source, not contact timing

### Health Score Formula (correct version):
```
leadGen  = min(25, leads added in last 30 days * 2)
goalScore = min(25, goal deliverables complete * 8)
txScore  = min(20, open transactions * 4)
delScore = min(15, all deliverables complete * 2)
base     = 15
Dimensions: Lead Generation, Goal Setting, Transactions, Deliverables, Foundation
NO Follow-Up dimension. NO Compliance dimension.
```

## Priority Order

When building features, work Priority 1 → 6 in order:
1. First Impressions (onboarding, dashboard empty state, journey map, current level)
2. Core Value Loop (AI daily focus, economic model, deliverable builders, weekly pulse)
3. Coaching Infrastructure (coach hub, pre-session brief, commitments, certification)
4. Shareable (business journey feed, client portal, AI tools directory)
5. Polish (empty states, mobile, loading states, error handling, nav)
6. Nice-to-have (Stripe, Google Calendar, Resend email, 36:12:3 calc, KW models)

## External Services (optional keys)

- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — show "Coming Soon" if missing
- `RESEND_API_KEY` — show "Email delivery not configured" if missing
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — show setup instructions if missing
