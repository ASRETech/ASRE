type Entry = {
  name: string;
  score: number;
  streak: number;
};

export function Leaderboard({ entries }: { entries: Entry[] }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Leaderboard</h2>
        <span className="text-xs text-muted-foreground">Top performers</span>
      </div>

      <div className="mt-4 space-y-2">
        {entries.map((e, idx) => (
          <div key={idx} className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium w-5">#{idx + 1}</span>
              <span className="font-medium">{e.name}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span>{e.score}</span>
              <span className="text-muted-foreground">🔥 {e.streak}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
