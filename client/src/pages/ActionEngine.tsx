/**
 * ActionEngine.tsx — v12
 *
 * Tabs:
 *   - Actions: live prioritized action list from execution engine
 *   - Calendar: Google Calendar integration + event queue
 *   - Settings: calendar settings
 *
 * Lead Gen Calculator moved to Analytics → Lead Gen tab.
 */

import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { ActionList } from '@/components/execution/ActionList';
import { EventQueue } from '@/components/calendar/EventQueue';
import { CalendarSettings } from '@/components/calendar/CalendarSettings';
import { Zap, TrendingUp, CheckCircle2, Target, CalendarDays, Settings2 } from 'lucide-react';

export default function ActionEngine() {
  const { data: authUrlData } = trpc.calendar.getAuthUrl.useQuery();
  const { data: summary, isLoading, error } = trpc.execution.getSummary.useQuery(undefined, {
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  // Handle OAuth callback result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('cal') === 'connected') {
      toast.success('Google Calendar connected successfully!');
      window.history.replaceState({}, '', '/execution/action-engine');
    } else if (params.get('cal') === 'error') {
      toast.error('Failed to connect Google Calendar. Please try again.');
      window.history.replaceState({}, '', '/execution/action-engine');
    }
  }, []);

  const handleConnect = () => {
    if (authUrlData?.url) window.location.href = authUrlData.url;
  };

  const actions = summary?.actions ?? [];
  const completedToday = summary?.completedActionsToday ?? 0;
  const totalActions = actions.length;
  const highPriority = actions.filter(a => a.priority === 'high' && !a.completed).length;
  const completedActions = actions.filter(a => a.completed).length;

  return (
    <div className="asre-page asre-page-enter">
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-display font-bold text-foreground" style={{ fontSize: '1.5rem' }}>Action Engine</h1>
        <p className="text-muted-foreground mt-0.5">
          Prioritized daily actions + calendar integration. Complete high-priority items first.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-[#DC143C]" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Total Actions</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{totalActions}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">High Priority</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{highPriority}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Completed Today</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{completedToday}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Completion Rate</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="actions" className="space-y-4">
        <TabsList className="bg-muted/50 h-auto">
          <TabsTrigger value="actions" className="text-sm gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Actions
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-sm gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-sm gap-1.5">
            <Settings2 className="w-3.5 h-3.5" /> Calendar Settings
          </TabsTrigger>
        </TabsList>

        {/* Actions tab */}
        <TabsContent value="actions">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground">Today's Prioritized Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse" />
                  ))}
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">Unable to load actions. Check your connection.</p>
                </div>
              ) : (
                <ActionList actions={actions} onActionCompleted={() => {}} />
              )}
            </CardContent>
          </Card>
          <Card className="border-border bg-card/50 mt-3">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">How actions are prioritized:</strong> High-priority actions (lead gen, appointments, overdue follow-ups) are always shown first. Actions update based on your live pipeline data — the more active leads you have, the more context-specific your list becomes.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar tab */}
        <TabsContent value="calendar">
          <EventQueue />
        </TabsContent>

        {/* Settings tab */}
        <TabsContent value="settings">
          <CalendarSettings onConnect={handleConnect} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
