import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WealthHero } from '@/components/wealth/WealthHero';
import { TrackCard } from '@/components/wealth/TrackCard';
import { MilestoneList } from '@/components/wealth/MilestoneList';
import { FICalculator } from '@/components/wealth/FICalculator';
import { WealthInsights } from '@/components/wealth/WealthInsights';
import { InvestmentProperties } from '@/components/wealth/InvestmentProperties';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

type MilestoneStatus = 'not_started' | 'in_progress' | 'done';

export default function Wealth() {
  const utils = trpc.useUtils();
  const [selectedTrack, setSelectedTrack] = useState(1);

  const { data: journey, isLoading } = trpc.wealth.getJourney.useQuery();

  const updateMutation = trpc.wealth.updateMilestone.useMutation({
    onMutate: async (input) => {
      // Optimistic update
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

  const handleUpdate = (key: string, status: MilestoneStatus, notes?: string, date?: string) => {
    updateMutation.mutate({ milestoneKey: key, status, notes, completedDate: date });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-40 rounded-xl bg-muted/40 animate-pulse mb-4" />
        <div className="grid grid-cols-5 gap-3 mb-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-24 rounded-xl bg-muted/40 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto asre-page-enter">
        <WealthHero journey={journey} />

        <Tabs defaultValue="milestones" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="milestones" className="text-xs">Milestones</TabsTrigger>
            <TabsTrigger value="calculator" className="text-xs">FI Calculator</TabsTrigger>
            <TabsTrigger value="properties" className="text-xs">Properties</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
          </TabsList>

          {/* ── MILESTONES TAB ── */}
          <TabsContent value="milestones">
            <div className="grid grid-cols-5 gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(n => (
                <TrackCard
                  key={n}
                  trackNumber={n}
                  milestones={journey?.milestones ?? []}
                  unlocked={journey?.unlockedTracks.includes(n) ?? n === 1}
                  selected={selectedTrack === n}
                  onClick={() => setSelectedTrack(n)}
                />
              ))}
            </div>

            {journey?.unlockedTracks.includes(selectedTrack) ? (
              <MilestoneList
                trackNumber={selectedTrack}
                milestones={(journey?.milestones ?? []).map(m => ({
                  ...m,
                  completedDate: m.completedDate ? String(m.completedDate) : null,
                }))}
                onUpdate={handleUpdate}
                isPending={updateMutation.isPending}
              />
            ) : (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Track {selectedTrack} unlocks when your income goal reaches the required threshold.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Update your income goal in Settings → Profile to unlock additional tracks.
                </p>
              </div>
            )}
          </TabsContent>

          {/* ── FI CALCULATOR TAB ── */}
          <TabsContent value="calculator">
            <FICalculator />
          </TabsContent>

          {/* ── PROPERTIES TAB ── */}
          <TabsContent value="properties">
            <InvestmentProperties />
          </TabsContent>

          {/* ── INSIGHTS TAB ── */}
          <TabsContent value="insights">
            <WealthInsights />
          </TabsContent>
        </Tabs>
    </div>
  );
}
