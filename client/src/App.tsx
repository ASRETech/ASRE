import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useIsOnboarded } from "./contexts/AppContext";
import { DashboardLayout } from "./components/DashboardLayout";
import { lazy, Suspense } from "react";

// Pages
import Onboarding from "./pages/Onboarding";
import Journey from "./pages/Journey";
import CurrentLevel from "./pages/CurrentLevel";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import Transactions from "./pages/Transactions";
import Financials from "./pages/Financials";
import Library from "./pages/Library";
import CultureOS from "./pages/CultureOS";
import SettingsPage from "./pages/Settings";
import Analytics from "./pages/Analytics";
import TeamOS from "./pages/TeamOS";
import CoachPortal from "./pages/CoachPortal";
import CoachAccept from "./pages/CoachAccept";
import Recruiting from "./pages/Recruiting";
import ClientPortal from "./pages/ClientPortal";
import Referrals from "./pages/Referrals";
import Reviews from "./pages/Reviews";
import Certification from "./pages/Certification";
import Tools from './pages/Tools';
import Goals from './pages/Goals';
import Login from './pages/Login';
import Wealth from './pages/Wealth';
import ActionEngine from './pages/ActionEngine';
import ScheduleCreator from './pages/ScheduleCreator';
import ExecutionHome from './pages/execution/ExecutionHome';
import TransactionsComingSoon from './pages/execution/TransactionsComingSoon';
function AppRoutes() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/onboarding" />} />
      <Route path="/login" component={Login} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/journey">
        <DashboardLayout><Journey /></DashboardLayout>
      </Route>
      <Route path="/level">
        <DashboardLayout><CurrentLevel /></DashboardLayout>
      </Route>
      <Route path="/dashboard">
        <DashboardLayout><Dashboard /></DashboardLayout>
      </Route>
      <Route path="/pipeline">
        <DashboardLayout><Pipeline /></DashboardLayout>
      </Route>
      <Route path="/transactions">
        <DashboardLayout><Transactions /></DashboardLayout>
      </Route>
      <Route path="/financials">
        <DashboardLayout><Financials /></DashboardLayout>
      </Route>
      <Route path="/library">
        <DashboardLayout><Library /></DashboardLayout>
      </Route>
      <Route path="/culture">
        <DashboardLayout><CultureOS /></DashboardLayout>
      </Route>
      <Route path="/analytics">
        <DashboardLayout><Analytics /></DashboardLayout>
      </Route>
      <Route path="/team">
        <DashboardLayout><TeamOS /></DashboardLayout>
      </Route>
      <Route path="/coach">
        <DashboardLayout><CoachPortal /></DashboardLayout>
      </Route>
      <Route path="/coach/accept/:token">
        <CoachAccept />
      </Route>
      <Route path="/recruiting">
        <DashboardLayout><Recruiting /></DashboardLayout>
      </Route>
      <Route path="/portal/:token">
        <ClientPortal />
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
      <Route path="/tools">
        <DashboardLayout><Tools /></DashboardLayout>
      </Route>
      <Route path="/goals">
        <DashboardLayout><Goals /></DashboardLayout>
      </Route>
      <Route path="/wealth">
        <Wealth />
      </Route>
      <Route path="/action-engine">
        <DashboardLayout><ActionEngine /></DashboardLayout>
      </Route>
      <Route path="/execution">
        <DashboardLayout><ExecutionHome /></DashboardLayout>
      </Route>
      <Route path="/execution/transactions">
        <DashboardLayout><TransactionsComingSoon /></DashboardLayout>
      </Route>
      <Route path="/schedule-creator">
        <DashboardLayout><ScheduleCreator /></DashboardLayout>
      </Route>
      <Route path="/settings">
        <DashboardLayout><SettingsPage /></DashboardLayout>
      </Route>
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
