/**
 * Wealth.tsx — v13 (Sprint D)
 *
 * Full T1–T5 roadmap always visible. Locked tracks are previewable but not interactive.
 * Sprint D: blockerNote threading, WealthTimeline tab, Wealth Wins tab.
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WealthHero } from '@/components/wealth/WealthHero';
import { MilestoneList } from '@/components/wealth/MilestoneList';
import { FICalculator } from '@/components/wealth/FICalculator';
import { WealthInsights } from '@/components/wealth/WealthInsights';
import { WealthTimeline } from '@/components/wealth/WealthTimeline';
import { InvestmentProperties } from '@/components/wealth/InvestmentProperties';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Lock, CheckCircle2, Trophy, Plus, Sparkles } from 'lucide-react';
import { TRACK_NAMES, TRACK_MILESTONE_COUNTS } from '@/lib/wealthConstants';

type MilestoneStatus = 'not_started' | 'in_progress' | 'done';

const WIN_CATEGORIES = [
  { value: 'milestone', label: 'Milestone' },
  { value: 'income', label: 'Income' },
  { value: 'debt', label: 'Debt' },
  { value: 'investment', label: 'Investment' },
  { value: 'protection', label: 'Protection' },
  { value: 'mindset', label: 'Mindset' },
] as const;

const TRACK_THEMES: Record<number, string> = {
  1: 'Protect your income, separate finances, and build your safety net.',
  2: 'Structure your business for liability protection and tax efficiency.',
  3: 'Maximize legal deductions and build a wealth allocation system.',
  4: 'Invest systematically and build passive income toward FI.',
  5: 'Achieve financial independence and build a lasting legacy.',
};

const TRACK_UNLOCK: Record<number, string> = {
  1: 'Always unlocked — start here',
  2: 'Complete T1 foundation milestones',
  3: 'Reach $80K income + T2 progress',
  4: 'Reach $100K income + T2 complete',
  5: 'Reach $250K income + T1 mastery',
};

const TRACK_COLORS: Record<number, { accent: string; bg: string; border: string; ring: string }> = {
  1: { accent: '#3b82f6', bg: 'rgba(59,130,246,0.07)', border: 'rgba(59,130,246,0.25)', ring: 'rgba(59,130,246,0.5)' },
  2: { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.07)', border: 'rgba(139,92,246,0.25)', ring: 'rgba(139,92,246,0.5)' },
  3: { accent: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.25)', ring: 'rgba(245,158,11,0.5)' },
  4: { accent: '#10b981', bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.25)', ring: 'rgba(16,185,129,0.5)' },
  5: { accent: '#f43f5e', bg: 'rgba(244,63,94,0.07)', border: 'rgba(244,63,94,0.25)', ring: 'rgba(244,63,94,0.5)' },
};

// ── Wealth Wins Logger ──
function WealthWinsPanel() {
  const utils = trpc.useUtils();
  const winsQuery = trpc.wealth.listWealthWins.useQuery();
  const addWin = trpc.wealth.addWealthWin.useMutation({
    onSuccess: () => {
      utils.wealth.listWealthWins.invalidate();
      setTitle('');
      setDesc('');
      setCategory('mindset');
      toast.success('Wealth Win logged!');
    },
    onError: () => toast.error('Failed to log win.'),
  });
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<typeof WIN_CATEGORIES[number]['value']>('mindset');

  const handleSubmit = () => {
    if (!title.trim()) return;
    addWin.mutate({ title: title.trim(), description: desc.trim() || undefined, category });
  };

  return (
    <div className="space-y-5">
      {/* Log a win */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-4 h-4 text-[#DC143C]" />
          <h3 className="text-sm font-semibold">Log a Wealth Win</h3>
        </div>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What did you accomplish? e.g. 'Opened SEP-IRA', 'Paid off car loan'"
          className="text-sm"
          maxLength={200}
        />
        <Input
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Optional: add context or how it felt"
          className="text-sm"
          maxLength={500}
        />
        <div className="flex items-center gap-2 flex-wrap">
          {WIN_CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                category === c.value
                  ? 'bg-[#DC143C] text-white border-[#DC143C]'
                  : 'border-border text-muted-foreground hover:border-foreground'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          className="h-8 text-xs gap-1"
          onClick={handleSubmit}
          disabled={!title.trim() || addWin.isPending}
        >
          <Plus className="w-3.5 h-3.5" /> Log Win
        </Button>
      </div>

      {/* Recent wins list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Wins</p>
        {winsQuery.isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />)}
          </div>
        ) : (winsQuery.data?.length ?? 0) === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No wins logged yet. Every step forward counts — log your first win!</p>
          </div>
        ) : (
          winsQuery.data?.map(w => (
            <div key={w.winId} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
              <div className="w-7 h-7 rounded-full bg-[#DC143C]/10 flex items-center justify-center shrink-0">
                <Trophy className="w-3.5 h-3.5 text-[#DC143C]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{w.title}</p>
                {w.description && <p className="text-xs text-muted-foreground mt-0.5">{w.description}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(w.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' · '}{w.category}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Wealth() {
  const utils = trpc.useUtils();
  const [selectedTrack, setSelectedTrack] = useState(1);
  const { data: journey, isLoading } = trpc.wealth.getJourney.useQuery();

  const updateMutation = trpc.wealth.updateMilestone.useMutation({
    onMutate: async (input) => {
      await utils.wealth.getJourney.cancel();
      const prev = utils.wealth.getJourney.getData();
      if (prev) {
        utils.wealth.getJourney.setData(undefined, {
          ...prev,
          milestones: prev.milestones.map(m =>
            m.milestoneKey === input.milestoneKey
              ? { ...m, status: input.status }
              : m
          ),
        });
      }
      return { prev };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.prev) utils.wealth.getJourney.setData(undefined, ctx.prev);
      toast.error('Failed to update milestone.');
    },
    onSettled: () => {
      utils.wealth.getJourney.invalidate();
    },
  });

  // Sprint D: blockerNote threaded through
  const handleUpdate = (key: string, status: MilestoneStatus, notes?: string, date?: string, blockerNote?: string | null) => {
    updateMutation.mutate({ milestoneKey: key, status, notes, completedDate: date, blockerNote });
  };

  // Sprint D: Track Narrative Generation
  const [trackNarratives, setTrackNarratives] = useState<Record<number, string>>({});
  const generateNarrative = trpc.wealth.generateTrackNarrative.useMutation({
    onSuccess: (data, variables) => {
      setTrackNarratives(prev => ({ ...prev, [variables.trackNumber]: data.narrative }));
      toast.success('Coaching narrative generated!');
    },
    onError: () => toast.error('Failed to generate narrative.'),
  });

  if (isLoading) {
    return (
      <div className="asre-page asre-page-enter">
        <div className="h-32 rounded-xl bg-muted/40 animate-pulse mb-4" />
        <div className="grid grid-cols-5 gap-3 mb-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-28 rounded-xl bg-muted/40 animate-pulse" />)}
        </div>
      </div>
    );
  }

  const unlockedTracks = journey?.unlockedTracks ?? [1];
  const milestones = journey?.milestones ?? [];

  return (
    <div className="asre-page asre-page-enter">
      <WealthHero journey={journey} />

      <Tabs defaultValue="milestones" className="space-y-5">
        <TabsList className="bg-muted/50 h-auto">
          <TabsTrigger value="milestones" className="text-sm">Milestones</TabsTrigger>
          <TabsTrigger value="calculator" className="text-sm">FI Calculator</TabsTrigger>
          <TabsTrigger value="properties" className="text-sm">Properties</TabsTrigger>
          <TabsTrigger value="insights" className="text-sm">Insights</TabsTrigger>
          <TabsTrigger value="timeline" className="text-sm">Timeline</TabsTrigger>
          <TabsTrigger value="wins" className="text-sm">Wins</TabsTrigger>
        </TabsList>

        {/* MILESTONES TAB */}
        <TabsContent value="milestones">
          {/* Full 5-track roadmap — always visible, locked tracks previewable */}
          <div className="grid grid-cols-5 gap-2.5 mb-5">
            {[1, 2, 3, 4, 5].map(n => {
              const isUnlocked = unlockedTracks.includes(n);
              const isSelected = selectedTrack === n;
              const total = TRACK_MILESTONE_COUNTS[n] ?? 0;
              const trackMilestones = milestones.filter(m => m.milestoneKey.startsWith(`t${n}_`));
              const done = trackMilestones.filter(m => m.status === 'done').length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const colors = TRACK_COLORS[n];
              const isComplete = isUnlocked && done === total && total > 0;

              return (
                <button
                  key={n}
                  onClick={() => setSelectedTrack(n)}
                  className="relative w-full rounded-xl border p-3 text-left transition-all duration-150"
                  style={{
                    background: isSelected ? colors.bg : 'rgba(255,255,255,0.02)',
                    borderColor: isSelected ? colors.border : 'rgba(255,255,255,0.08)',
                    boxShadow: isSelected ? `0 0 0 2px ${colors.ring}` : 'none',
                    opacity: isUnlocked ? 1 : 0.65,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="text-xs font-black px-1.5 py-0.5 rounded"
                      style={{ background: colors.bg, color: colors.accent, border: `1px solid ${colors.border}` }}
                    >
                      T{n}
                    </div>
                    {!isUnlocked ? (
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    ) : isComplete ? (
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: colors.accent }} />
                    ) : null}
                  </div>
                  <div className="text-xs font-semibold text-foreground leading-tight mb-1">
                    {TRACK_NAMES[n]}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight mb-2 hidden sm:block">
                    {TRACK_THEMES[n]}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>{done}/{total} done</span>
                    <span style={{ color: isUnlocked ? colors.accent : undefined }}>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1" />
                  {!isUnlocked && (
                    <div className="mt-2 text-[9px] text-muted-foreground leading-tight">
                      {TRACK_UNLOCK[n]}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detail panel — always shows selected track content */}
          {(() => {
            const isUnlocked = unlockedTracks.includes(selectedTrack);
            const colors = TRACK_COLORS[selectedTrack];
            const total = TRACK_MILESTONE_COUNTS[selectedTrack] ?? 0;
            const trackMilestones = milestones.filter(m => m.milestoneKey.startsWith(`t${selectedTrack}_`));
            const done = trackMilestones.filter(m => m.status === 'done').length;

            return (
              <div className="rounded-xl border border-border overflow-hidden">
                {/* Panel header */}
                <div
                  className="flex items-center justify-between px-5 py-4 border-b border-border"
                  style={{ background: colors.bg }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-xs font-black px-1.5 py-0.5 rounded"
                        style={{ background: colors.bg, color: colors.accent, border: `1px solid ${colors.border}` }}
                      >
                        T{selectedTrack}
                      </span>
                      <h3 className="font-display font-bold text-foreground" style={{ fontSize: '1rem' }}>
                        {TRACK_NAMES[selectedTrack]}
                      </h3>
                      {!isUnlocked && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                          <Lock className="w-2.5 h-2.5" /> Locked — preview only
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{TRACK_THEMES[selectedTrack]}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="text-right">
                      <div className="font-mono font-bold" style={{ color: colors.accent, fontSize: '1.25rem' }}>
                        {done}/{total}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">milestones</div>
                    </div>
                    {isUnlocked && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 border-[#DC143C]/30 text-[#DC143C] hover:bg-[#DC143C]/10"
                        onClick={() => generateNarrative.mutate({ trackNumber: selectedTrack })}
                        disabled={generateNarrative.isPending}
                      >
                        <Sparkles className="w-3 h-3" />
                        {generateNarrative.isPending ? 'Generating...' : 'Narrative'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sprint D: Track Narrative */}
                {trackNarratives[selectedTrack] && (
                  <div className="px-5 py-3 border-b border-border bg-[#DC143C]/[0.03] flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-[#DC143C] shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground leading-relaxed italic">{trackNarratives[selectedTrack]}</p>
                  </div>
                )}

                {/* Locked preview notice */}
                {!isUnlocked && (
                  <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center gap-3">
                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Track {selectedTrack} is locked</p>
                      <p className="text-xs text-muted-foreground">
                        Unlock criteria: {TRACK_UNLOCK[selectedTrack]}. Milestones are visible for planning purposes.
                      </p>
                    </div>
                  </div>
                )}

                {/* Milestone list — always rendered, pointer-events disabled if locked */}
                <div className={!isUnlocked ? 'opacity-55 pointer-events-none select-none' : ''}>
                  <MilestoneList
                    trackNumber={selectedTrack}
                    milestones={milestones.map(m => ({
                      ...m,
                      completedDate: m.completedDate ? String(m.completedDate) : null,
                      blockerNote: (m as any).blockerNote ?? null,
                    }))}
                    onUpdate={handleUpdate}
                    isPending={updateMutation.isPending}
                  />
                </div>
              </div>
            );
          })()}
        </TabsContent>

        {/* FI CALCULATOR TAB */}
        <TabsContent value="calculator">
          <FICalculator />
        </TabsContent>

        {/* PROPERTIES TAB */}
        <TabsContent value="properties">
          <InvestmentProperties />
        </TabsContent>

        {/* INSIGHTS TAB */}
        <TabsContent value="insights">
          <WealthInsights />
        </TabsContent>

        {/* TIMELINE TAB — Sprint D */}
        <TabsContent value="timeline">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-[#DC143C]" />
              <h3 className="text-sm font-semibold">Your Wealth Story</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              A chronological record of every milestone completed and wealth win logged.
            </p>
            <WealthTimeline />
          </div>
        </TabsContent>

        {/* WINS TAB — Sprint D */}
        <TabsContent value="wins">
          <WealthWinsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
