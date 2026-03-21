import { useState } from "react";
import { Zap, RefreshCw, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { EventQueueItem } from "./EventQueueItem";
import { toast } from "sonner";

type FilterTab = "pending" | "pushed" | "skipped" | "all";

export function EventQueue() {
  const [filter, setFilter] = useState<FilterTab>("pending");
  const utils = trpc.useUtils();

  const { data: queue, isLoading } = trpc.calendar.getEventQueue.useQuery({ limit: 200 });

  const generateMutation = trpc.calendar.generateQueue.useMutation({
    onSuccess: (data) => {
      toast.success(`Generated ${data.generated} new events`);
      utils.calendar.getEventQueue.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const pushMutation = trpc.calendar.pushEvent.useMutation({
    onSuccess: () => {
      toast.success("Event pushed to Google Calendar");
      utils.calendar.getEventQueue.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const skipMutation = trpc.calendar.skipEvent.useMutation({
    onSuccess: () => {
      utils.calendar.getEventQueue.invalidate();
    },
  });

  const pushAllMutation = trpc.calendar.pushAll.useMutation({
    onSuccess: (data) => {
      toast.success(`Pushed ${data.pushed} events${data.failed > 0 ? `, ${data.failed} failed` : ""}`);
      utils.calendar.getEventQueue.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const filtered = queue?.filter(e => {
    if (filter === "all") return true;
    return e.status === filter;
  }) ?? [];

  const pendingCount = queue?.filter(e => e.status === "pending").length ?? 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-white">Event Queue</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="border-slate-600 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${generateMutation.isPending ? "animate-spin" : ""}`} />
            Generate
          </Button>
          {pendingCount > 0 && (
            <Button
              size="sm"
              onClick={() => pushAllMutation.mutate()}
              disabled={pushAllMutation.isPending}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              <ChevronsRight className="w-3.5 h-3.5 mr-1.5" />
              Push All ({pendingCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="pending" className="data-[state=active]:bg-slate-700">
            Pending {pendingCount > 0 && <span className="ml-1.5 text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="pushed" className="data-[state=active]:bg-slate-700">Pushed</TabsTrigger>
          <TabsTrigger value="skipped" className="data-[state=active]:bg-slate-700">Skipped</TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Event list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading events...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            {filter === "pending" ? (
              <div>
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No pending events. Click Generate to create your queue.</p>
              </div>
            ) : `No ${filter} events.`}
          </div>
        ) : (
          filtered.map(event => (
            <EventQueueItem
              key={event.id}
              event={event as any}
              onPush={(id) => pushMutation.mutate({ eventId: id })}
              onSkip={(id) => skipMutation.mutate({ eventId: id })}
              isPushing={pushMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}
