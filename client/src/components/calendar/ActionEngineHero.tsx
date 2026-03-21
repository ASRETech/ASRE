import { Calendar, Zap, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

interface ActionEngineHeroProps {
  onConnect: () => void;
}

export function ActionEngineHero({ onConnect }: ActionEngineHeroProps) {
  const { data: status } = trpc.calendar.getStatus.useQuery();
  const { data: queue } = trpc.calendar.getEventQueue.useQuery({ limit: 200 });

  const pending = queue?.filter(e => e.status === "pending").length ?? 0;
  const pushed = queue?.filter(e => e.status === "pushed").length ?? 0;
  const total = queue?.length ?? 0;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 border border-blue-800/40 p-6 md:p-8">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.4) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/30">
            <Zap className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white">Action Engine</h1>
              {status?.connected ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Calendar Connected
                </Badge>
              ) : (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  <Clock className="w-3 h-3 mr-1" /> Not Connected
                </Badge>
              )}
            </div>
            <p className="text-blue-200/70 text-sm max-w-lg">
              Automatically generate and push business-critical events to your Google Calendar — financial deadlines, wealth milestones, lead gen blocks, and MREA deliverables.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 flex-wrap">
          <div className="text-center px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-white">{total}</div>
            <div className="text-xs text-blue-200/60">Total Events</div>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="text-2xl font-bold text-amber-400">{pending}</div>
            <div className="text-xs text-amber-200/60">Pending</div>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-2xl font-bold text-emerald-400">{pushed}</div>
            <div className="text-xs text-emerald-200/60">Pushed</div>
          </div>
        </div>
      </div>

      {!status?.connected && (
        <div className="relative mt-6 pt-6 border-t border-white/10">
          <p className="text-sm text-blue-200/60 mb-3">
            Connect your Google Calendar to start pushing events automatically.
          </p>
          <Button onClick={onConnect} className="bg-blue-600 hover:bg-blue-500 text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Connect Google Calendar
          </Button>
        </div>
      )}
    </div>
  );
}
