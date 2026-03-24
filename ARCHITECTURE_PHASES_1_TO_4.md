# ASRE 4-Phase Architecture Roadmap

This document defines the phased migration from the current monolithic AgentOS codebase to a KW Command-compatible, PCx-aligned platform.

## Strategic Principle

- KW Command = system of record for CRM / opportunity / transaction source data
- ASRE = system of action, coaching, performance, and behavioral intelligence
- PCx = execution + accountability framework powered by ASRE

## Phase 1 — 4-Pillar Product Shell

### Goal
Collapse the product into:
- Execution
- Performance
- Growth
- Vision

### Deliverables
- Execution HQ becomes primary logged-in route
- Sidebar collapses into 4 pillars
- Protected routing enforced through a shared route guard
- Transactions intentionally marked as integration-driven / coming soon

### Architectural Outcomes
- Better UX focus
- Lower surface area
- Cleaner handoff to domain services

## Phase 2 — Domain Extraction

### Goal
Move business logic out of the giant `server/routers.ts` file and into domain services + domain routers.

### Deliverables
- `server/domains/execution/*`
- `server/domains/performance/*`
- `server/domains/growth/*`
- `server/domains/vision/*`
- new routers that call these services

### Architectural Outcomes
- testable service layer
- easier partner-facing integration
- cleaner ownership boundaries

## Phase 3 — KW Command Integration Layer

### Goal
Build a command adapter and normalized entity model so ASRE can sync external data without coupling domain logic to raw provider payloads.

### Deliverables
- `server/integrations/command/client.ts`
- `server/integrations/command/mapper.ts`
- `server/integrations/command/sync.ts`
- `server/integrations/command/types.ts`
- connection + sync state tables

### Architectural Outcomes
- provider abstraction
- future Launchpad readiness
- read-first sync strategy

## Phase 4 — PCx Execution Loop

### Goal
Turn synced Command data into execution recommendations, scorecards, and coaching briefs.

### Deliverables
- execution score
- pipeline health
- coaching briefs
- cohort dashboards
- accountability snapshots

### Architectural Outcomes
- real product moat
- partner-fit with PCx
- defensible derived data system

## Recommended Build Order
1. Product shell
2. Domain services
3. Command adapter
4. Coaching loop + scorecards

## Definition of Done
The platform is ready for partnership conversations when:
- core data model is provider-agnostic
- action engine uses normalized entities
- coaching views are derived from synced production data
- CRM replacement language is removed from positioning
