// Analytics — Weekly Pulse, Conversion Funnel, Source Attribution, Health Score, Frameworks
import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Activity, BarChart3, TrendingUp, Target, Compass,
  ArrowDown, ArrowUp, Minus, Sparkles, Loader2,
  RefreshCw, Users, Phone, Calendar, FileText, DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Analytics() {
  const { state } = useApp();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="pulse" className="space-y-4">
          <TabsList className="bg-muted/50 w-full sm:w-auto flex flex-wrap">
            <TabsTrigger value="pulse" className="text-xs flex-1 sm:flex-initial">
              <Activity className="w-3.5 h-3.5 mr-1.5" /> Pulse
            </TabsTrigger>
            <TabsTrigger value="funnel" className="text-xs flex-1 sm:flex-initial">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Funnel
            </TabsTrigger>
            <TabsTrigger value="sources" className="text-xs flex-1 sm:flex-initial">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Sources
            </TabsTrigger>
            <TabsTrigger value="health" className="text-xs flex-1 sm:flex-initial">
              <Target className="w-3.5 h-3.5 mr-1.5" /> Health
            </TabsTrigger>
            <TabsTrigger value="frameworks" className="text-xs flex-1 sm:flex-initial">
              <Compass className="w-3.5 h-3.5 mr-1.5" /> Frameworks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pulse"><PulseTab /></TabsContent>
          <TabsContent value="funnel"><FunnelTab /></TabsContent>
          <TabsContent value="sources"><SourcesTab /></TabsContent>
          <TabsContent value="health"><HealthTab /></TabsContent>
          <TabsContent value="frameworks"><FrameworksTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Tab 1: Weekly Pulse ─────────────────────────────────────────────
function PulseTab() {
  const { state } = useApp();
  const [pulse, setPulse] = useState({
    contactsMade: 0, contactsGoal: 40,
    apptsSet: 0, apptsGoal: 6,
    apptsHeld: 0, apptsHeldGoal: 4,
    offersWritten: 0, offersGoal: 3,
    newLeads: 0, newLeadsGoal: 10,
  });
  const [aiCoaching, setAiCoaching] = useState('');
  const [coachingLoading, setCoachingLoading] = useState(false);
  const coachMutation = trpc.coaching.ask.useMutation();

  const metrics = [
    { key: 'contactsMade', goalKey: 'contactsGoal', label: 'Contacts Made', icon: Phone },
    { key: 'apptsSet', goalKey: 'apptsGoal', label: 'Appointments Set', icon: Calendar },
    { key: 'apptsHeld', goalKey: 'apptsHeldGoal', label: 'Appointments Held', icon: Users },
    { key: 'offersWritten', goalKey: 'offersGoal', label: 'Offers Written', icon: FileText },
    { key: 'newLeads', goalKey: 'newLeadsGoal', label: 'New Leads', icon: TrendingUp },
  ];

  const getCoaching = () => {
    setCoachingLoading(true);
    const summary = metrics.map(m => `${m.label}: ${(pulse as any)[m.key]}/${(pulse as any)[m.goalKey]}`).join(', ');
    coachMutation.mutate({
      context: 'weekly-pulse-coaching',
      prompt: `Based on this agent's weekly leading indicators: ${summary}. Give exactly 3 specific, actionable improvement recommendations. Each should be 1-2 sentences. Focus on the weakest metric. Format as numbered list. No preamble.`,
      agentLevel: state.user?.currentLevel,
    }, {
      onSuccess: (data) => { setAiCoaching(data.response); setCoachingLoading(false); },
      onError: () => { setCoachingLoading(false); toast.error('Could not get coaching'); },
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 overflow-x-auto">
        <h3 className="font-display text-lg font-semibold mb-4">Weekly Leading Indicators</h3>
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted-foreground uppercase tracking-wider py-2 font-medium">Metric</th>
              <th className="text-center text-xs text-muted-foreground uppercase tracking-wider py-2 font-medium w-24">This Week</th>
              <th className="text-center text-xs text-muted-foreground uppercase tracking-wider py-2 font-medium w-20">Goal</th>
              <th className="text-left text-xs text-muted-foreground uppercase tracking-wider py-2 font-medium">vs Goal</th>
              <th className="text-center text-xs text-muted-foreground uppercase tracking-wider py-2 font-medium w-16">Trend</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(m => {
              const val = (pulse as any)[m.key] as number;
              const goal = (pulse as any)[m.goalKey] as number;
              const pct = goal > 0 ? Math.round((val / goal) * 100) : 0;
              return (
                <tr key={m.key} className="border-b border-border/50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <m.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{m.label}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <Input
                      type="number"
                      min={0}
                      value={val}
                      onChange={e => setPulse(p => ({ ...p, [m.key]: parseInt(e.target.value) || 0 }))}
                      className="w-16 h-8 text-center font-mono text-sm mx-auto"
                    />
                  </td>
                  <td className="py-3 text-center font-mono text-sm text-muted-foreground">{goal}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={Math.min(100, pct)} className="h-2 flex-1" />
                      <span className={`text-xs font-mono ${pct >= 100 ? 'text-emerald-500' : pct >= 60 ? 'text-foreground' : 'text-amber-500'}`}>
                        {pct}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <Minus className="w-4 h-4 text-muted-foreground mx-auto" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* AI Coaching */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#DC143C]" /> AI Coaching
          </h3>
          <Button
            onClick={getCoaching}
            disabled={coachingLoading}
            size="sm"
            className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white text-xs"
          >
            {coachingLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
            Get AI Coaching
          </Button>
        </div>
        {coachingLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : aiCoaching ? (
          <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">{aiCoaching}</div>
        ) : (
          <p className="text-xs text-muted-foreground">Enter your weekly numbers above, then click "Get AI Coaching" for personalized recommendations.</p>
        )}
      </Card>
    </div>
  );
}

// ─── Tab 2: Conversion Funnel ────────────────────────────────────────
function FunnelTab() {
  const { state } = useApp();
  const leads = state.leads;
  const [aiInsight, setAiInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);
  const coachMutation = trpc.coaching.ask.useMutation();

  const stages = useMemo(() => {
    const total = leads.length;
    const apptsSet = leads.filter(l => ['Appt Set', 'Appt Held', 'Active', 'Under Contract', 'Closed'].includes(l.stage)).length;
    const apptsHeld = leads.filter(l => ['Appt Held', 'Active', 'Under Contract', 'Closed'].includes(l.stage)).length;
    const underContract = leads.filter(l => ['Under Contract', 'Closed'].includes(l.stage)).length;
    const closed = leads.filter(l => l.stage === 'Closed').length;
    return [
      { label: 'Total Leads', count: total, pct: 100 },
      { label: 'Appointments Set', count: apptsSet, pct: total > 0 ? Math.round((apptsSet / total) * 100) : 0 },
      { label: 'Appointments Held', count: apptsHeld, pct: total > 0 ? Math.round((apptsHeld / total) * 100) : 0 },
      { label: 'Under Contract', count: underContract, pct: total > 0 ? Math.round((underContract / total) * 100) : 0 },
      { label: 'Closed', count: closed, pct: total > 0 ? Math.round((closed / total) * 100) : 0 },
    ];
  }, [leads]);

  // Find biggest drop-off
  const dropOffs = stages.slice(0, -1).map((s, i) => ({
    from: s.label,
    to: stages[i + 1].label,
    loss: s.count - stages[i + 1].count,
    lossPct: s.count > 0 ? Math.round(((s.count - stages[i + 1].count) / s.count) * 100) : 0,
  }));
  const biggestDrop = dropOffs.reduce((max, d) => d.lossPct > max.lossPct ? d : max, dropOffs[0]);

  const getDiagnosis = () => {
    setInsightLoading(true);
    const funnelSummary = stages.map(s => `${s.label}: ${s.count}`).join(', ');
    coachMutation.mutate({
      context: 'funnel-diagnosis',
      prompt: `Analyze this real estate agent's conversion funnel: ${funnelSummary}. Biggest drop-off: ${biggestDrop?.from} to ${biggestDrop?.to} (${biggestDrop?.lossPct}% loss). Give 2-3 specific actions to recover lost leads at the biggest drop-off point. Be specific to real estate. No preamble.`,
      agentLevel: state.user?.currentLevel,
    }, {
      onSuccess: (data) => { setAiInsight(data.response); setInsightLoading(false); },
      onError: () => { setInsightLoading(false); toast.error('Could not get diagnosis'); },
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold mb-6">Conversion Funnel</h3>
        <div className="space-y-2 max-w-xl mx-auto">
          {stages.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-32 sm:w-40 text-right truncate">{s.label}</span>
                <div className="flex-1 relative">
                  <div
                    className="h-8 rounded-md bg-[#DC143C] transition-all duration-500"
                    style={{ width: `${Math.max(s.pct, 5)}%`, opacity: 1 - i * 0.15 }}
                  />
                </div>
                <span className="font-mono text-sm font-bold text-foreground w-8 text-right">{s.count}</span>
                <span className="text-[10px] font-mono text-muted-foreground w-10">{s.pct}%</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Biggest Drop-Off */}
        {biggestDrop && biggestDrop.lossPct > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 max-w-xl mx-auto">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDown className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-foreground">Biggest Drop-Off</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {biggestDrop.from} → {biggestDrop.to}: <span className="font-mono text-amber-500">{biggestDrop.lossPct}% loss</span> ({biggestDrop.loss} leads)
            </p>
          </div>
        )}
      </Card>

      {/* AI Insight */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#DC143C]" /> Funnel Diagnosis
          </h3>
          <Button onClick={getDiagnosis} disabled={insightLoading} size="sm" className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white text-xs">
            {insightLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
            Get Diagnosis
          </Button>
        </div>
        {insightLoading ? (
          <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
        ) : aiInsight ? (
          <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">{aiInsight}</div>
        ) : (
          <p className="text-xs text-muted-foreground">Click "Get Diagnosis" for AI-powered funnel analysis and recovery recommendations.</p>
        )}
      </Card>
    </div>
  );
}

// ─── Tab 3: Source Attribution ────────────────────────────────────────
function SourcesTab() {
  const { state } = useApp();
  const leads = state.leads;
  const [sortBy, setSortBy] = useState<'gci' | 'leads' | 'closes'>('gci');

  const LEAD_SOURCES = ['Zillow', 'Realtor.com', 'Referral', 'Sphere of Influence', 'Open House', 'Social Media', 'Website', 'Sign Call', 'FSBO', 'Expired', 'Door Knocking', 'Other'];

  const sourceData = useMemo(() => {
    return LEAD_SOURCES.map(source => {
      const sourceLeads = leads.filter(l => l.source === source);
      const closedLeads = sourceLeads.filter(l => l.stage === 'Closed');
      const projectedGCI = closedLeads.reduce((s, l) => s + (l.budget * 0.025 * 0.7), 0);
      return {
        source,
        leads: sourceLeads.length,
        closes: closedLeads.length,
        gci: projectedGCI,
        conversionRate: sourceLeads.length > 0 ? (closedLeads.length / sourceLeads.length * 100).toFixed(1) + '%' : '—',
      };
    }).filter(s => s.leads > 0).sort((a, b) => (b as any)[sortBy] - (a as any)[sortBy]);
  }, [leads, sortBy]);

  const topSource = sourceData[0];

  return (
    <div className="space-y-6">
      <Card className="p-6 overflow-x-auto">
        <h3 className="font-display text-lg font-semibold mb-4">Source Attribution</h3>
        {sourceData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Add leads with sources to see attribution data</p>
          </div>
        ) : (
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted-foreground uppercase tracking-wider py-2 font-medium">Source</th>
                <th className="text-center text-xs text-muted-foreground uppercase tracking-wider py-2 font-medium cursor-pointer hover:text-foreground" onClick={() => setSortBy('leads')}>
                  Leads {sortBy === 'leads' && '↓'}
                </th>
                <th className="text-center text-xs text-muted-foreground uppercase tracking-wider py-2 font-medium cursor-pointer hover:text-foreground" onClick={() => setSortBy('closes')}>
                  Closes {sortBy === 'closes' && '↓'}
                </th>
                <th className="text-right text-xs text-muted-foreground uppercase tracking-wider py-2 font-medium cursor-pointer hover:text-foreground" onClick={() => setSortBy('gci')}>
                  Projected GCI {sortBy === 'gci' && '↓'}
                </th>
                <th className="text-center text-xs text-muted-foreground uppercase tracking-wider py-2 font-medium">Conv. Rate</th>
              </tr>
            </thead>
            <tbody>
              {sourceData.map((s, i) => (
                <tr key={s.source} className={`border-b border-border/50 ${i === 0 ? 'bg-emerald-500/5' : ''}`}>
                  <td className="py-3 text-sm font-medium text-foreground">
                    {s.source}
                    {i === 0 && <Badge variant="outline" className="ml-2 text-[9px] text-emerald-500 border-emerald-500/20">TOP</Badge>}
                  </td>
                  <td className="py-3 text-center font-mono text-sm text-foreground">{s.leads}</td>
                  <td className="py-3 text-center font-mono text-sm text-foreground">{s.closes}</td>
                  <td className="py-3 text-right font-mono text-sm text-foreground">${s.gci.toLocaleString()}</td>
                  <td className="py-3 text-center font-mono text-sm text-muted-foreground">{s.conversionRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {topSource && (topSource.source === 'Referral' || topSource.source === 'Sphere of Influence') && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-xs text-emerald-600 font-medium">
              Your top source is {topSource.source} — referral-based business is the most sustainable and profitable lead source in real estate.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Tab 4: Business Health Score ────────────────────────────────────
function HealthTab() {
  const { state } = useApp();
  const leads = state.leads;
  const transactions = state.transactions;
  const deliverables = state.deliverables;
  const [aiRecs, setAiRecs] = useState('');
  const [recsLoading, setRecsLoading] = useState(false);
  const coachMutation = trpc.coaching.ask.useMutation();

  const dimensions = useMemo(() => {
    const now = Date.now();
    const d30 = 30 * 24 * 60 * 60 * 1000;
    const d7 = 7 * 24 * 60 * 60 * 1000;

    const leadGen = Math.min(25, leads.filter(l => new Date(l.createdAt).getTime() > now - d30).length * 2);
    const followUp = Math.min(25, leads.filter(l => l.lastContactedAt && new Date(l.lastContactedAt).getTime() > now - d7).length / Math.max(1, leads.length) * 25);
    const txScore = Math.min(20, transactions.filter(t => t.status !== 'closed').length * 4);
    const compScore = Math.min(15, state.complianceLogs.length * 3);
    const delScore = Math.min(15, deliverables.filter(d => d.isComplete).length * 2);

    return [
      { label: 'Lead Generation', score: Math.round(leadGen), max: 25 },
      { label: 'Follow-Up', score: Math.round(followUp), max: 25 },
      { label: 'Transactions', score: Math.round(txScore), max: 20 },
      { label: 'Compliance', score: Math.round(compScore), max: 15 },
      { label: 'Deliverables', score: Math.round(delScore), max: 15 },
    ];
  }, [leads, transactions, deliverables, state.complianceLogs]);

  const totalScore = dimensions.reduce((s, d) => s + d.score, 0);
  const scoreColor = totalScore >= 70 ? '#22c55e' : totalScore >= 50 ? '#f59e0b' : '#ef4444';

  const getRecs = () => {
    setRecsLoading(true);
    const breakdown = dimensions.map(d => `${d.label}: ${d.score}/${d.max}`).join(', ');
    coachMutation.mutate({
      context: 'health-score-recs',
      prompt: `Agent's business health score: ${totalScore}/100. Breakdown: ${breakdown}. Give exactly 3 specific actions for this week to improve the lowest-scoring areas. Be specific to real estate. Numbered list. No preamble.`,
      agentLevel: state.user?.currentLevel,
    }, {
      onSuccess: (data) => { setAiRecs(data.response); setRecsLoading(false); },
      onError: () => { setRecsLoading(false); toast.error('Could not get recommendations'); },
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        {/* Gauge */}
        <Card className="p-6 flex flex-col items-center justify-center">
          <div
            className="relative w-48 h-48 rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(${scoreColor} ${totalScore * 3.6}deg, #1a1a1a20 ${totalScore * 3.6}deg)`,
            }}
          >
            <div className="absolute inset-3 rounded-full bg-background flex items-center justify-center flex-col">
              <span className="font-mono text-4xl font-bold text-foreground">{totalScore}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`mt-4 font-mono text-xs ${
              totalScore >= 70 ? 'text-emerald-500 border-emerald-500/20' :
              totalScore >= 50 ? 'text-amber-500 border-amber-500/20' :
              'text-red-500 border-red-500/20'
            }`}
          >
            {totalScore >= 70 ? 'HEALTHY' : totalScore >= 50 ? 'NEEDS ATTENTION' : 'ACTION REQUIRED'}
          </Badge>
        </Card>

        {/* Dimension bars */}
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Score Breakdown</h3>
          <div className="space-y-4">
            {dimensions.map(d => (
              <div key={d.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">{d.label}</span>
                  <span className="font-mono text-sm text-muted-foreground">{d.score}/{d.max}</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(d.score / d.max) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: (d.score / d.max) >= 0.7 ? '#22c55e' : (d.score / d.max) >= 0.4 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#DC143C]" /> Top 3 Actions This Week
          </h3>
          <Button onClick={getRecs} disabled={recsLoading} size="sm" className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white text-xs">
            {recsLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
            Get Recommendations
          </Button>
        </div>
        {recsLoading ? (
          <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
        ) : aiRecs ? (
          <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">{aiRecs}</div>
        ) : (
          <p className="text-xs text-muted-foreground">Click "Get Recommendations" for AI-powered action items based on your health score.</p>
        )}
      </Card>
    </div>
  );
}

// ─── Tab 5: Frameworks ───────────────────────────────────────────────
function FrameworksTab() {
  const { state } = useApp();
  const leads = state.leads;
  const financials = state.financials;
  const gciGoal = state.user?.incomeGoal ?? 250000;

  // 4-1-1
  const monthlyNeeded = Math.round(gciGoal / 12);
  const weeklyFocus = Math.round(gciGoal / 50);
  const ytdActual = financials.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0);
  const ytdPct = gciGoal > 0 ? Math.round((ytdActual / gciGoal) * 100) : 0;

  // 36:12:3
  const dbSize = leads.length;
  const projectedTx = Math.round(dbSize * 0.12);
  const avgGCI = 9500;
  const projectedIncome = projectedTx * avgGCI;

  // GPS
  const [gps, setGps] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('agentos-gps') || '{}');
    } catch { return {}; }
  });
  const saveGps = (field: string, value: string) => {
    const updated = { ...gps, [field]: value };
    setGps(updated);
    localStorage.setItem('agentos-gps', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      {/* 4-1-1 Goal Tracker */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-[#DC143C]" /> 4-1-1 Goal Tracker
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Annual GCI Goal</div>
            <div className="font-mono text-xl font-bold text-foreground">${gciGoal.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Monthly Needed</div>
            <div className="font-mono text-xl font-bold text-foreground">${monthlyNeeded.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Weekly Focus</div>
            <div className="font-mono text-xl font-bold text-[#DC143C]">${weeklyFocus.toLocaleString()}</div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">YTD Actual vs. Annual Goal</span>
            <span className="font-mono text-xs text-foreground">${ytdActual.toLocaleString()} / ${gciGoal.toLocaleString()} ({ytdPct}%)</span>
          </div>
          <Progress value={Math.min(100, ytdPct)} className="h-2.5" />
        </div>
      </Card>

      {/* 36:12:3 Model */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#DC143C]" /> 36:12:3 Model
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 justify-center">
          <div className="text-center p-4 rounded-lg bg-muted/50 min-w-[120px]">
            <div className="text-xs text-muted-foreground mb-1">Database</div>
            <div className="font-mono text-2xl font-bold text-foreground">{dbSize}</div>
          </div>
          <span className="text-muted-foreground text-lg">×</span>
          <div className="text-center p-4 rounded-lg bg-muted/50 min-w-[120px]">
            <div className="text-xs text-muted-foreground mb-1">12% Conv.</div>
            <div className="font-mono text-2xl font-bold text-foreground">{projectedTx}</div>
            <div className="text-[10px] text-muted-foreground">transactions</div>
          </div>
          <span className="text-muted-foreground text-lg">×</span>
          <div className="text-center p-4 rounded-lg bg-[#DC143C]/5 border border-[#DC143C]/10 min-w-[120px]">
            <div className="text-xs text-muted-foreground mb-1">Avg GCI</div>
            <div className="font-mono text-2xl font-bold text-[#DC143C]">${projectedIncome.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">projected annual</div>
          </div>
        </div>
      </Card>

      {/* GPS Framework */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#DC143C]" /> GPS Framework
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { key: 'goal', label: 'Goal', placeholder: 'e.g., Close 36 transactions this year with $340K GCI' },
            { key: 'priorities', label: 'Priorities', placeholder: 'e.g., 1. Build database to 500\n2. Hire EA by Q2\n3. Master listing presentations' },
            { key: 'strategies', label: 'Strategies', placeholder: 'e.g., 1. 25 contacts/day minimum\n2. Post 3x/week on social\n3. Host 2 open houses/month' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block font-medium">{f.label}</label>
              <Textarea
                value={gps[f.key] || ''}
                onChange={e => saveGps(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="min-h-[150px] text-sm"
              />
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Auto-saved to your browser. Updates persist across sessions.</p>
      </Card>
    </div>
  );
}
