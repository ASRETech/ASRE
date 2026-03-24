# ASRE Cleanup Matrix

This matrix tracks what should stay, what should be refactored or moved, and what should be deleted after migration as ASRE pivots to the 4-pillar architecture and Command/PCx alignment.

## Keep

| File / Area | Why Keep | Notes |
|---|---|---|
| `client/src/components/routing/AuthenticatedRoute.tsx` | Needed for protected 4-pillar routing | Keep and standardize usage across all protected routes |
| `client/src/pages/execution/ExecutionHome.tsx` | New Execution HQ entry point | Wire to `execution.getSummary` and `execution.getActions` |
| `client/src/pages/execution/TransactionsComingSoon.tsx` | Correct strategic placeholder while Command/CRM integration is designed | Keep until transaction sync is implemented |
| `client/src/components/execution/ExecutionScoreCard.tsx` | Core execution score UI | Wire to real data |
| `client/src/components/execution/Leaderboard.tsx` | Core engagement / cohort feature | Replace mock entries with team/pod data |
| `client/src/components/execution/StreakTracker.tsx` | Core retention mechanic | Persist streaks in backend |
| `server/domains/execution/types.ts` | New normalized execution domain contract | Continue using as canonical execution types |
| `server/domains/execution/scoring.ts` | Execution score foundation | Extend after action completion + streak persistence |
| `server/domains/execution/service.ts` | Execution intelligence layer | Replace temporary DB access strategy |
| `server/routers/execution.ts` | New execution router | Merge into root router and expand endpoints |
| `server/integrations/command/types.ts` | Provider-agnostic normalized entity setup | Keep as Command contract layer |
| `server/integrations/command/mapper.ts` | Decouples raw Command payloads from internal models | Keep and expand for opportunities/transactions |
| `ARCHITECTURE_PHASES_1_TO_4.md` | Strategic roadmap for migration | Keep as authoritative architecture doc |

## Refactor / Move

| File / Area | Action | Reason |
|---|---|---|
| `client/src/App.tsx` | Refactor to fully use 4-pillar routes | Still contains legacy routing in some branches / needs final route standardization |
| `client/src/components/AppSidebar.tsx` | Refactor to only show Execution / Performance / Growth / Vision | Still reflects legacy feature sprawl |
| `client/src/components/DashboardLayout.tsx` | Update title map and shell logic for new routes only | Still contains legacy page titles |
| `client/src/contexts/AppContext.tsx` | Reduce to UI/session shell state only, remove business truth responsibilities | Leads / transactions / financials should come from tRPC-backed data |
| `server/_core/index.ts` | Refactor into web-only runtime | Needs worker split and safer production boot pattern |
| `server/routers.ts` | Extract into domain routers (`execution`, `performance`, `growth`, `vision`, `integrations`) | Current monolithic router is too large and mixes unrelated concerns |
| `server/integrations/command/client.ts` | Replace stub endpoint and fake URL with env-driven client + typed error handling | Current implementation is placeholder-only |
| `server/domains/execution/service.ts` | Replace temporary global DB access with repository layer / real imports | Current access pattern is scaffolding, not production-safe |
| Legacy goal/model logic in `server/routers.ts` | Move relevant pieces into `vision` and `performance` domains | Keeps GPS/BOLD/wealth logic aligned with new architecture |
| Coaching logic in `server/routers.ts` | Move into `server/domains/growth/*` and `server/routers/growth.ts` | Needed for PCx-aligned coaching loop |
| Financial / KPI logic in `server/routers.ts` | Move into `server/domains/performance/*` | Performance should be derived in one place |
| Lead / transaction logic in `server/routers.ts` | Move into `server/domains/execution/*` + `server/routers/execution.ts` | Supports Command-first execution model |
| Tool / library / journey modules | Reposition as add-ons or secondary packages, not core nav | No longer core to the 4-pillar wedge |
| `PIVOT_IMPLEMENTATION_GUIDE.md` | Fold into `ARCHITECTURE_PHASES_1_TO_4.md` or archive | Overlaps with architecture roadmap |

## Delete After Migration

These should only be deleted **after** the replacement routes, services, and UI have been merged and verified.

| File / Area | Delete When | Reason |
|---|---|---|
| Legacy route entries in `client/src/App.tsx` for `/journey`, `/level`, `/dashboard`, `/library`, `/culture`, `/recruiting`, `/referrals`, `/reviews`, `/tools`, `/goals` | After 4-pillar routes are fully live | Old route surface no longer fits product focus |
| Legacy nav sections in `client/src/components/AppSidebar.tsx` (`JOURNEY`, `GOALS`, `TEAM`, `GROWTH`, `FOUNDATION` old versions) | After new sidebar is live | Prevents UX clutter and route confusion |
| `client/src/pages/Journey.tsx` | After onboarding and vision flows absorb any needed functionality | No longer a core pillar destination |
| `client/src/pages/CurrentLevel.tsx` | After level/progress is re-homed into Growth or Vision | Standalone page no longer needed |
| `client/src/pages/Dashboard.tsx` | After Execution HQ fully replaces it | Execution HQ becomes the real home screen |
| `client/src/pages/Library.tsx` | After deciding whether model library survives as add-on/admin module | Not part of core wedge |
| `client/src/pages/CultureOS.tsx` | After confirming it is not part of core Growth flow | Peripheral to current strategy |
| `client/src/pages/Recruiting.tsx` | After Growth/Team strategy is finalized | Recruiting is not a primary pillar right now |
| `client/src/pages/Referrals.tsx` | After deciding whether referrals remain a future package | Not core to Execution / Performance / Coaching loop |
| `client/src/pages/Reviews.tsx` | After deciding whether reviews remain a future package | Same reason as referrals |
| `client/src/pages/Tools.tsx` | After tool recommendations are re-homed or relegated to add-on module | AI tools should not be top-level core UX |
| `client/src/pages/Goals.tsx` | After GPS/BOLD/Wealth are moved into Vision | Redundant standalone destination |
| Legacy sections inside `server/routers.ts` once extracted | After domain routers are merged and tested | Remove monolith duplication |
| `PIVOT_IMPLEMENTATION_GUIDE.md` | After content is merged into architecture roadmap | Avoid duplicate planning docs |

## Recommended Deletion Order

1. De-route legacy pages from `App.tsx`
2. Remove legacy sidebar links
3. Confirm no imports remain
4. Delete obsolete pages/components
5. Delete extracted sections from `server/routers.ts`
6. Delete duplicate planning docs

## Safety Rule

Do **not** delete old files until:
- the new route is live,
- the new domain service is wired,
- and the user path has been tested.
