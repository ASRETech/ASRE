/**
 * App.tsx — ASRE Canonical Route Map
 *
 * CANONICAL NESTED ROUTE STRUCTURE (4-pillar):
 *
 *   PILLAR 1 — EXECUTION
 *     /execution                        → Execution HQ (default entry)
 *     /execution/pipeline               → Pipeline
 *     /execution/action-engine          → Action Engine
 *     /execution/schedule               → Schedule Creator
 *     /execution/transactions           → Transactions (coming soon)
 *
 *   PILLAR 2 — PERFORMANCE
 *     /performance/financials           → Financials
 *     /performance/analytics            → Analytics
 *     /performance/dashboard            → redirects to /performance/analytics
 *
 *   PILLAR 3 — GROWTH
 *     /growth/current-level             → Current Level
 *     /growth/coaching                  → Coach Hub
 *     /growth/coaching/accept/:token    → Coach Accept (no layout)
 *     /growth/team                      → Team OS
 *
 *   PILLAR 4 — VISION
 *     /vision/big-why                   → Big Why
 *     /vision/wealth                    → Wealth Journey
 *
 *   SYSTEM
 *     /settings                         → Settings
 *     /portal/:token                    → Client Portal (no layout)
 *     /login                            → Login
 *     /onboarding                       → Onboarding
 *
 *   FLAT ALIASES (redirect legacy flat paths → canonical nested)
 *     /pipeline           → /execution/pipeline
 *     /action-engine      → /execution/action-engine
 *     /schedule-creator   → /execution/schedule
 *     /financials         → /performance/financials
 *     /analytics          → /performance/analytics
 *     /dashboard          → /performance/analytics
 *     /coach              → /growth/coaching
 *     /team               → /growth/team
 *     /wealth             → /vision/wealth
 *     /goals              → /execution
 *
 *   LEGACY (no sidebar — backward compat only)
 *     /journey, /level, /library, /culture, /tools, /recruiting
 */

import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import { DashboardLayout } from "./components/DashboardLayout";

// ── Eager imports: tiny components always needed on first paint ──
import NotFound from "@/pages/NotFound";
import Login from './pages/Login';

// ── Lazy imports: each page is a separate chunk, loaded only when visited ──
// AUTH / ONBOARDING
const Onboarding = lazy(() => import("./pages/Onboarding"));
// PILLAR 1: EXECUTION
const ExecutionHome = lazy(() => import('./pages/execution/ExecutionHome'));
const Pipeline = lazy(() => import("./pages/Pipeline"));
const ActionEngine = lazy(() => import('./pages/ActionEngine'));
const ScheduleCreator = lazy(() => import('./pages/ScheduleCreator'));
const TransactionsComingSoon = lazy(() => import('./pages/execution/TransactionsComingSoon'));
// PILLAR 2: PERFORMANCE
const Financials = lazy(() => import("./pages/Financials"));
const Analytics = lazy(() => import("./pages/Analytics"));
// PILLAR 3: GROWTH
const CoachPortal = lazy(() => import("./pages/CoachPortal"));
const CoachAccept = lazy(() => import("./pages/CoachAccept"));
const TeamOS = lazy(() => import("./pages/TeamOS"));
const CoachRoster = lazy(() => import("./pages/coaching/CoachRoster"));
// PILLAR 4: VISION
const Wealth = lazy(() => import('./pages/Wealth'));
const BigWhy = lazy(() => import('./pages/vision/BigWhy'));
const AgentJourney = lazy(() => import('./pages/vision/AgentJourney'));
const BusinessJourney = lazy(() => import('./pages/vision/BusinessJourney'));
// SYSTEM
const SettingsPage = lazy(() => import("./pages/Settings"));
const CertificationInterest = lazy(() => import("./pages/CertificationInterest"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
// LEGACY (no sidebar links — kept for backward compat)
const Journey = lazy(() => import("./pages/Journey"));
const CurrentLevel = lazy(() => import("./pages/CurrentLevel"));
const Library = lazy(() => import("./pages/Library"));
const CultureOS = lazy(() => import("./pages/CultureOS"));
const Tools = lazy(() => import('./pages/Tools'));
const Recruiting = lazy(() => import("./pages/Recruiting"));

// Shared loading fallback used by all Suspense boundaries
function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-muted-foreground text-sm">Loading...</div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
    <Switch>
      {/* ── ROOT ── */}
      <Route path="/" component={() => <Redirect to="/execution" />} />

      {/* ── AUTH / ONBOARDING ── */}
      <Route path="/login" component={Login} />
      <Route path="/onboarding" component={Onboarding} />

      {/* ── PILLAR 1: EXECUTION ── */}
      <Route path="/execution">
        <DashboardLayout><ExecutionHome /></DashboardLayout>
      </Route>
      <Route path="/execution/pipeline">
        <DashboardLayout><Pipeline /></DashboardLayout>
      </Route>
      <Route path="/execution/action-engine">
        <DashboardLayout><ActionEngine /></DashboardLayout>
      </Route>
      <Route path="/execution/schedule">
        <DashboardLayout><ScheduleCreator /></DashboardLayout>
      </Route>
      <Route path="/execution/transactions">
        <DashboardLayout><TransactionsComingSoon /></DashboardLayout>
      </Route>

      {/* ── PILLAR 2: PERFORMANCE ── */}
      <Route path="/performance/financials">
        <DashboardLayout><Financials /></DashboardLayout>
      </Route>
      <Route path="/performance/analytics">
        <DashboardLayout><Analytics /></DashboardLayout>
      </Route>
      <Route path="/performance/dashboard" component={() => <Redirect to="/performance/analytics" />} />

      {/* ── PILLAR 3: GROWTH ── */}
      <Route path="/growth/coaching">
        <DashboardLayout><CoachPortal /></DashboardLayout>
      </Route>
      <Route path="/growth/coaching/accept/:token">
        <CoachAccept />
      </Route>
      <Route path="/growth/roster">
        <DashboardLayout><CoachRoster /></DashboardLayout>
      </Route>
      <Route path="/growth/team">
        <DashboardLayout><TeamOS /></DashboardLayout>
      </Route>

      {/* ── PILLAR 4: VISION ── */}
      <Route path="/vision/big-why">
        <DashboardLayout><BigWhy /></DashboardLayout>
      </Route>
      <Route path="/vision/wealth">
        <DashboardLayout><Wealth /></DashboardLayout>
      </Route>
      <Route path="/vision/agent-journey">
        <DashboardLayout><AgentJourney /></DashboardLayout>
      </Route>
      <Route path="/vision/business-journey">
        <DashboardLayout><BusinessJourney /></DashboardLayout>
      </Route>

      {/* ── SYSTEM ── */}
      <Route path="/settings">
        <DashboardLayout><SettingsPage /></DashboardLayout>
      </Route>
      <Route path="/settings/certification-interest">
        <DashboardLayout><CertificationInterest /></DashboardLayout>
      </Route>
      <Route path="/portal/:token">
        <ClientPortal />
      </Route>

      {/* ── FLAT ALIASES → redirect to canonical nested paths ── */}
      <Route path="/pipeline" component={() => <Redirect to="/execution/pipeline" />} />
      <Route path="/action-engine" component={() => <Redirect to="/execution/action-engine" />} />
      <Route path="/schedule-creator" component={() => <Redirect to="/execution/schedule" />} />
      <Route path="/financials" component={() => <Redirect to="/performance/financials" />} />
      <Route path="/analytics" component={() => <Redirect to="/performance/analytics" />} />
      <Route path="/dashboard" component={() => <Redirect to="/performance/analytics" />} />
      <Route path="/coach" component={() => <Redirect to="/growth/coaching" />} />
      <Route path="/team" component={() => <Redirect to="/growth/team" />} />
      <Route path="/wealth" component={() => <Redirect to="/vision/wealth" />} />
      <Route path="/goals" component={() => <Redirect to="/execution" />} />

      {/* ── LEGACY — no sidebar links, kept for backward compat ── */}
      <Route path="/journey">
        <DashboardLayout><Journey /></DashboardLayout>
      </Route>
      <Route path="/growth/current-level">
        <DashboardLayout><CurrentLevel /></DashboardLayout>
      </Route>
      <Route path="/level" component={() => <Redirect to="/growth/current-level" />} />
      <Route path="/library">
        <DashboardLayout><Library /></DashboardLayout>
      </Route>
      <Route path="/culture">
        <DashboardLayout><CultureOS /></DashboardLayout>
      </Route>
      <Route path="/tools">
        <DashboardLayout><Tools /></DashboardLayout>
      </Route>
      <Route path="/recruiting">
        <DashboardLayout><Recruiting /></DashboardLayout>
      </Route>

      {/* ── CATCH-ALL ── */}
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <AppRoutes />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
