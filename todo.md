# AgentOS Phase 2 TODO

## Phase 1 (Complete)
- [x] Full-stack upgrade (web-db-user)
- [x] Database schema + API routes
- [x] AI coaching integration
- [x] Mobile optimization (all screens)
- [x] 6 deliverable builder modals
- [x] Vitest tests (20 passing)

## Phase 2 Fixes
- [x] Fix 1: Compliance — connect frontend to server AI endpoint (replace local keyword matcher)
- [x] Fix 1: Compliance — add compliance.list query for audit trail from DB
- [x] Fix 2: Dashboard — AI-powered Today's Focus (replace hardcoded mock data)
- [x] Fix 3: Culture OS — AI Mission Statement generation (guided questions + LLM)
- [x] Fix 4: Pipeline — AI lead response on new lead creation
- [x] Fix 5: Financials — add Economic Model tab (MREA reverse-engineered income)
- [x] Fix 5: Financials — add 90-Day Cash Flow Forecast tab

## Phase 2 New Modules
- [x] Marketing/Content Studio — Content Studio tab (AI generation + auto-compliance screening)
- [x] Marketing/Content Studio — Calendar tab (monthly content calendar)
- [x] Marketing/Content Studio — Database Marketing tab (segments + 36:12:3)
- [x] Marketing/Content Studio — Lead Magnets tab (static cards)
- [x] Analytics — Weekly Pulse tab (editable leading indicators + AI coaching)
- [x] Analytics — Conversion Funnel tab (CSS funnel + AI diagnosis)
- [x] Analytics — Source Attribution tab (sortable table)
- [x] Analytics — Business Health Score tab (CSS gauge + dimension bars)
- [x] Analytics — Frameworks tab (4-1-1, 36:12:3, GPS)
- [x] Team OS — Members tab (card grid + invite dialog)
- [x] Team OS — Org Chart tab (level-adaptive visual)
- [x] Team OS — Scorecards tab (per-member weekly indicators)
- [x] Team OS — Working Genius tab (Lencioni 6 types + gap analysis)
- [x] Team OS — L10 Meeting tab (EOS meeting runner with timer)

## Phase 2 Cleanup
- [x] AppSidebar — add Marketing, Analytics, Team nav items
- [x] App.tsx — register /marketing, /analytics, /team routes
- [x] Culture OS — persist to server via trpc.culture.upsert (debounced)
- [x] Current Level — level completion banner + advance level button
