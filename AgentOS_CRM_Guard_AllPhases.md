# AgentOS CRM Guard — All Phases

**Version:** 12.0 | **Status:** Permanent Rule | **Applies to:** Every build prompt, every phase

---

## What AgentOS Is

AgentOS is a **business operating system** for real estate agents. It guides agents through the MREA 7-Level framework, tracks deliverable completion, manages coaching relationships, runs goal-setting workflows, and surfaces AI tools — all without functioning as a contact relationship manager.

---

## What AgentOS Is NOT

AgentOS is **not a CRM**. It does not:

- Auto-track when an agent last contacted a lead
- Store or display "last contacted" timestamps on lead records
- Generate AI outreach drafts automatically when a lead is added
- Calculate or display "days since last contact" metrics
- Suggest "next actions" based on contact history
- Score leads based on engagement frequency
- Provide a "Database Contacts Touched" metric or any similar contact-activity KPI
- Auto-screen marketing content for compliance (Fair Housing screening was removed in v12)

---

## Removed Fields — Never Re-introduce

The following fields were **permanently removed** from the schema and must never be added back:

| Field | Table | Reason |
|---|---|---|
| `lastContactedAt` | `leads` | CRM tracking — not AgentOS scope |
| `nextAction` | `leads` | CRM automation — not AgentOS scope |

The following **table** was permanently removed:

| Table | Reason |
|---|---|
| `complianceLogs` | Auto-compliance screening removed in v12 |

---

## Removed Features — Never Re-introduce

| Feature | Location | Reason |
|---|---|---|
| Auto-AI-response on lead creation | `Pipeline.tsx`, `routers.ts` | CRM automation |
| `daysSince()` helper | `Pipeline.tsx` | CRM contact tracking |
| "Xd ago" last-contact display | Pipeline kanban + list view | CRM contact tracking |
| Last Contact column | Pipeline list view | CRM contact tracking |
| Next Action column | Pipeline list view | CRM automation |
| AI Response drawer section | Pipeline lead drawer | CRM automation |
| "DB Contacts Touched" dashboard metric | `Dashboard.tsx` | CRM KPI |
| Compliance scan mutation | `Marketing.tsx` | Auto-screening removed |
| Compliance router | `routers.ts` | Compliance feature removed |
| Compliance page | `client/src/pages/Compliance.tsx` | Compliance feature removed |
| Compliance nav item | `AppSidebar.tsx` | Compliance feature removed |
| Compliance widget | `Dashboard.tsx` | Compliance feature removed |
| Follow-Up health score dimension | `Analytics.tsx` | Used `lastContactedAt` |

---

## Current Correct Implementations

These are the **correct** replacements that must be preserved:

| Feature | Correct Implementation |
|---|---|
| Pipeline kanban card date | Shows "Added [date]" using `new Date(lead.createdAt).toLocaleDateString()` |
| Pipeline list view | No Last Contact or Next Action columns |
| Dashboard metric | "Leads Added (30 days)" — counts `leads.createdAt > now - 30d` |
| Analytics Health Score | 5 dimensions: Lead Generation (25), Goal Setting (25), Transaction Activity (20), Deliverable Completion (15), Foundation Base (15) |
| Database Marketing tab | Stage-based segments (Past Clients, Sphere, Active Pipeline) + 36:12:3 manual planning calculator with "contacts in Command" input |
| Content Studio | Manual AI generation only — no auto-screen on generate |

---

## CRM Guard Checklist — Apply Before Every Build Goes Live

Before any new build is deployed, verify:

- [ ] `leads` table has no `lastContactedAt` or `nextAction` columns
- [ ] `routers.ts` has no `compliance:` router
- [ ] `Pipeline.tsx` has no `generateResponse()`, no `daysSince()`, no auto-mutation on lead add
- [ ] `Dashboard.tsx` has no compliance widget, no "DB Contacts Touched" metric
- [ ] `Analytics.tsx` health score uses Goal Setting dimension (not Follow-Up)
- [ ] `Marketing.tsx` ContentStudioTab has no `scanMutation`, no `screenResult` state
- [ ] No `Compliance.tsx` page exists in `client/src/pages/`
- [ ] `AppSidebar.tsx` has no Compliance nav item

---

## Positioning Block — Include at Top of Every Build Prompt

> **AgentOS is NOT a CRM. Do not build features that auto-track contact history, auto-generate outreach on lead creation, display "days since last contact", or score leads based on engagement frequency. AgentOS tracks business-level KPIs (GCI, deliverables, goals, coaching) — not individual contact interactions. Any feature that would belong in Follow Up Boss, Command, or HubSpot does NOT belong in AgentOS.**

---

## Zip Merge Protocol

When Trevor sends a `*_crm_clean.zip` for a new build:

1. Extract the zip and copy the specified files into the live project
2. Check if the zip snapshot is missing Phase 11+ tables (it usually is — the zip is taken before Phase 11 was added)
3. Re-append missing Phase 11 tables from the last git checkpoint: `git show <checkpoint_hash>:drizzle/schema.ts`
4. Re-insert the `models` router from the last git checkpoint: `git show <checkpoint_hash>:server/routers.ts`
5. Remove the `compliance` router if it reappears in the zip's `routers.ts`
6. Run the CRM Guard Checklist above
7. Run `pnpm db:push` → `npx tsc --noEmit` → `pnpm test`
8. Save checkpoint and deliver

---

*This file is a permanent project artifact. Do not delete or modify without Trevor's explicit approval.*
