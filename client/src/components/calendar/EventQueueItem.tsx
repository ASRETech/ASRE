import { Calendar, ChevronRight, SkipForward, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: number;
  title: string;
  description?: string | null;
  eventType: string;
  sourceModule: string;
  suggestedDate?: string | null;
  suggestedStartTime?: string | null;
  durationMinutes?: number | null;
  status: string;
  gcalColorId?: string | null;
  remindMinutesBefore?: number | null;
  recurrenceRule?: string | null;
}

interface EventQueueItemProps {
  event: CalendarEvent;
  onPush: (id: number) => void;
  onSkip: (id: number) => void;
  isPushing?: boolean;
  canPush?: boolean;
}

const SOURCE_COLORS: Record<string, string> = {
  financial: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  wealth: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  mrea: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  lead_gen: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  weekly_pulse: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const SOURCE_LABELS: Record<string, string> = {
  financial: "Financial",
  wealth: "Wealth",
  mrea: "MREA",
  lead_gen: "Lead Gen",
  weekly_pulse: "Weekly Pulse",
};

const GCAL_COLORS: Record<string, string> = {
  "1": "#7986CB", "2": "#33B679", "3": "#8E24AA", "4": "#E67C73",
  "5": "#F6BF26", "6": "#F4511E", "7": "#039BE5", "8": "#616161",
  "9": "#3F51B5", "10": "#0B8043", "11": "#D50000",
};

export function EventQueueItem({ event, onPush, onSkip, isPushing, canPush = true }: EventQueueItemProps) {
  const colorHex = GCAL_COLORS[event.gcalColorId ?? "1"] ?? "#7986CB";
  const sourceColor = SOURCE_COLORS[event.sourceModule] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30";
  const sourceLabel = SOURCE_LABELS[event.sourceModule] ?? event.sourceModule;

  const isPushed = event.status === "pushed";
  const isSkipped = event.status === "skipped";

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border transition-all",
      isPushed ? "bg-emerald-500/5 border-emerald-500/20 opacity-70" :
      isSkipped ? "bg-slate-800/30 border-slate-700/30 opacity-50" :
      "bg-slate-800/50 border-slate-700/40 hover:border-slate-600/60"
    )}>
      {/* Color dot */}
      <div className="mt-1 w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colorHex }} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="text-sm font-medium text-white leading-tight">{event.title}</p>
            {event.description && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{event.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Badge className={cn("text-xs", sourceColor)}>{sourceLabel}</Badge>
            {isPushed && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Pushed</Badge>}
            {isSkipped && <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 text-xs"><SkipForward className="w-3 h-3 mr-1" />Skipped</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
          {event.suggestedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {event.suggestedDate}
              {event.suggestedStartTime && ` at ${event.suggestedStartTime}`}
            </span>
          )}
          {event.durationMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {event.durationMinutes}m
            </span>
          )}
          {event.recurrenceRule && (
            <span className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />
              Recurring
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isPushed && !isSkipped && (
        <div className="flex gap-1.5 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSkip(event.id)}
            className="h-7 px-2 text-slate-400 hover:text-slate-200"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            onClick={() => onPush(event.id)}
            disabled={isPushing || !canPush}
            title={!canPush ? "Connect Google Calendar first" : undefined}
            className="h-7 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs disabled:opacity-50"
          >
            Push
          </Button>
        </div>
      )}
    </div>
  );
}
