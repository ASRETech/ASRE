export function StreakTracker({ days }: { days: number }) {
  return (
    <div className="rounded-2xl border bg-card p-5 text-center">
      <div className="text-sm text-muted-foreground">Execution Streak</div>
      <div className="mt-2 text-3xl font-semibold">🔥 {days}</div>
      <div className="text-xs text-muted-foreground mt-1">days in a row</div>
    </div>
  );
}
