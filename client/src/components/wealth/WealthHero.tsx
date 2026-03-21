import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Shield } from 'lucide-react';

interface WealthHeroProps {
  journey?: {
    milestones: Array<{ milestoneKey: string; status: string | null }>;
    profile: {
      fiNumber?: string | null;
      annualExpenses?: string | null;
      savingsRatePct?: string | null;
    } | null;
    unlockedTracks: number[];
    healthScore: number;
  };
}

export function WealthHero({ journey }: WealthHeroProps) {
  const healthScore = journey?.healthScore ?? 0;
  const fiNumber = journey?.profile?.fiNumber ? Number(journey.profile.fiNumber) : null;
  const annualExpenses = journey?.profile?.annualExpenses ? Number(journey.profile.annualExpenses) : null;
  const savingsRate = journey?.profile?.savingsRatePct ? Number(journey.profile.savingsRatePct) : null;
  const unlockedCount = journey?.unlockedTracks.length ?? 1;
  const doneCount = journey?.milestones.filter(m => m.status === 'done').length ?? 0;
  const totalCount = 33;

  const scoreColor = healthScore >= 70 ? 'text-emerald-400' : healthScore >= 40 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = healthScore >= 70 ? 'bg-emerald-400/10 border-emerald-400/20' : healthScore >= 40 ? 'bg-amber-400/10 border-amber-400/20' : 'bg-red-400/10 border-red-400/20';

  return (
    <div className="rounded-xl border border-border bg-card p-6 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Wealth Journey</h2>
            <Badge variant="outline" className="text-xs">5 Tracks · 33 Milestones</Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            Your personal financial independence roadmap — running parallel to your MREA business journey.
            ASRE surfaces milestones and coaching conversations. Your CPA and advisors handle the execution.
          </p>
        </div>

        {/* Health Score */}
        <div className={`flex-shrink-0 rounded-lg border px-5 py-3 text-center ${scoreBg}`}>
          <div className={`text-3xl font-bold ${scoreColor}`}>{healthScore}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Wealth Score</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Target className="h-3 w-3" /> FI Number
          </div>
          <div className="text-lg font-semibold">
            {fiNumber ? `$${fiNumber.toLocaleString()}` : <span className="text-muted-foreground text-sm">Not set</span>}
          </div>
          {annualExpenses && (
            <div className="text-xs text-muted-foreground">${annualExpenses.toLocaleString()}/yr × 25</div>
          )}
        </div>

        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Shield className="h-3 w-3" /> Milestones Done
          </div>
          <div className="text-lg font-semibold">{doneCount}<span className="text-muted-foreground text-sm font-normal">/{totalCount}</span></div>
          <Progress value={(doneCount / totalCount) * 100} className="h-1 mt-1" />
        </div>

        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground mb-1">Tracks Unlocked</div>
          <div className="text-lg font-semibold">{unlockedCount}<span className="text-muted-foreground text-sm font-normal">/5</span></div>
          <div className="flex gap-1 mt-1">
            {[1,2,3,4,5].map(n => (
              <div key={n} className={`h-1.5 flex-1 rounded-full ${journey?.unlockedTracks.includes(n) ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground mb-1">Savings Rate</div>
          <div className="text-lg font-semibold">
            {savingsRate ? `${savingsRate}%` : <span className="text-muted-foreground text-sm">Not set</span>}
          </div>
          {savingsRate && <Progress value={Math.min(100, savingsRate * 3)} className="h-1 mt-1" />}
        </div>
      </div>
    </div>
  );
}
