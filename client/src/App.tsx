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

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import { DashboardLayout } from "./components/DashboardLayout";

// ── AUTH / ONBOARDING ──
import Login from './pages/Login';
import Onboarding from "./pages/Onboarding";

// ── PILLAR 1: EXECUTION ──
import ExecutionHome from './pages/execution/ExecutionHome';
import Pipeline from "./pages/Pipeline";
import ActionEngine from './pages/ActionEngine';
import ScheduleCreator from './pages/ScheduleCreator';
import TransactionsComingSoon from './pages/execution/TransactionsComingSoon';

// ── PILLAR 2: PERFORMANCE ──
import Financials from "./pages/Financials";
import Analytics from "./pages/Analytics";

// ── PILLAR 3: GROWTH ──
import CoachPortal from "./pages/CoachPortal";
import CoachAccept from "./pages/CoachAccept";
import TeamOS from "./pages/TeamOS";
import CoachRoster from "./pages/coaching/CoachRoster";

// ── PILLAR 4: VISION ──
import Wealth from './pages/Wealth';
import BigWhy from './pages/vision/BigWhy';

// ── SYSTEM ──
import SettingsPage from "./pages/Settings";
import CertificationInterest from "./pages/CertificationInterest";
import ClientPortal from "./pages/ClientPortal";

// ── LEGACY (no sidebar links — kept for backward compat) ──
import Journey from "./pages/Journey";
import CurrentLevel from "./pages/CurrentLevel";
import Library from "./pages/Library";
import CultureOS from "./pages/CultureOS";
import Tools from './pages/Tools';
import Recruiting from "./pages/Recruiting";

function AppRoutes() {
  return (
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
