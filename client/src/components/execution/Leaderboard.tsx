/**
 * Leaderboard.tsx
 *
 * Displays the top agents sorted by execution score (streak as tiebreaker).
 * Highlights the current user's position.
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame } from 'lucide-react';

interface LeaderboardEntry {
  userId: number;
  name: string;
  score: number;
  currentStreak: number;
  rank: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: number;
  isLoading?: boolean;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-base">🥇</span>;
  if (rank === 2) return <span className="text-base">🥈</span>;
  if (rank === 3) return <span className="text-base">🥉</span>;
  return (
    <span className="text-xs font-semibold text-muted-foreground w-5 text-center">
      #{rank}
    </span>
  );
}

export function Leaderboard({ entries, currentUserId, isLoading = false }: LeaderboardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <div className="animate-pulse text-muted-foreground text-sm">Loading leaderboard...</div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Leaderboard
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Complete actions to appear on the leaderboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Leaderboard
          </span>
          <Badge variant="outline" className="ml-auto text-xs">
            30-day score
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 px-4">
        {entries.slice(0, 10).map((entry) => {
          const isCurrentUser = entry.userId === currentUserId;
          return (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 py-2 px-2 rounded-lg transition-colors ${
                isCurrentUser
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="w-6 flex items-center justify-center shrink-0">
                <RankBadge rank={entry.rank} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-sm font-medium truncate ${
                      isCurrentUser ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {entry.name}
                  </span>
                  {isCurrentUser && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 border-primary/40 text-primary shrink-0">
                      you
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {entry.currentStreak > 0 && (
                  <div className="flex items-center gap-0.5 text-xs text-orange-400">
                    <Flame className="w-3 h-3" />
                    <span className="font-medium">{entry.currentStreak}</span>
                  </div>
                )}
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {entry.score.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
