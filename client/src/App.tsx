/**
 * App.tsx — ASRE Unified Routing
 *
 * Single source of truth for all routes.
 * Entry point: / → /execution
 *
 * 4-Pillar structure:
 *   EXECUTION   → /execution, /pipeline, /action-engine, /schedule-creator
 *   PERFORMANCE → /financials, /analytics, /dashboard
 *   GROWTH      → /coach, /team, /referrals, /reviews, /certification
 *   VISION      → /wealth, /goals
 *
 * Legacy pages kept but de-prioritized (no sidebar links).
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

// ── PILLAR 2: PERFORMANCE ──
import Financials from "./pages/Financials";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";

// ── PILLAR 3: GROWTH ──
import CoachPortal from "./pages/CoachPortal";
import CoachAccept from "./pages/CoachAccept";
import TeamOS from "./pages/TeamOS";
import Referrals from "./pages/Referrals";
import Reviews from "./pages/Reviews";
import Certification from "./pages/Certification";

// ── PILLAR 4: VISION ──
import Wealth from './pages/Wealth';
import Goals from './pages/Goals';

// ── SYSTEM ──
import SettingsPage from "./pages/Settings";
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
      {/* ROOT: redirect to execution */}
      <Route path="/" component={() => <Redirect to="/execution" />} />

      {/* AUTH / ONBOARDING */}
      <Route path="/login" component={Login} />
      <Route path="/onboarding" component={Onboarding} />

      {/* PILLAR 1: EXECUTION */}
      <Route path="/execution">
        <DashboardLayout><ExecutionHome /></DashboardLayout>
      </Route>
      <Route path="/pipeline">
        <DashboardLayout><Pipeline /></DashboardLayout>
      </Route>
      <Route path="/action-engine">
        <DashboardLayout><ActionEngine /></DashboardLayout>
      </Route>
      <Route path="/schedule-creator">
        <DashboardLayout><ScheduleCreator /></DashboardLayout>
      </Route>

      {/* PILLAR 2: PERFORMANCE */}
      <Route path="/financials">
        <DashboardLayout><Financials /></DashboardLayout>
      </Route>
      <Route path="/analytics">
        <DashboardLayout><Analytics /></DashboardLayout>
      </Route>
      <Route path="/dashboard">
        <DashboardLayout><Dashboard /></DashboardLayout>
      </Route>

      {/* PILLAR 3: GROWTH */}
      <Route path="/coach">
        <DashboardLayout><CoachPortal /></DashboardLayout>
      </Route>
      <Route path="/coach/accept/:token">
        <CoachAccept />
      </Route>
      <Route path="/team">
        <DashboardLayout><TeamOS /></DashboardLayout>
      </Route>
      <Route path="/referrals">
        <DashboardLayout><Referrals /></DashboardLayout>
      </Route>
      <Route path="/reviews">
        <DashboardLayout><Reviews /></DashboardLayout>
      </Route>
      <Route path="/certification">
        <DashboardLayout><Certification /></DashboardLayout>
      </Route>

      {/* PILLAR 4: VISION */}
      <Route path="/wealth">
        <Wealth />
      </Route>
      <Route path="/goals">
        <DashboardLayout><Goals /></DashboardLayout>
      </Route>

      {/* SYSTEM */}
      <Route path="/settings">
        <DashboardLayout><SettingsPage /></DashboardLayout>
      </Route>
      <Route path="/portal/:token">
        <ClientPortal />
      </Route>

      {/* LEGACY — no sidebar links, kept for backward compat */}
      <Route path="/journey">
        <DashboardLayout><Journey /></DashboardLayout>
      </Route>
      <Route path="/level">
        <DashboardLayout><CurrentLevel /></DashboardLayout>
      </Route>
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

      {/* CATCH-ALL */}
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
