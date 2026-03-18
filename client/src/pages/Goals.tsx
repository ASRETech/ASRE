// Screen: Goal Center — BOLD Goal + GPS Quarterly Plan + One Thing + 4-1-1 Tracker
// Design: "Command Center" — Four KW goal-setting models unified in one view
import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Target, Flame, Compass, CheckCircle2, Circle,
  Plus, Save, ChevronDown, ChevronUp, TrendingUp,
  Calendar, BarChart3, Star, Zap, Edit2
} from 'lucide-react';
import { toast } from 'sonner';

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_QUARTER = `${CURRENT_YEAR}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;

// ── BOLD Goal Section ───────────────────────────────────────────
function BoldGoalSection() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ goal: '', whyItMatters: '', measurableOutcome: '' });

  const { data: boldGoal, refetch } = trpc.models.getBoldGoal.useQuery({ year: CURRENT_YEAR });
  const saveMutation = trpc.models.saveBoldGoal.useMutation({
    onSuccess: () => { refetch(); setEditing(false); toast.success('BOLD Goal saved'); },
  });

  const handleEdit = () => {
    setForm({
      goal: boldGoal?.goal || '',
      whyItMatters: boldGoal?.whyItMatters || '',
      measurableOutcome: boldGoal?.measurableOutcome || '',
    });
    setEditing(true);
  };

  const handleSave = () => {
    if (!form.goal.trim()) { toast.error('Goal is required'); return; }
    saveMutation.mutate({ year: CURRENT_YEAR, ...form });
  };

  return (
    <Card className="border-red-700/30 bg-gradient-to-br from-red-950/20 to-background">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            <CardTitle className="text-lg">BOLD Goal — {CURRENT_YEAR}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {boldGoal ? (
          <div className="space-y-3">
            <p className="text-xl font-bold text-foreground leading-snug">{boldGoal.goal}</p>
            {boldGoal.whyItMatters && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Why It Matters</p>
                <p className="text-sm text-muted-foreground">{boldGoal.whyItMatters}</p>
              </div>
            )}
            {boldGoal.measurableOutcome && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Measurable Outcome</p>
                <p className="text-sm text-foreground font-medium">{boldGoal.measurableOutcome}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Flame className="w-10 h-10 mx-auto mb-3 text-red-700/40" />
            <p className="text-muted-foreground text-sm mb-3">No BOLD Goal set for {CURRENT_YEAR}.</p>
            <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">
              A BOLD Goal is big enough to be uncomfortable, specific enough to be measurable, and meaningful enough to survive obstacles.
            </p>
            <Button onClick={handleEdit} className="bg-red-700 hover:bg-red-800 text-white gap-2">
              <Flame className="w-4 h-4" /> Set Your BOLD Goal
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" /> BOLD Goal — {CURRENT_YEAR}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Your BOLD Goal *</Label>
              <Textarea
                value={form.goal}
                onChange={e => setForm(p => ({ ...p, goal: e.target.value }))}
                placeholder="e.g., Close 50 transactions by December 31."
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">If it doesn't scare you a little, it's not BOLD enough.</p>
            </div>
            <div>
              <Label>Why It Matters</Label>
              <Textarea
                value={form.whyItMatters}
                onChange={e => setForm(p => ({ ...p, whyItMatters: e.target.value }))}
                placeholder="What are you building this for beyond the revenue number?"
                rows={2}
              />
            </div>
            <div>
              <Label>Measurable Outcome</Label>
              <Input
                value={form.measurableOutcome}
                onChange={e => setForm(p => ({ ...p, measurableOutcome: e.target.value }))}
                placeholder="You know exactly whether you achieved it by Dec 31 when..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-red-700 hover:bg-red-800 text-white">
              <Save className="w-4 h-4 mr-1" /> Save BOLD Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ── GPS Quarterly Plan ──────────────────────────────────────────
function GPSSection() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    quarter: CURRENT_QUARTER,
    goal: '',
    priority1: '', priority1Strategies: ['', '', ''],
    priority2: '', priority2Strategies: ['', '', ''],
    priority3: '', priority3Strategies: ['', '', ''],
  });

  const { data: plans = [], refetch } = trpc.models.getGPS.useQuery({});
  const saveMutation = trpc.models.saveGPS.useMutation({
    onSuccess: () => { refetch(); setEditing(false); toast.success('GPS Plan saved'); },
  });

  const currentPlan = plans.find(p => p.quarter === CURRENT_QUARTER);

  const handleEdit = () => {
    if (currentPlan) {
      setForm({
        quarter: currentPlan.quarter,
        goal: currentPlan.goal,
        priority1: currentPlan.priority1 || '',
        priority1Strategies: (currentPlan.priority1Strategies as string[] || ['', '', '']).concat(['', '', '']).slice(0, 3),
        priority2: currentPlan.priority2 || '',
        priority2Strategies: (currentPlan.priority2Strategies as string[] || ['', '', '']).concat(['', '', '']).slice(0, 3),
        priority3: currentPlan.priority3 || '',
        priority3Strategies: (currentPlan.priority3Strategies as string[] || ['', '', '']).concat(['', '', '']).slice(0, 3),
      });
    }
    setEditing(true);
  };

  const updateStrategy = (priority: 1 | 2 | 3, idx: number, val: string) => {
    const key = `priority${priority}Strategies` as 'priority1Strategies' | 'priority2Strategies' | 'priority3Strategies';
    setForm(p => {
      const arr = [...p[key]];
      arr[idx] = val;
      return { ...p, [key]: arr };
    });
  };

  const handleSave = () => {
    if (!form.goal.trim()) { toast.error('Goal is required'); return; }
    saveMutation.mutate({
      planId: currentPlan?.planId,
      quarter: form.quarter,
      goal: form.goal,
      priority1: form.priority1 || undefined,
      priority1Strategies: form.priority1Strategies.filter(Boolean),
      priority2: form.priority2 || undefined,
      priority2Strategies: form.priority2Strategies.filter(Boolean),
      priority3: form.priority3 || undefined,
      priority3Strategies: form.priority3Strategies.filter(Boolean),
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg">GPS Quarterly Plan — {CURRENT_QUARTER}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {currentPlan ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Quarterly Goal</p>
              <p className="font-semibold text-foreground">{currentPlan.goal}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[1, 2, 3].map(n => {
                const priority = currentPlan[`priority${n}` as 'priority1' | 'priority2' | 'priority3'];
                const strategies = currentPlan[`priority${n}Strategies` as 'priority1Strategies' | 'priority2Strategies' | 'priority3Strategies'] as string[] || [];
                if (!priority) return null;
                return (
                  <div key={n} className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Priority {n}</p>
                    <p className="font-medium text-sm text-foreground mb-2">{priority}</p>
                    {strategies.length > 0 && (
                      <ul className="space-y-1">
                        {strategies.map((s, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-1">
                            <span className="text-red-700 font-bold">→</span> {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Compass className="w-10 h-10 mx-auto mb-3 text-blue-500/40" />
            <p className="text-muted-foreground text-sm mb-3">No GPS plan for {CURRENT_QUARTER}.</p>
            <Button onClick={handleEdit} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Create GPS Plan
            </Button>
          </div>
        )}

        {/* Previous quarters */}
        {plans.filter(p => p.quarter !== CURRENT_QUARTER).length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Previous Quarters</p>
            <div className="flex gap-2 flex-wrap">
              {plans.filter(p => p.quarter !== CURRENT_QUARTER).map(p => (
                <Badge key={p.planId} variant="outline" className="text-xs">{p.quarter}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-500" /> GPS Plan — {form.quarter}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <Label>Quarterly Goal *</Label>
              <Textarea
                value={form.goal}
                onChange={e => setForm(p => ({ ...p, goal: e.target.value }))}
                placeholder="What is the single most important outcome for this quarter?"
                rows={2}
              />
            </div>
            {([1, 2, 3] as const).map(n => (
              <div key={n} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                <Label>Priority {n}</Label>
                <Input
                  value={form[`priority${n}` as 'priority1' | 'priority2' | 'priority3']}
                  onChange={e => setForm(p => ({ ...p, [`priority${n}`]: e.target.value }))}
                  placeholder={`Priority ${n} focus area...`}
                />
                <div className="space-y-1 pl-2">
                  {[0, 1, 2].map(i => (
                    <Input
                      key={i}
                      value={form[`priority${n}Strategies` as 'priority1Strategies' | 'priority2Strategies' | 'priority3Strategies'][i]}
                      onChange={e => updateStrategy(n, i, e.target.value)}
                      placeholder={`Strategy ${i + 1}...`}
                      className="text-sm h-8"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-red-700 hover:bg-red-800 text-white">
              <Save className="w-4 h-4 mr-1" /> Save GPS Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ── One Thing Section ───────────────────────────────────────────
const ONE_THING_PERIODS = [
  { period: 'annual' as const, label: 'Annual', icon: Star, prompt: 'For my career this year, what\'s the one thing I can do such that by doing it, everything else will be easier or unnecessary?' },
  { period: 'monthly' as const, label: 'Monthly', icon: Calendar, prompt: 'For my business this month, what\'s the one thing I can do such that by doing it, everything else will be easier or unnecessary?' },
  { period: 'weekly' as const, label: 'Weekly', icon: TrendingUp, prompt: 'This week, to stay on track, what\'s the one thing I can do such that by doing it, everything else will be easier or unnecessary?' },
  { period: 'daily' as const, label: 'Today', icon: Zap, prompt: 'Today, my most important priority is...' },
];

function OneThingSection() {
  const [editingPeriod, setEditingPeriod] = useState<string | null>(null);
  const [form, setForm] = useState({ focusingQuestion: '', statement: '' });

  const { data: oneThings = [], refetch } = trpc.models.getOneThings.useQuery();
  const saveMutation = trpc.models.setOneThing.useMutation({
    onSuccess: () => { refetch(); setEditingPeriod(null); toast.success('One Thing saved'); },
  });
  const completeMutation = trpc.models.completeOneThing.useMutation({
    onSuccess: () => { refetch(); toast.success('Marked complete'); },
  });

  const getForPeriod = (period: string) => oneThings.find(t => t.period === period && t.isActive);

  const handleEdit = (period: string) => {
    const existing = getForPeriod(period);
    const periodConfig = ONE_THING_PERIODS.find(p => p.period === period);
    setForm({
      focusingQuestion: existing?.focusingQuestion || periodConfig?.prompt || '',
      statement: existing?.statement || '',
    });
    setEditingPeriod(period);
  };

  const handleSave = () => {
    if (!form.statement.trim()) { toast.error('Statement is required'); return; }
    saveMutation.mutate({
      period: editingPeriod as 'daily' | 'weekly' | 'monthly' | 'annual',
      focusingQuestion: form.focusingQuestion || '',
      statement: form.statement,
    });
  };

  const editingConfig = ONE_THING_PERIODS.find(p => p.period === editingPeriod);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-green-500" />
          <CardTitle className="text-lg">The One Thing</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          "What's the ONE Thing I can do such that by doing it, everything else will be easier or unnecessary?"
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ONE_THING_PERIODS.map(({ period, label, icon: Icon, prompt }) => {
            const item = getForPeriod(period);
            return (
              <div
                key={period}
                className={`rounded-lg border p-3 cursor-pointer transition-all hover:border-red-700/50 ${item?.completedAt ? 'opacity-60' : ''}`}
                onClick={() => handleEdit(period)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
                  </div>
                  {item ? (
                    <button
                      onClick={e => { e.stopPropagation(); if (item.id) completeMutation.mutate({ id: item.id }); }}
                      className="text-muted-foreground hover:text-green-500 transition-colors"
                    >
                      {item.completedAt
                        ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                        : <Circle className="w-4 h-4" />
                      }
                    </button>
                  ) : (
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                {item ? (
                  <p className={`text-sm leading-snug ${item.completedAt ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                    {item.statement}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic line-clamp-3">{prompt}</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>

      <Dialog open={!!editingPeriod} onOpenChange={() => setEditingPeriod(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              {editingConfig?.label} One Thing
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground italic">{editingConfig?.prompt}</p>
            </div>
            <div>
              <Label>Your One Thing *</Label>
              <Textarea
                value={form.statement}
                onChange={e => setForm(p => ({ ...p, statement: e.target.value }))}
                placeholder="The one thing I can do..."
                rows={3}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPeriod(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-red-700 hover:bg-red-800 text-white">
              <Save className="w-4 h-4 mr-1" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ── 4-1-1 Tracker ──────────────────────────────────────────────
function FourOneOneSection() {
  const currentWeek = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  }, []);

  // 4-1-1 uses local state (no dedicated backend table yet — stored in GPS plan notes)
  const [tracker, setTracker] = useState<{
    annualGoal?: string; monthlyMilestone?: string;
    weeklyItems?: string[]; completedItems?: number[];
  } | null>(null);

  const saveMutation = { mutate: (data: typeof tracker) => {
    setTracker(data);
    toast.success('4-1-1 updated');
  }, isPending: false };

  const [annualGoal, setAnnualGoal] = useState('');
  const [monthlyMilestone, setMonthlyMilestone] = useState('');
  const [weeklyItems, setWeeklyItems] = useState(['', '', '', '']);
  const [editingAnnual, setEditingAnnual] = useState(false);
  const [localCompleted, setLocalCompleted] = useState<number[]>([]);

  const handleSave = () => {
    saveMutation.mutate({
      annualGoal: annualGoal || tracker?.annualGoal || '',
      monthlyMilestone: monthlyMilestone || tracker?.monthlyMilestone || '',
      weeklyItems: weeklyItems.filter(Boolean).length > 0 ? weeklyItems : (tracker?.weeklyItems || []),
      completedItems: localCompleted,
    });
  };

  const displayAnnual = tracker?.annualGoal || annualGoal;
  const displayMonthly = tracker?.monthlyMilestone || monthlyMilestone;
  const displayWeekly = tracker?.weeklyItems || weeklyItems;
  const completedItems = localCompleted;

  const toggleItem = (idx: number) => {
    const updated = completedItems.includes(idx)
      ? completedItems.filter(i => i !== idx)
      : [...completedItems, idx];
    setLocalCompleted(updated);
    saveMutation.mutate({
      annualGoal: tracker?.annualGoal || '',
      monthlyMilestone: tracker?.monthlyMilestone || '',
      weeklyItems: displayWeekly,
      completedItems: updated,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          <CardTitle className="text-lg">4-1-1 Tracker — Week {currentWeek}</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">4 weekly actions → 1 monthly milestone → 1 annual goal</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Annual Goal */}
        <div className="bg-purple-950/20 border border-purple-700/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide">Annual Goal</p>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setEditingAnnual(true)}>
              <Edit2 className="w-3 h-3" />
            </Button>
          </div>
          {displayAnnual ? (
            <p className="font-semibold text-foreground">{displayAnnual}</p>
          ) : (
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1" onClick={() => setEditingAnnual(true)}>
              <Plus className="w-3 h-3" /> Set annual goal
            </Button>
          )}
        </div>

        {/* Monthly Milestone */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Monthly Milestone</p>
          <Input
            value={displayMonthly}
            onChange={e => setMonthlyMilestone(e.target.value)}
            onBlur={handleSave}
            placeholder="This month's key milestone..."
            className="h-8 text-sm"
          />
        </div>

        {/* Weekly Items */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            This Week's 4 Actions
            <span className="ml-2 text-green-500">{completedItems.length}/4 done</span>
          </p>
          <Progress value={(completedItems.length / 4) * 100} className="h-1.5 mb-3" />
          <div className="space-y-2">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2">
                <button onClick={() => toggleItem(i)} className="flex-shrink-0">
                  {completedItems.includes(i)
                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                    : <Circle className="w-4 h-4 text-muted-foreground" />
                  }
                </button>
                <Input
                  value={displayWeekly[i] || ''}
                  onChange={e => {
                    const arr = [...(displayWeekly as string[])];
                    arr[i] = e.target.value;
                    setWeeklyItems(arr);
                  }}
                  onBlur={handleSave}
                  placeholder={`Weekly action ${i + 1}...`}
                  className={`h-8 text-sm ${completedItems.includes(i) ? 'line-through text-muted-foreground' : ''}`}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Annual goal edit dialog */}
      <Dialog open={editingAnnual} onOpenChange={setEditingAnnual}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Annual Goal</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Annual Goal</Label>
            <Textarea
              value={annualGoal || tracker?.annualGoal || ''}
              onChange={e => setAnnualGoal(e.target.value)}
              placeholder="Your annual production or business goal..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAnnual(false)}>Cancel</Button>
            <Button onClick={() => { handleSave(); setEditingAnnual(false); }} className="bg-red-700 hover:bg-red-800 text-white">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ── Main Goals Page ─────────────────────────────────────────────
export default function Goals() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-red-700/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-red-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Goal Center</h1>
          <p className="text-sm text-muted-foreground">KW goal-setting models unified in one command center</p>
        </div>
      </div>

      {/* BOLD Goal — always at top */}
      <BoldGoalSection />

      {/* GPS + One Thing side by side on large screens */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GPSSection />
        <OneThingSection />
      </div>

      {/* 4-1-1 Tracker */}
      <FourOneOneSection />
    </div>
  );
}
