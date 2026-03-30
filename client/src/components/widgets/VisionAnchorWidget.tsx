/**
 * VisionAnchorWidget — surfaces the agent's Core Why and next wealth milestone
 * on Execution HQ to create a daily Vision → Execution connection.
 *
 * Displays:
 * - Core Why sentence (bigWhy from agentProfiles)
 * - Daily behavior anchor (rotated by day-of-year from bigWhyBehaviorAnchors)
 * - Next incomplete wealth milestone
 * - Days since last Why check-in (nudge if > 90 days)
 */
import { trpc } from '@/lib/trpc';
import { Heart, TrendingUp, RefreshCw, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { MILESTONE_META } from '@/lib/wealthConstants';

export function VisionAnchorWidget() {
  const profileQuery = trpc.profile.get.useQuery(undefined, { staleTime: 300_000 });
  const journeyQuery = trpc.wealth.getJourney.useQuery(undefined, { staleTime: 300_000 });

  const profile = profileQuery.data as any;
  const journey = journeyQuery.data;

  const coreWhy = profile?.bigWhy ?? null;
  const anchors: string[] = profile?.bigWhyBehaviorAnchors ?? [];
  const lastSnapshotAt = profile?.bigWhyLastSnapshotAt
    ? new Date(profile.bigWhyLastSnapshotAt)
    : null;

  // Rotate behavior anchor by day-of-year
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  const todayAnchor = anchors.length > 0 ? anchors[dayOfYear % anchors.length] : null;

  // Days since last Why check-in
  const daysSinceSnapshot = lastSnapshotAt
    ? Math.floor((Date.now() - lastSnapshotAt.getTime()) / 86_400_000)
    : null;
  const showNudge = daysSinceSnapshot === null || daysSinceSnapshot > 90;

  // Next incomplete wealth milestone from unlocked tracks
  const milestones = journey?.milestones ?? [];
  const unlockedTracks = journey?.unlockedTracks ?? [1];
  const nextMilestone = milestones.find(
    (m: any) =>
      m.status !== 'done' &&
      (MILESTONE_META as any)[m.milestoneKey]?.track != null &&
      unlockedTracks.includes((MILESTONE_META as any)[m.milestoneKey]?.track)
  );
  const nextMilestoneMeta = nextMilestone
    ? (MILESTONE_META as any)[nextMilestone.milestoneKey]
    : null;

  const isLoading = profileQuery.isLoading || journeyQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-[#DC143C]" />
          <span className="text-sm font-semibold">My Vision</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#DC143C] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Empty state — not yet filled in
  if (!coreWhy) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-[#DC143C]" />
          <span className="text-sm font-semibold">My Vision</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-4">
          <div className="w-10 h-10 rounded-full bg-[#DC143C]/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-[#DC143C]" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">Your Why is your fuel</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Define it once. Let it drive every day.
            </p>
          </div>
          <Link href="/vision/big-why">
            <span className="text-xs text-[#DC143C] hover:underline cursor-pointer flex items-center gap-1">
              Write your Big Why <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#DC143C]" />
          <span className="text-sm font-semibold">My Vision</span>
        </div>
        <Link href="/vision/big-why">
          <span className="text-xs text-[#DC143C] hover:underline cursor-pointer flex items-center gap-1">
            Edit <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Core Why */}
      <div className="rounded-lg border border-[#DC143C]/20 bg-[#DC143C]/[0.03] p-3">
        <p className="text-[11px] text-[#DC143C] font-medium uppercase tracking-wider mb-1">
          My Why
        </p>
        <p className="text-sm text-foreground leading-relaxed line-clamp-3 italic">
          "{coreWhy}"
        </p>
      </div>

      {/* Today's anchor */}
      {todayAnchor && (
        <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            Today's anchor
          </p>
          <p className="text-xs text-foreground font-medium">{todayAnchor}</p>
        </div>
      )}

      {/* Next wealth milestone */}
      {nextMilestoneMeta && (
        <div className="flex items-center gap-2 rounded-lg bg-muted/20 border border-border/40 p-2.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground">Next wealth milestone</p>
            <p className="text-xs text-foreground font-medium truncate">
              {nextMilestoneMeta.label}
            </p>
          </div>
          <Link href="/vision/wealth">
            <ArrowRight className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-pointer shrink-0" />
          </Link>
        </div>
      )}

      {/* Why check-in nudge */}
      {showNudge && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 p-2.5 mt-auto">
          <RefreshCw className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-amber-600 dark:text-amber-400">
              {daysSinceSnapshot === null
                ? 'Capture your first Why reflection'
                : `${daysSinceSnapshot}d since your last reflection`}
            </p>
          </div>
          <Link href="/vision/big-why">
            <span className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer whitespace-nowrap">
              Reflect →
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
