type Props = {
  score: number;
  label: 'off_track' | 'stable' | 'strong' | 'elite';
  sourceSystem: 'local' | 'command';
  streakDays: number;
};

const LABEL_COPY: Record<Props['label'], string> = {
  off_track: 'Off Track',
  stable: 'Stable',
  strong: 'Strong',
  elite: 'Elite',
};

export function ExecutionScoreCard({ score, label, sourceSystem, streakDays }: Props) {
  const circumference = 2 * Math.PI * 44;
  const progress = Math.max(0, Math.min(100, score));
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">Execution Score</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{LABEL_COPY[label]}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Powered by {sourceSystem === 'command' ? 'KW Command data' : 'local platform data'}
          </div>
        </div>
        <div className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          {streakDays} day streak
        </div>
      </div>

      <div className="mt-5 flex items-center gap-6">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="text-primary transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-semibold">{score}</div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Score</div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3 text-sm">
          <Metric label="Target" value={score >= 85 ? 'Keep pace' : 'Reach 85+'} />
          <Metric label="Behavior" value={score >= 70 ? 'Consistent' : 'Needs focus'} />
          <Metric label="Priority" value={score >= 70 ? 'Momentum' : 'Follow-up'} />
          <Metric label="Cadence" value={`${Math.max(1, Math.ceil((100 - score) / 10))} key wins needed`} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
