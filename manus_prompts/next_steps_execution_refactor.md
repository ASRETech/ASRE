# Manus Prompt — ASRE Next Steps (Execution Refactor)

## Context
You are working inside the ASRE (Applied Strategy Real Estate) codebase.

The backend execution system (score, streaks, actions, leaderboard) is now functional and connected to the database.

However, the frontend architecture is partially migrated and inconsistent:
- Legacy routing (App.tsx) is still active
- New sidebar uses a different route structure (4-pillar model)
- Route paths are mismatched
- Some legacy features still exist in navigation

Your goal is to complete the transition to a clean, production-ready architecture centered around the **Execution OS as the core product**.

---

## Objectives (in order of priority)

### 1. Unify Routing Architecture (CRITICAL)

Replace the current routing system with a single consistent structure.

Actions:
- Replace App.tsx routing with AppRoutesReplacement
- Ensure all routes follow ONE consistent pattern:
  - /execution
  - /pipeline
  - /action-engine
  - /schedule-creator
  - /financials
  - /analytics
  - /coach
  - /team
  - /wealth
  - etc.

Rules:
- No duplicate route aliases
- No mixed prefixes like /execution/pipeline AND /pipeline
- Sidebar, routes, and layout must match exactly

Deliverable:
- Fully working routing system
- No broken links from sidebar

---

### 2. Align Sidebar With Routes

Update AppSidebar.tsx so every path EXACTLY matches the routing layer.

Actions:
- Fix all incorrect paths
- Remove dead or duplicate routes
- Ensure logo routes to /execution (NOT /journey)

Optional (recommended):
- Collapse or remove "FOUNDATION" section
- Keep product focused on 4 pillars

---

### 3. Update Dashboard Layout Titles

Update PAGE_TITLES in DashboardLayout.tsx to match final routes.

Ensure:
- Every active route has a correct title
- No legacy paths remain

---

### 4. Fix Action Completion Exploit (CRITICAL BACKEND)

The current completeAction() allows duplicate completions.

Fix:
- Prevent multiple completions of the SAME actionId for the SAME user on the SAME day

Implementation options:
A) Add DB uniqueness constraint (userId + actionId + date)
B) Check before insert and skip if already completed today

Also:
- Ensure idempotency (safe to retry)

Deliverable:
- No duplicate scoring
- Accurate daily counts

---

### 5. Improve Leaderboard Scope (PRODUCT LOGIC)

Current leaderboard is global.

Refactor to support scoped leaderboards:

Phase 1 (required):
- Keep global leaderboard

Phase 2 (implement structure):
- Add optional scope:
  - "cohort"
  - "team"
  - "market_center"

Design API to support:
getLeaderboard({ scope?: string })

---

### 6. Set Execution HQ as Core Entry Point

Update app flow:

If user is onboarded:
→ redirect to /execution

If not onboarded:
→ keep onboarding flow

---

### 7. Clean Up Legacy Surface Area

Audit and remove or de-prioritize:
- Journey
- Level
- Library
- Culture
- Redundant pages not tied to execution

Goal:
- Product feels like a focused operating system, not a feature collection

---

### 8. Polish UX Consistency

Ensure:
- Sidebar active states are correct
- Route transitions work
- No blank pages
- No 404s

---

## Output Requirements

You must:
1. Modify code directly
2. Keep changes minimal but correct
3. Do NOT introduce unnecessary abstractions
4. Maintain current tech stack (React, tRPC, Drizzle)

---

## Success Criteria

The system should:
- Launch into Execution HQ cleanly
- Have fully working navigation
- Have no route inconsistencies
- Prevent action completion abuse
- Feel like a single cohesive product

---

## Mindset

You are NOT adding features.

You are:
- Removing inconsistency
- Finalizing architecture
- Converting a prototype into a product foundation

Focus on clarity, alignment, and correctness.
