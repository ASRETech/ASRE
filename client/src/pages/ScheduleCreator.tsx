/**
 * ScheduleCreator.tsx — Phase 10
 * 7×48 paintable weekly schedule grid with bucket palette and MREA template
 */
import { useState, useMemo, useCallback } from "react";
import { Save, LayoutTemplate, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { WeekGrid } from "@/components/schedule/WeekGrid";
import { BucketPalette } from "@/components/schedule/BucketPalette";
import { ScheduleSummary } from "@/components/schedule/ScheduleSummary";

const DAYS = 7;
const SLOTS = 48;

function emptyGrid(): string[][] {
  return Array.from({ length: DAYS }, () => Array(SLOTS).fill(""));
}

export default function ScheduleCreator() {
  const { data: prefs, isLoading } = trpc.schedule.getPreferences.useQuery();
  const { data: buckets } = trpc.schedule.getBuckets.useQuery();
  const utils = trpc.useUtils();

  const [grid, setGrid] = useState<string[][]>(() => emptyGrid());
  const [activeBucket, setActiveBucket] = useState<string>("");
  const [initialized, setInitialized] = useState(false);

  // Initialize grid from saved preferences once loaded
  if (prefs && !initialized) {
    if (prefs.weeklyGrid && Array.isArray(prefs.weeklyGrid)) {
      setGrid(prefs.weeklyGrid as string[][]);
    }
    setInitialized(true);
  }

  const saveMutation = trpc.schedule.saveGrid.useMutation({
    onSuccess: () => {
      toast.success("Schedule saved");
      utils.schedule.getPreferences.invalidate();
      utils.schedule.getWindowRules.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const applyTemplateMutation = trpc.schedule.applyTemplate.useMutation({
    onSuccess: (data) => {
      toast.success("MREA template applied");
      setGrid(data.grid as string[][]);
      utils.schedule.getPreferences.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const bucketColors = useMemo(() => {
    const map: Record<string, string> = {};
    buckets?.forEach(b => { map[b.key] = b.color; });
    return map;
  }, [buckets]);

  const handleGridChange = useCallback((newGrid: string[][]) => {
    setGrid(newGrid);
  }, []);

  const handleSave = () => {
    saveMutation.mutate({ weeklyGrid: grid });
  };

  const handleApplyTemplate = () => {
    applyTemplateMutation.mutate({ templateName: "mrea" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Loading schedule...
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Schedule Creator</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Paint your ideal week. The Action Engine uses this to place events in the right time blocks.
            </p>
          </div>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyTemplate}
                  disabled={applyTemplateMutation.isPending}
                  className="border-slate-600 text-slate-300 hover:text-white"
                >
                  <LayoutTemplate className="w-3.5 h-3.5 mr-1.5" />
                  MREA Template
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Apply the MREA ideal week template</p>
              </TooltipContent>
            </Tooltip>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Schedule
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[200px_1fr_200px] gap-4">
          {/* Bucket palette */}
          <Card className="bg-slate-800/50 border-slate-700/50 xl:sticky xl:top-4 xl:self-start">
            <CardContent className="p-3">
              <BucketPalette
                buckets={buckets ?? []}
                activeBucket={activeBucket}
                onSelect={setActiveBucket}
              />
            </CardContent>
          </Card>

          {/* Grid */}
          <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium text-slate-300">Weekly Grid</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Click and drag to paint time blocks. Each row = 30 minutes.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <WeekGrid
                grid={grid}
                bucketColors={bucketColors}
                activeBucket={activeBucket}
                onChange={handleGridChange}
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-slate-800/50 border-slate-700/50 xl:sticky xl:top-4 xl:self-start">
            <CardHeader className="py-3 px-4 border-b border-slate-700/50">
              <CardTitle className="text-sm font-medium text-slate-300">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <ScheduleSummary grid={grid} buckets={buckets ?? []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
