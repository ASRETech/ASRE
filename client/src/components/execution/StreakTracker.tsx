/**
 * StreakTracker.tsx
 *
 * Displays the user's current streak, longest streak, and a
 * motivational message. Designed to be addictive and visible daily.
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Flame, Trophy } from 'lucide-react';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  qualifiesForStreakToday: boolean;
  completedActionsToday: number;
  isLoading?: boolean;
}

function getStreakMessage(streak: number, qualifies: boolean): string {
  if (!qualifies && streak === 0) return 'Complete 3 actions today to start your streak.';
  if (!qualifies && streak > 0) return `Don't break it — complete 3 actions to keep your ${streak}-day streak.`;
  if (streak === 0) return 'Streak started! Come back tomorrow to build it.';
  if (streak === 1) return 'Day 1 locked in. Show up tomorrow.';
  if (streak < 7) return `${streak} days strong. Keep the momentum.`;
  if (streak < 14) return `One week+ of consistent execution. You\'re building a habit.`;
  if (streak < 30) return `${streak} days. This is what separates top producers.`;
  return `${streak}-day streak. Elite level consistency.`;
}

function FlameIcon({ streak }: { streak: number }) {
  const isHot = streak >= 7;
  const isOnFire = streak >= 14;

  return (
    <div className="relative">
      <Flame
        className={`w-10 h-10 transition-colors ${
          isOnFire
            ? 'text-orange-400'
            : isHot
            ? 'text-orange-300'
            : streak > 0
            ? 'text-amber-400'
            : 'text-muted-foreground/40'
        }`}
      />
      {isOnFire && (
        <span className="absolute -top-1 -right-1 text-xs">🔥</span>
      )}
    </div>
  );
}

export function StreakTracker({
  currentStreak,
  longestStreak,
  qualifiesForStreakToday,
  completedActionsToday,
  isLoading = false,
}: StreakTrackerProps) {
  const message = getStreakMessage(currentStreak, qualifiesForStreakToday);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <div className="animate-pulse text-muted-foreground text-sm">Loading streak...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Streak
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <FlameIcon streak={currentStreak} />
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tabular-nums leading-none">
                {currentStreak}
              </span>
              <span className="text-sm text-muted-foreground">
                day{currentStreak !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Current Streak</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-snug">{message}</p>

        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
          <Trophy className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
          <span className="text-xs text-muted-foreground">
            Personal best:{' '}
            <span className="font-semibold text-foreground">{longestStreak} day{longestStreak !== 1 ? 's' : ''}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
