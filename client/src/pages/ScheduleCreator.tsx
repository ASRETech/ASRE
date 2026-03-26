/**
 * ScheduleCreator.tsx — Phase 10
 * 7×48 paintable weekly schedule grid with bucket palette and MREA template
 * Phase 11 fixes: LOW-02 (MREA confirmation dialog), MED-06 (suppress save during template apply)
 */
import { useState, useMemo, useCallback, useRef } from "react";
import { Save, LayoutTemplate, Info, AlertTriangle, HelpCircle, ChevronDown, ChevronUp, CheckCircle, Loader2, CalendarCheck, CalendarX, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const { data: calStatus } = trpc.calendar.getStatus.useQuery();
  const { data: authUrlData } = trpc.calendar.getAuthUrl.useQuery();
  const utils = trpc.useUtils();

  const [grid, setGrid] = useState<string[][]>(() => emptyGrid());
  const [activeBucket, setActiveBucket] = useState<string>("");
  const [initialized, setInitialized] = useState(false);
  // LOW-02: confirmation dialog state
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);
  // MED-06: flag to suppress saves while template is being applied
  const isApplyingTemplate = useRef(false);
  // FAQ section state
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  // Save feedback state
  const [saved, setSaved] = useState(false);

  const FAQ_ITEMS = [
    {
      q: "Why does my schedule matter?",
      a: "Your schedule is the physical expression of your priorities. Gary Keller says, 'Time block your priorities before anything else gets on your calendar.' The Action Engine uses your schedule to surface the right actions at the right time."
    },
    {
      q: "What is the MREA Ideal Week?",
      a: "The Millionaire Real Estate Agent Ideal Week allocates time by activity type: Lead Generation (morning, non-negotiable), Appointments (mid-morning to early afternoon), Admin (afternoon), and Personal/Family (protected evenings and weekends)."
    },
    {
      q: "How often should I update my schedule?",
      a: "Review your schedule at the start of each 90-day sprint. Your time blocks should evolve as your business grows — a Level 1 Solo Agent has a different ideal week than a Level 4 Team Leader."
    },
    {
      q: "What if I can't stick to the schedule?",
      a: "The schedule is a target, not a prison. Track your actual time for one week, then adjust your ideal week to be realistic. Consistency over perfection — even 70% adherence compounds dramatically over a year."
    },
    {
      q: "How does this connect to my Action Engine?",
      a: "The Action Engine reads your time blocks to prioritize and sequence daily actions. Lead Gen blocks trigger prospecting actions. Appointment blocks trigger CRM follow-ups. Admin blocks trigger paperwork and system tasks."
    },
  ];

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
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      utils.schedule.getPreferences.invalidate();
      utils.schedule.getWindowRules.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const applyTemplateMutation = trpc.schedule.applyTemplate.useMutation({
    onSuccess: (data) => {
      isApplyingTemplate.current = false;
      toast.success("MREA template applied");
      setGrid(data.grid as string[][]);
      utils.schedule.getPreferences.invalidate();
    },
    onError: (err) => {
      isApplyingTemplate.current = false;
      toast.error(err.message);
    },
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
    // MED-06: Suppress save while template is being applied to avoid race condition
    if (isApplyingTemplate.current) return;
    saveMutation.mutate({ weeklyGrid: grid });
  };

  // LOW-02: Show confirmation dialog before overwriting existing schedule
  const handleApplyTemplateClick = () => {
    const hasContent = grid.some(row => row.some(cell => cell !== ""));
    if (hasContent) {
      setShowTemplateConfirm(true);
    } else {
      doApplyTemplate();
    }
  };

  const doApplyTemplate = () => {
    isApplyingTemplate.current = true;
    applyTemplateMutation.mutate({ templateName: "mrea" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Loading schedule...
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 p-4 md:p-6 max-w-7xl mx-auto asre-page-enter">
        {/* Google Calendar connection status banner */}
        {calStatus && (
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm"
            style={{
              background: calStatus.connected ? 'rgba(16,185,129,0.07)' : 'rgba(245,158,11,0.07)',
              borderColor: calStatus.connected ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)',
            }}
          >
            <div className="flex items-center gap-2.5">
              {calStatus.connected ? (
                <CalendarCheck className="w-4 h-4 shrink-0" style={{ color: '#10b981' }} />
              ) : (
                <CalendarX className="w-4 h-4 shrink-0" style={{ color: '#f59e0b' }} />
              )}
              <div>
                <span className="font-medium text-foreground">
                  {calStatus.connected ? 'Google Calendar connected' : 'Google Calendar not connected'}
                </span>
                <span className="text-muted-foreground ml-2">
                  {calStatus.connected
                    ? 'Schedule blocks sync to your calendar automatically when saved.'
                    : 'Connect Google Calendar to sync your ideal week blocks.'}
                </span>
              </div>
            </div>
            {!calStatus.connected && authUrlData?.url && (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 text-xs"
                style={{ borderColor: 'rgba(245,158,11,0.4)', color: '#f59e0b' }}
                onClick={() => window.location.href = authUrlData.url}
              >
                <ExternalLink className="w-3 h-3 mr-1.5" />
                Connect
              </Button>
            )}
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display font-bold text-foreground" style={{ fontSize: '1.5rem' }}>Schedule Creator</h1>
            <p className="text-muted-foreground mt-0.5">
              Paint your ideal week. The Action Engine uses this to place events in the right time blocks.
            </p>
          </div>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyTemplateClick}
                  disabled={applyTemplateMutation.isPending}
                  className="border-border text-muted-foreground hover:text-foreground"
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
              disabled={saveMutation.isPending || applyTemplateMutation.isPending}
              className={saved ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-[#DC143C] hover:bg-[#B01030] text-white"}
            >
              {saveMutation.isPending ? (
                <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Saving...</>
              ) : saved ? (
                <><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Saved</>
              ) : (
                <><Save className="w-3.5 h-3.5 mr-1.5" />Save Schedule</>
              )}
            </Button>
          </div>
        </div>

        {/* Block info panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-[#DC143C]/5 border-[#DC143C]/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#DC143C]" />
              <span className="text-xs font-semibold text-foreground">Lead Generation</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Your #1 priority. Block 3+ hours every morning before anything else. This is the activity that drives all GCI.</p>
          </div>
          <div className="rounded-lg border border-border bg-amber-500/5 border-amber-500/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-foreground">Appointments</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Buyer consultations, listing appointments, and closings. Schedule mid-morning through early afternoon when energy is high.</p>
          </div>
          <div className="rounded-lg border border-border bg-blue-500/5 border-blue-500/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-foreground">Admin & Systems</span>
            </div>
            <p className="text-[11px] text-muted-foreground">CRM updates, paperwork, and team communication. Batch these into afternoon blocks to protect your lead gen time.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[200px_1fr_200px] gap-4">
          {/* Bucket palette */}
          <Card className="border-border bg-card xl:sticky xl:top-4 xl:self-start">
            <CardContent className="p-3">
              <BucketPalette
                buckets={buckets ?? []}
                activeBucket={activeBucket}
                onSelect={setActiveBucket}
              />
            </CardContent>
          </Card>

          {/* Grid */}
          <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-border">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-medium text-foreground">Weekly Grid</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
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
          <Card className="border-border bg-card xl:sticky xl:top-4 xl:self-start">
            <CardHeader className="py-3 px-4 border-b border-border">
              <CardTitle className="text-base font-medium text-foreground">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <ScheduleSummary grid={grid} buckets={buckets ?? []} />
            </CardContent>
          </Card>
        </div>
      </div>

        {/* FAQ Section */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border">
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-base font-semibold text-foreground">Frequently Asked Questions</span>
          </div>
          <div className="divide-y divide-border">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-card">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/20 transition-colors"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  <span className="text-base font-medium text-foreground">{item.q}</span>
                  {faqOpen === i
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  }
                </button>
                {faqOpen === i && (
                  <div className="px-4 pb-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      {/* LOW-02: Confirmation dialog before overwriting existing schedule */}
      <AlertDialog open={showTemplateConfirm} onOpenChange={setShowTemplateConfirm}>
        <AlertDialogContent >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Replace Current Schedule?
            </AlertDialogTitle>
            <AlertDialogDescription >
              Applying the MREA template will overwrite your current schedule. This action cannot be undone.
              <br /><br />
              The MREA Ideal Week template allocates time blocks for lead generation, appointments, admin, and personal time following Gary Keller's recommended structure.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-muted-foreground hover:text-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={doApplyTemplate}
              className="bg-[#DC143C] hover:bg-[#B01030] text-white"
            >
              Apply Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
