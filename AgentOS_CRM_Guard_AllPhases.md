# AgentOS — CRM Guard: All Phases
# Read Before Sending Any Build Prompt to Manus
# Applied Strategy Real Estate | Trevor Amrein

**Version:** 13.0 | **Status:** Permanent Rule | **Applies to:** Every build prompt, every phase

---

## THE RULE — MEMORIZE THIS BEFORE READING ANYTHING ELSE

AgentOS is NOT a CRM. It does not replace Command.
It does not track contacts, monitor touchpoints, or flag stale leads.
All leads and transactions are manually entered by the agent.
Command manages who you know. AgentOS manages how you build.

Any feature, field, query, or UI element that implies the platform
automatically knows the last time an agent contacted someone
is a CRM promise AgentOS cannot keep.

This document is the pre-flight checklist for every phase prompt
before it goes to Manus. If a prompt contains any of the patterns
flagged below, fix it first.

---

## STATUS BY PHASE

| Phase | File | CRM Status |
|-------|------|------------|
| Phase 4 | AgentOS_Phase4_Feature_Prompt.md | ✅ CLEAN (fixed) |
| Phase 5 | AgentOS_Phase5_Coaching_Platform.md | ✅ CLEAN (already correct) |
| Phase 6 | Built in v6.0 | ✅ CLEAN (reviewed) |
| Phase 7+ | Not yet written | ⚠️ Apply guard before writing |

---

## WHAT WAS REMOVED FROM v6.0 (DO NOT RE-ADD)

These features were explicitly removed from the current codebase.
Manus must never rebuild them, even if a future prompt accidentally
includes them.

### Schema fields — permanently removed from `leads` table:
```
lastContactedAt: timestamp("lastContactedAt")
nextAction: text("nextAction")
```

### Server behavior — permanently removed:
- Auto-generate AI response on lead creation (fire-and-forget)
- Any cron job or background process that reads `lastContactedAt`
- Any query that filters leads by "days since last contact"
- Stale lead detection logic of any kind

### Frontend — permanently removed:
- "Xd ago" / "days ago" display on kanban cards
- "Last Contact" column in list views
- "Next Action" column in list views
- AI Response section auto-triggered on lead creation
- "DB Contacts Touched" metric on Dashboard
- Hot/warm/cold lead segmentation (was calculated from `lastContactedAt`)
- `daysSince()` helper function in Pipeline.tsx
- Follow-Up dimension in Business Health Score (replaced with Goal Setting)

### What replaced them:
- Kanban cards show "Added [date]" using `createdAt`
- Dashboard shows "Leads Added (30 days)" using `createdAt`
- Health Score shows "Goal Setting" dimension based on deliverable completion
- Database Marketing tab shows stage-based segments + manual 36:12:3 calculator

---

## FIELD-BY-FIELD RULING — EVERY CRM-ADJACENT FIELD IN THE CODEBASE

### `lastContactedAt` on `leads` — REMOVED. Do not re-add.

### `lastContactedAt` on `recruits` — REMOVED in Phase 4 fix.
Contact activity for recruits lives in the `notes` text field.
Agents write notes manually. No auto-tracking.
The kanban card shows "Days in stage" from `updatedAt`, not "last contacted."

### `lastTouchDate` on `referralPartners` — STAYS. This is acceptable.
WHY: The "Mark Touched" button explicitly sets this to today.
It is agent-initiated, not auto-detected.
The amber "at-risk" indicator is based on a manually-set date.
This is the same pattern as a CRM reminder system, which is fine.
AgentOS doesn't claim to know when the agent last called someone —
it only knows when the agent pressed "Mark Touched."

### `nextFollowUpAt` on `recruits` — STAYS. This is acceptable.
It's a manually-set date reminder. The agent picks a date.
AgentOS doesn't auto-calculate it or infer it from any behavior.

### `nextTouchDate` on `referralPartners` — STAYS. Same reason.

### `createdAt` on `leads` — STAYS and is the correct field to use.
Used for "Added [date]" kanban display, "Leads Added (30 days)" dashboard
metric, and any time-based pipeline counting that doesn't require
knowing when the agent contacted anyone.

---

## QUERIES — WHAT IS ALLOWED AND WHAT IS NOT

### ALLOWED — these do not imply automatic contact tracking:
```typescript
// Leads added in the last 30 days
leads.filter(l => new Date(l.createdAt).getTime() > Date.now() - d30)

// Active pipeline (not closed or dead)
leads.filter(l => !['Closed', 'Dead', 'Nurture'].includes(l.stage))

// Past clients by stage
leads.filter(l => l.stage === 'Closed')

// Sphere by source tag
leads.filter(l => l.source === 'Sphere of Influence')
```

### NOT ALLOWED — these imply automatic contact tracking:
```typescript
// DO NOT USE — implies platform knows when agent last called someone
leads.filter(l => l.lastContactedAt && new Date(l.lastContactedAt) > ...)

// DO NOT USE — implies stale lead detection
leads.filter(l => daysSince(l.lastContactedAt) > 30)

// DO NOT USE — implies the platform is a CRM
const recentlyContacted = leads.filter(l => l.lastContactedAt && ...)

// DO NOT USE — implies touch tracking
const hot = leads.filter(l => (now - new Date(l.lastContactedAt)) < d90)
```

---

## HEALTH SCORE — CORRECT FORMULA

The Business Health Score must never include a "Follow-Up" or
"Recently Contacted" dimension. The correct dimensions are:

```typescript
// Lead Generation (25 pts) — based on leads ADDED, not leads contacted
const leadGen = Math.min(25, leads.filter(
  l => new Date(l.createdAt).getTime() > now - d30
).length * 2);

// Goal Setting (25 pts) — based on deliverable completion
const goalScore = Math.min(25, deliverables.filter(
  d => d.isComplete && ['economic-model', 'lead-gen-plan', '411-tracker']
    .includes(d.deliverableId)
).length * 8);

// Transactions (20 pts) — based on active transactions
const txScore = Math.min(20, transactions.filter(
  t => t.status !== 'closed'
).length * 4);

// Deliverables (15 pts) — based on MREA deliverable completion
const delScore = Math.min(15, deliverables.filter(d => d.isComplete).length * 2);

// Base (15 pts) — always-on floor score
const base = 15;
```

**NEVER add a dimension calculated from `lastContactedAt`.**
**NEVER add a "Compliance" dimension (compliance tool was removed).**

---

## COHORT DASHBOARD HEALTH SCORE — CORRECT FORMULA

The `cohortDashboard` query in the Coach Hub calculates a health score
for each agent the coach oversees. This must NOT use `lastContactedAt`.

Correct formula (already in Phase 5 saved file — do not change):

```typescript
const recentLeads = leads.filter(
  l => new Date(l.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
).length;

const healthScore = Math.min(100,
  Math.min(30, recentLeads * 3) +                                    // lead entry activity
  Math.min(40, deliverables.filter(d => d.isComplete).length * 3) +  // deliverable completion
  30                                                                   // base score
);
```

What this measures: are agents actively using the platform (adding leads,
completing deliverables)? It does not measure whether they called someone.

---

## PRE-SESSION BRIEF — CORRECT FORMULA

The `generatePreBrief` mutation generates an AI coaching question before
each session. The health score input must not include `lastContactedAt`.

Correct (already in Phase 5 saved file — do not change):
```typescript
const healthScore = Math.min(100,
  Math.min(30, leads.filter(
    l => new Date(l.createdAt).getTime() > Date.now() - 30*24*60*60*1000
  ).length * 3) +
  Math.min(40, deliverables.filter(d => d.isComplete).length * 3) +
  30
);
```

The AI prompt uses: MREA level, health score, commitment completion rate,
active pipeline count, and top incomplete deliverable. It does NOT
reference contact frequency, days since last call, or any CRM data.

---

## THE 8X8, 33 TOUCH, AND 36:12:3 FRAMEWORKS

These frameworks STAY in AgentOS as educational planning tools.
They live in the KW Model Library. They are reference content.

### What the platform does:
- Documents each framework as an active reference (not a PDF, an interactive tool)
- The 36:12:3 calculator accepts a manually-entered database size and
  outputs a weekly contact target
- The 8x8 and 33 Touch programs are laid out as structured plans
  agents read, understand, and execute in Command

### What the platform does NOT do:
- Track 8x8 enrollments
- Track 33 Touch progress per contact
- Flag contacts that haven't been touched in X days
- Auto-calculate lead temperatures from contact frequency
- Sync with Command or any external contact database

### Exact language to include in any prompt that references these frameworks:
```
The [framework] is a reference and planning tool in the KW Model Library.
Agents read the framework, plan their approach, and execute in Command.
AgentOS does not track execution or sync with Command.
Do not build enrollment tracking, progress tracking per contact,
or any automated reminder based on contact history.
```

---

## THE DATABASE MARKETING TAB — CORRECT IMPLEMENTATION

The DatabaseMarketingTab component must display:

1. Stage-based segments (calculated from `stage` field — no `lastContactedAt`):
   - Past Clients: `leads.filter(l => l.stage === 'Closed')`
   - Sphere: `leads.filter(l => l.source === 'Sphere of Influence')`
   - Active: `leads.filter(l => !['Closed', 'Dead'].includes(l.stage))`

2. The 36:12:3 calculator with:
   - A MANUAL INPUT for database size labeled "contacts in Command"
   - A footer note: "Execute your plan in Command. Use the 4-1-1 in your
     Goal Center to track weekly contact activity against this target."
   - Primary output: weekly contact target (not projected transactions alone)

3. NO hot/warm/cold segmentation (removed — was calculated from `lastContactedAt`)
4. NO "Send Campaign" buttons (implies automated outreach)

---

## PHASE 7–11 — PATTERNS TO AUDIT BEFORE SENDING TO MANUS

Phases 7–11 have not been written yet. Before writing them, apply these
guards to any feature involving:

### Automation Engine (was Phase 8)
If/when an automation engine is built, the following jobs are PROHIBITED:
- Stale lead detection job (reads `lastContactedAt`)
- Auto-responder job (generates and sends AI responses automatically)
- Outreach Queue (auto-populated from contact history)
- Weekly pulse auto-fill from contact data

PERMITTED automation jobs:
- Daily Focus generation (from deliverables, GPS, commitments — no contact data)
- Coach digest email (from deliverables and commitments — no contact data)
- Session reminder emails (scheduled date-based, no contact tracking)
- Transaction milestone reminders (based on transaction status changes — manual triggers)

### KW Models / Model Library (was Phase 11)
Do NOT build:
- `getDatabaseHealthScore()` function (uses `lastContactedAt`)
- `eightByEight` enrollment tracking table
- `thirtyThreeTouch` enrollment tracking table

DO build (reference content only):
- 8x8 program documented as a structured plan with steps the agent executes in Command
- 33 Touch program documented as an annual touch plan the agent runs in Command
- 36:12:3 calculator (manual input, planning output only)

### Any future CRM-adjacent schema fields
Before adding any field to any table in a future phase, ask:
"Does this field get auto-populated by the platform, or does the agent
set it manually?" If auto-populated from behavioral data (call logs,
email opens, website visits), do not add it.

---

## THE POSITIONING LINE — USE VERBATIM IN EVERY MANUS PROMPT

Every phase prompt sent to Manus must begin with this block:

```
AGENTOS POSITIONING — READ BEFORE BUILDING ANYTHING

AgentOS is NOT a CRM. It does not replace Command.
It does not track contacts, manage a database, or monitor touchpoints.
Transactions and pipeline entries are manually added by the agent.
Command manages who you know. AgentOS manages how you build.

DO NOT build features that:
- Auto-track when an agent last contacted a lead
- Flag stale leads based on contact history
- Auto-populate fields from behavioral data
- Sync contact data with Command or any external CRM
- Generate or send automated responses without explicit agent action

If you encounter a feature request in this prompt that conflicts with
the above, flag it before building and do not implement it without
explicit written confirmation.
```

---

## VERIFICATION QUESTIONS — RUN BEFORE SENDING ANY PROMPT

1. Does any new schema field get auto-populated from agent behavior?
   If yes: remove it or make it manual-only with explicit agent action.

2. Does any new query filter by `lastContactedAt` or equivalent?
   If yes: replace with `createdAt`, `stage`, or deliverable completion.

3. Does any UI element display "X days ago" referring to contact timing?
   If yes: replace with "Added [date]" or "Days in stage."

4. Does any new feature imply the platform tracks conversations?
   If yes: remove the tracking, keep only manual logging.

5. Does any automation job fire without explicit agent trigger?
   If yes: make it agent-triggered or remove it.

6. Does any health score component measure contact frequency?
   If yes: replace with deliverable completion or pipeline entry count.

7. Does the KW Model Library reference 8x8 or 33 Touch tracking tables?
   If yes: make them reference content only, remove tracking tables.

---

*AgentOS CRM Guard — All Phases*
*Applied Strategy Real Estate | asre.tech*
*Last updated: March 2026*

---

## ZIP MERGE PROTOCOL

When Trevor sends a  for a new build:

1. Extract the zip and copy the specified files into the live project
2. Check if the zip snapshot is missing Phase 11+ tables (it usually is — the zip is taken before Phase 11 was added)
3. Re-append missing Phase 11 tables from the last git checkpoint: `git show <checkpoint_hash>:drizzle/schema.ts`
4. Re-insert the `models` router from the last git checkpoint: `git show <checkpoint_hash>:server/routers.ts`
5. Remove the `compliance` router if it reappears in the zip's `routers.ts`
6. Run the CRM Guard Checklist above
7. Run `pnpm db:push` → `npx tsc --noEmit` → `pnpm test`
8. Save checkpoint and deliver

---

## CRM GUARD CHECKLIST — APPLY BEFORE EVERY BUILD GOES LIVE

Before any new build is deployed, verify:

- [ ] `leads` table has no `lastContactedAt` or `nextAction` columns
- [ ] `routers.ts` has no `compliance:` router
- [ ] `Pipeline.tsx` has no `generateResponse()`, no `daysSince()`, no auto-mutation on lead add
- [ ] `Dashboard.tsx` has no compliance widget, no "DB Contacts Touched" metric
- [ ] `Analytics.tsx` health score uses Goal Setting dimension (not Follow-Up)
- [ ] `Marketing.tsx` ContentStudioTab has no `scanMutation`, no `screenResult` state
- [ ] No `Compliance.tsx` page exists in `client/src/pages/`
- [ ] `AppSidebar.tsx` has no Compliance nav item

*This file is a permanent project artifact. Do not delete or modify without Trevor's explicit approval.*
