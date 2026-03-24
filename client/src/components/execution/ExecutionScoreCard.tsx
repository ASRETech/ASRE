/**
 * ExecutionScoreCard.tsx
 *
 * Displays the user's current execution score with a visual ring,
 * today's action progress, and a motivational label.
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap } from 'lucide-react';

interface ExecutionScoreCardProps {
  score: number;
  completedActionsToday: number;
  qualifiesForStreakToday: boolean;
  isLoading?: boolean;
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 500) return { label: 'Elite Operator', color: 'text-yellow-500' };
  if (score >= 300) return { label: 'High Performer', color: 'text-emerald-500' };
  if (score >= 150) return { label: 'Building Momentum', color: 'text-blue-500' };
  if (score >= 50) return { label: 'Getting Started', color: 'text-orange-400' };
  return { label: 'Day 1 — Let\'s Go', color: 'text-muted-foreground' };
}

function ScoreRing({ score }: { score: number }) {
  const maxScore = 600;
  const pct = Math.min(score / maxScore, 1);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
        {/* Background ring */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/30"
        />
        {/* Progress ring */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="text-primary transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold tabular-nums leading-none">{score.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground mt-1">pts</span>
      </div>
    </div>
  );
}

export function ExecutionScoreCard({
  score,
  completedActionsToday,
  qualifiesForStreakToday,
  isLoading = false,
}: ExecutionScoreCardProps) {
  const { label, color } = getScoreLabel(score);
  const qualifyTarget = 3;
  const progressPct = Math.min((completedActionsToday / qualifyTarget) * 100, 100);

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-pulse text-muted-foreground text-sm">Loading score...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Execution Score
          </span>
          {qualifiesForStreakToday && (
            <Badge variant="default" className="ml-auto bg-emerald-500 text-white text-xs">
              Streak Qualified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-8">
          <ScoreRing score={score} />
          <div className="flex-1 space-y-4">
            <div>
              <p className={`text-lg font-semibold ${color}`}>{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Based on your last 30 days of execution
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Today's Actions</span>
                <span className="font-medium text-foreground">
                  {completedActionsToday} / {qualifyTarget} to qualify
                </span>
              </div>
              <Progress value={progressPct} className="h-2" />
              {!qualifiesForStreakToday && completedActionsToday < qualifyTarget && (
                <p className="text-xs text-muted-foreground">
                  Complete {qualifyTarget - completedActionsToday} more action
                  {qualifyTarget - completedActionsToday > 1 ? 's' : ''} to keep your streak alive.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
