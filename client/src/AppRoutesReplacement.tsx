import { Switch, Route, Redirect } from 'wouter';
import Login from '@/pages/Login';
import Onboarding from '@/pages/Onboarding';
import NotFound from '@/pages/not-found';
import ExecutionHome from '@/pages/execution/ExecutionHome';
import Pipeline from '@/pages/Pipeline';
import ActionEngine from '@/pages/ActionEngine';
import ScheduleCreator from '@/pages/ScheduleCreator';
import TransactionsComingSoon from '@/pages/execution/TransactionsComingSoon';
import Financials from '@/pages/Financials';
import Analytics from '@/pages/Analytics';
import CoachPortal from '@/pages/CoachPortal';
import Certification from '@/pages/Certification';
import TeamOS from '@/pages/Team';
import Wealth from '@/pages/Wealth';
import { AuthenticatedRoute } from '@/components/routing/AuthenticatedRoute';
import { DashboardLayoutReplacement as DashboardLayout } from '@/components/DashboardLayoutReplacement';

export function AppRoutesReplacement() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/app" />} />
      <Route path="/login" component={Login} />
      <Route path="/onboarding" component={Onboarding} />

      <AuthenticatedRoute path="/app">
        <DashboardLayout><ExecutionHome /></DashboardLayout>
      </AuthenticatedRoute>

      <AuthenticatedRoute path="/execution/pipeline">
        <DashboardLayout><Pipeline /></DashboardLayout>
      </AuthenticatedRoute>

      <AuthenticatedRoute path="/execution/action-engine">
        <DashboardLayout><ActionEngine /></DashboardLayout>
      </AuthenticatedRoute>

      <AuthenticatedRoute path="/execution/schedule">
        <DashboardLayout><ScheduleCreator /></DashboardLayout>
      </AuthenticatedRoute>

      <AuthenticatedRoute path="/execution/transactions">
        <DashboardLayout><TransactionsComingSoon /></DashboardLayout>
      </AuthenticatedRoute>

      <AuthenticatedRoute path="/performance/financials">
        <DashboardLayout><Financials /></DashboardLayout>
      </AuthenticatedRoute>

      <AuthenticatedRoute path="/performance/analytics">
        <DashboardLayout><Analytics /></DashboardLayout>
      </AuthenticatedRoute>

      <AuthenticatedRoute path="/growth/coaching">
        <DashboardLayout><CoachPortal /></DashboardLayout>
      </AuthenticatedRoute>

      <AuthenticatedRoute path="/growth/certification">
        <DashboardLayout><Certification /></DashboardLayout>
      </AuthenticatedRoute>

      <AuthenticatedRoute path="/growth/team">
        <DashboardLayout><TeamOS /></DashboardLayout>
      </AuthenticatedRoute>

      <AuthenticatedRoute path="/vision/wealth">
        <DashboardLayout><Wealth /></DashboardLayout>
      </AuthenticatedRoute>

      <Route component={NotFound} />
    </Switch>
  );
}
