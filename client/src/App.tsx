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
import Compliance from "./pages/Compliance";
import SettingsPage from "./pages/Settings";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/onboarding" />} />
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
      <Route path="/compliance">
        <DashboardLayout><Compliance /></DashboardLayout>
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
