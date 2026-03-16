// Team OS — Members, Org Chart, Scorecards, Working Genius, L10 Meeting
import { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users, UserPlus, Network, BarChart3, Lightbulb, Timer,
  Mail, Phone, Star, ChevronDown, ChevronRight, Plus, X,
  Play, Pause, RotateCcw, Check, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Types
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  hireDate: string;
  level: string;
  geniusTypes: string[];
  avatar?: string;
}

interface ScorecardEntry {
  memberId: string;
  week: string;
  metrics: { label: string; value: number; goal: number }[];
}

const ROLES = ['Agent', 'Executive Assistant', 'Buyer Agent', 'Listing Specialist', 'ISA', 'Transaction Coordinator', 'Marketing Manager', 'Operations Manager'];
const GENIUS_TYPES = ['Wonder', 'Invention', 'Discernment', 'Galvanizing', 'Enablement', 'Tenacity'];
const GENIUS_DESCRIPTIONS: Record<string, string> = {
  Wonder: 'Ponders and asks "why" — sparks curiosity and big questions',
  Invention: 'Creates original ideas and solutions to problems',
  Discernment: 'Evaluates ideas with gut instinct and pattern recognition',
  Galvanizing: 'Rallies people around ideas and inspires action',
  Enablement: 'Supports and helps others succeed in their work',
  Tenacity: 'Pushes through obstacles to complete tasks and projects',
};
const GENIUS_COLORS: Record<string, string> = {
  Wonder: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  Invention: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Discernment: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Galvanizing: 'bg-red-500/10 text-red-500 border-red-500/20',
  Enablement: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Tenacity: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

export default function TeamOS() {
  const [members, setMembers] = useState<TeamMember[]>(() => {
    try { return JSON.parse(localStorage.getItem('agentos-team') || '[]'); } catch { return []; }
  });

  const saveMembers = (updated: TeamMember[]) => {
    setMembers(updated);
    localStorage.setItem('agentos-team', JSON.stringify(updated));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="members" className="space-y-4">
          <TabsList className="bg-muted/50 w-full sm:w-auto flex flex-wrap">
            <TabsTrigger value="members" className="text-xs flex-1 sm:flex-initial">
              <Users className="w-3.5 h-3.5 mr-1.5" /> Members
            </TabsTrigger>
            <TabsTrigger value="org" className="text-xs flex-1 sm:flex-initial">
              <Network className="w-3.5 h-3.5 mr-1.5" /> Org Chart
            </TabsTrigger>
            <TabsTrigger value="scorecards" className="text-xs flex-1 sm:flex-initial">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Scorecards
            </TabsTrigger>
            <TabsTrigger value="genius" className="text-xs flex-1 sm:flex-initial">
              <Lightbulb className="w-3.5 h-3.5 mr-1.5" /> Genius
            </TabsTrigger>
            <TabsTrigger value="l10" className="text-xs flex-1 sm:flex-initial">
              <Timer className="w-3.5 h-3.5 mr-1.5" /> L10
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members"><MembersTab members={members} saveMembers={saveMembers} /></TabsContent>
          <TabsContent value="org"><OrgChartTab members={members} /></TabsContent>
          <TabsContent value="scorecards"><ScorecardsTab members={members} /></TabsContent>
          <TabsContent value="genius"><GeniusTab members={members} saveMembers={saveMembers} /></TabsContent>
          <TabsContent value="l10"><L10Tab members={members} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Tab 1: Members ──────────────────────────────────────────────────
function MembersTab({ members, saveMembers }: { members: TeamMember[]; saveMembers: (m: TeamMember[]) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '' });

  const addMember = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const member: TeamMember = {
      id: `tm-${Date.now()}`,
      name: form.name,
      role: form.role || 'Agent',
      email: form.email,
      phone: form.phone,
      hireDate: new Date().toISOString().split('T')[0],
      level: 'Level 1',
      geniusTypes: [],
    };
    saveMembers([...members, member]);
    setForm({ name: '', role: '', email: '', phone: '' });
    setShowAdd(false);
    toast.success('Team member added');
  };

  const removeMember = (id: string) => {
    saveMembers(members.filter(m => m.id !== id));
    toast.success('Member removed');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Team Members ({members.length})</h3>
        <Button onClick={() => setShowAdd(true)} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white" size="sm">
          <UserPlus className="w-4 h-4 mr-1.5" /> Add Member
        </Button>
      </div>

      {members.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h4 className="font-display text-lg font-semibold mb-2 text-foreground">No team members yet</h4>
          <p className="text-sm text-muted-foreground mb-4">Add your first team member to start building your org.</p>
          <Button onClick={() => setShowAdd(true)} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white">
            <UserPlus className="w-4 h-4 mr-1.5" /> Add First Member
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(m => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-4 hover:border-[#DC143C]/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#DC143C]/10 flex items-center justify-center text-[#DC143C] font-display font-bold text-sm">
                    {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <button onClick={() => removeMember(m.id)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-display text-sm font-semibold text-foreground">{m.name}</h4>
                <Badge variant="outline" className="text-[10px] font-mono mt-1 mb-2">{m.role}</Badge>
                {m.email && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Mail className="w-3 h-3" /> {m.email}
                  </div>
                )}
                {m.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <Phone className="w-3 h-3" /> {m.phone}
                  </div>
                )}
                {m.geniusTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.geniusTypes.map(g => (
                      <Badge key={g} variant="outline" className={`text-[9px] ${GENIUS_COLORS[g] || ''}`}>{g}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Name *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Role</Label>
              <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="(555) 123-4567" className="h-9" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={addMember} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white">Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab 2: Org Chart ────────────────────────────────────────────────
function OrgChartTab({ members }: { members: TeamMember[] }) {
  const { state } = useApp();
  const level = state.user?.currentLevel ?? 1;

  // Level-adaptive org chart
  const orgLevels = useMemo(() => {
    if (level <= 2) {
      return [
        { title: 'Team Lead', roles: members.filter(m => ['Operations Manager', 'Marketing Manager'].includes(m.role)), placeholder: 'You' },
        { title: 'Support', roles: members.filter(m => ['Executive Assistant', 'Transaction Coordinator', 'ISA'].includes(m.role)), placeholder: 'First Hire: EA' },
        { title: 'Sales', roles: members.filter(m => ['Agent', 'Buyer Agent', 'Listing Specialist'].includes(m.role)), placeholder: 'Solo Agent' },
      ];
    }
    return [
      { title: 'Rainmaker', roles: [], placeholder: 'You' },
      { title: 'Operations', roles: members.filter(m => ['Operations Manager', 'Executive Assistant', 'Transaction Coordinator'].includes(m.role)), placeholder: 'Ops Manager' },
      { title: 'Sales', roles: members.filter(m => ['Agent', 'Buyer Agent', 'Listing Specialist'].includes(m.role)), placeholder: 'Buyer + Listing Agents' },
      { title: 'Marketing', roles: members.filter(m => ['Marketing Manager', 'ISA'].includes(m.role)), placeholder: 'Marketing + ISA' },
    ];
  }, [members, level]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
          <Network className="w-5 h-5 text-[#DC143C]" /> Organization Chart
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Level {level} structure — {level <= 2 ? 'Solo agent with first admin hire' : 'Growing team with department leads'}
        </p>

        <div className="flex flex-col items-center gap-4">
          {orgLevels.map((tier, i) => (
            <div key={tier.title} className="w-full">
              {i > 0 && (
                <div className="flex justify-center my-2">
                  <div className="w-px h-6 bg-border" />
                </div>
              )}
              <div className="text-center mb-2">
                <Badge variant="outline" className="text-[10px] font-mono">{tier.title}</Badge>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {tier.roles.length > 0 ? tier.roles.map(m => (
                  <Card key={m.id} className="p-3 min-w-[140px] text-center border-[#DC143C]/10">
                    <div className="w-8 h-8 rounded-full bg-[#DC143C]/10 flex items-center justify-center text-[#DC143C] font-display font-bold text-xs mx-auto mb-1">
                      {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="text-xs font-medium text-foreground">{m.name}</div>
                    <div className="text-[10px] text-muted-foreground">{m.role}</div>
                  </Card>
                )) : (
                  <Card className="p-3 min-w-[140px] text-center border-dashed">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto mb-1">
                      <Plus className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="text-xs text-muted-foreground">{tier.placeholder}</div>
                  </Card>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab 3: Scorecards ───────────────────────────────────────────────
function ScorecardsTab({ members }: { members: TeamMember[] }) {
  const [selectedMember, setSelectedMember] = useState(members[0]?.id || '');
  const [scorecards, setScorecards] = useState<Record<string, { label: string; value: number; goal: number }[]>>(() => {
    try { return JSON.parse(localStorage.getItem('agentos-scorecards') || '{}'); } catch { return {}; }
  });

  const defaultMetrics = [
    { label: 'Contacts Made', value: 0, goal: 40 },
    { label: 'Appointments Set', value: 0, goal: 6 },
    { label: 'Listings Taken', value: 0, goal: 2 },
    { label: 'Contracts Written', value: 0, goal: 3 },
    { label: 'Closings', value: 0, goal: 2 },
  ];

  const memberMetrics = scorecards[selectedMember] || defaultMetrics;

  const updateMetric = (index: number, field: 'value' | 'goal', val: number) => {
    const updated = memberMetrics.map((m, i) => i === index ? { ...m, [field]: val } : m);
    const newScorecards = { ...scorecards, [selectedMember]: updated };
    setScorecards(newScorecards);
    localStorage.setItem('agentos-scorecards', JSON.stringify(newScorecards));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#DC143C]" /> Weekly Scorecards
          </h3>
          {members.length > 0 && (
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="w-48 h-9"><SelectValue placeholder="Select member" /></SelectTrigger>
              <SelectContent>
                {members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

        {members.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Add team members first to track scorecards</p>
          </div>
        ) : (
          <div className="space-y-3">
            {memberMetrics.map((metric, i) => {
              const pct = metric.goal > 0 ? Math.round((metric.value / metric.goal) * 100) : 0;
              return (
                <div key={metric.label} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-36 sm:w-44 truncate">{metric.label}</span>
                  <Input
                    type="number"
                    value={metric.value}
                    onChange={e => updateMetric(i, 'value', parseInt(e.target.value) || 0)}
                    className="w-16 h-8 text-center font-mono text-sm"
                  />
                  <span className="text-xs text-muted-foreground">/</span>
                  <Input
                    type="number"
                    value={metric.goal}
                    onChange={e => updateMetric(i, 'goal', parseInt(e.target.value) || 0)}
                    className="w-16 h-8 text-center font-mono text-sm"
                  />
                  <Progress value={Math.min(100, pct)} className="h-2 flex-1 hidden sm:block" />
                  <span className={`text-xs font-mono w-10 text-right ${pct >= 100 ? 'text-emerald-500' : pct >= 60 ? 'text-foreground' : 'text-amber-500'}`}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Tab 4: Working Genius ───────────────────────────────────────────
function GeniusTab({ members, saveMembers }: { members: TeamMember[]; saveMembers: (m: TeamMember[]) => void }) {
  const toggleGenius = (memberId: string, genius: string) => {
    saveMembers(members.map(m => {
      if (m.id !== memberId) return m;
      const has = m.geniusTypes.includes(genius);
      return { ...m, geniusTypes: has ? m.geniusTypes.filter(g => g !== genius) : [...m.geniusTypes, genius] };
    }));
  };

  // Gap analysis
  const allGenius = members.flatMap(m => m.geniusTypes);
  const geniusCounts = GENIUS_TYPES.map(g => ({ type: g, count: allGenius.filter(a => a === g).length }));
  const gaps = geniusCounts.filter(g => g.count === 0);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[#DC143C]" /> Working Genius Assessment
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Assign each team member's top 2 Working Genius types (Lencioni model). This reveals team strengths and gaps.
        </p>

        {/* Genius type descriptions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {GENIUS_TYPES.map(g => (
            <div key={g} className={`p-3 rounded-lg border ${GENIUS_COLORS[g]}`}>
              <div className="font-display text-sm font-semibold mb-0.5">{g}</div>
              <p className="text-[10px] opacity-80">{GENIUS_DESCRIPTIONS[g]}</p>
            </div>
          ))}
        </div>

        {/* Member assignments */}
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Add team members first</div>
        ) : (
          <div className="space-y-4">
            {members.map(m => (
              <div key={m.id} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-[#DC143C]/10 flex items-center justify-center text-[#DC143C] font-display font-bold text-[10px]">
                    {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{m.name}</div>
                    <div className="text-[10px] text-muted-foreground">{m.role}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {GENIUS_TYPES.map(g => (
                    <button
                      key={g}
                      onClick={() => toggleGenius(m.id, g)}
                      className={`px-3 py-1 rounded-lg text-xs border transition-all ${
                        m.geniusTypes.includes(g)
                          ? GENIUS_COLORS[g]
                          : 'bg-muted/50 text-muted-foreground border-transparent hover:border-border'
                      }`}
                    >
                      {m.geniusTypes.includes(g) && <Check className="w-2.5 h-2.5 inline mr-0.5" />}
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Gap Analysis */}
      {members.length > 0 && (
        <Card className="p-6">
          <h4 className="font-display text-sm font-semibold mb-4">Team Genius Coverage</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {geniusCounts.map(g => (
              <div key={g.type} className={`p-3 rounded-lg text-center border ${g.count === 0 ? 'border-amber-500/30 bg-amber-500/5' : 'border-border/50 bg-muted/30'}`}>
                <div className="text-xs font-medium text-foreground mb-0.5">{g.type}</div>
                <div className={`font-mono text-lg font-bold ${g.count === 0 ? 'text-amber-500' : 'text-foreground'}`}>{g.count}</div>
                {g.count === 0 && <div className="text-[9px] text-amber-500">GAP</div>}
              </div>
            ))}
          </div>
          {gaps.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-foreground">Genius Gaps Detected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                No team member covers: {gaps.map(g => g.type).join(', ')}. Consider this when hiring or assigning responsibilities.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ─── Tab 5: L10 Meeting ──────────────────────────────────────────────
function L10Tab({ members }: { members: TeamMember[] }) {
  const [phase, setPhase] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // L10 meeting phases (EOS format)
  const phases = [
    { name: 'Segue', duration: 300, description: 'Share personal and professional good news' },
    { name: 'Scorecard', duration: 300, description: 'Review weekly metrics — on track or off track?' },
    { name: 'Rock Review', duration: 300, description: 'Review quarterly priorities — on track or off track?' },
    { name: 'Customer/Employee Headlines', duration: 300, description: 'Share key updates about customers and team' },
    { name: 'To-Do List', duration: 300, description: 'Review last week\'s to-dos — done or not done?' },
    { name: 'IDS (Identify, Discuss, Solve)', duration: 3600, description: 'Work through the issues list — most important first' },
    { name: 'Conclude', duration: 300, description: 'Recap to-dos, rate the meeting 1-10, cascading messages' },
  ];

  const [issues, setIssues] = useState<{ text: string; resolved: boolean }[]>(() => {
    try { return JSON.parse(localStorage.getItem('agentos-l10-issues') || '[]'); } catch { return []; }
  });
  const [newIssue, setNewIssue] = useState('');
  const [todos, setTodos] = useState<{ text: string; owner: string; done: boolean }[]>(() => {
    try { return JSON.parse(localStorage.getItem('agentos-l10-todos') || '[]'); } catch { return []; }
  });
  const [newTodo, setNewTodo] = useState('');
  const [todoOwner, setTodoOwner] = useState('');

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      toast.info('Time\'s up for this section!');
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timerRunning, timeLeft]);

  const startPhase = (idx: number) => {
    setPhase(idx);
    setTimeLeft(phases[idx].duration);
    setTimerRunning(true);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const addIssue = () => {
    if (!newIssue.trim()) return;
    const updated = [...issues, { text: newIssue.trim(), resolved: false }];
    setIssues(updated);
    localStorage.setItem('agentos-l10-issues', JSON.stringify(updated));
    setNewIssue('');
  };

  const toggleIssue = (i: number) => {
    const updated = issues.map((iss, idx) => idx === i ? { ...iss, resolved: !iss.resolved } : iss);
    setIssues(updated);
    localStorage.setItem('agentos-l10-issues', JSON.stringify(updated));
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const updated = [...todos, { text: newTodo.trim(), owner: todoOwner || 'Unassigned', done: false }];
    setTodos(updated);
    localStorage.setItem('agentos-l10-todos', JSON.stringify(updated));
    setNewTodo('');
    setTodoOwner('');
  };

  const toggleTodo = (i: number) => {
    const updated = todos.map((t, idx) => idx === i ? { ...t, done: !t.done } : t);
    setTodos(updated);
    localStorage.setItem('agentos-l10-todos', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      {/* Timer + Phase Navigation */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <Timer className="w-5 h-5 text-[#DC143C]" /> L10 Meeting Runner
        </h3>

        {/* Phase buttons */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {phases.map((p, i) => (
            <button
              key={p.name}
              onClick={() => startPhase(i)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                i === phase
                  ? 'bg-[#DC143C]/10 text-[#DC143C] border-[#DC143C]/20 font-medium'
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:border-border'
              }`}
            >
              {i + 1}. {p.name}
            </button>
          ))}
        </div>

        {/* Current phase */}
        <div className="p-6 rounded-xl bg-muted/30 border border-border/50 text-center">
          <Badge variant="outline" className="text-[10px] font-mono mb-2">Phase {phase + 1} of {phases.length}</Badge>
          <h4 className="font-display text-xl font-bold text-foreground mb-1">{phases[phase].name}</h4>
          <p className="text-sm text-muted-foreground mb-4">{phases[phase].description}</p>

          {/* Timer */}
          <div className="font-mono text-5xl font-bold text-[#DC143C] mb-4">{formatTime(timeLeft)}</div>
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={() => setTimerRunning(!timerRunning)}
              variant="outline"
              size="sm"
              className="h-8"
            >
              {timerRunning ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
              {timerRunning ? 'Pause' : 'Start'}
            </Button>
            <Button
              onClick={() => { setTimeLeft(phases[phase].duration); setTimerRunning(false); }}
              variant="outline"
              size="sm"
              className="h-8"
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Reset
            </Button>
            {phase < phases.length - 1 && (
              <Button
                onClick={() => startPhase(phase + 1)}
                size="sm"
                className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white h-8"
              >
                Next <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Issues List (for IDS) */}
      <Card className="p-6">
        <h4 className="font-display text-sm font-semibold mb-3">Issues List</h4>
        <div className="space-y-1.5 mb-3">
          {issues.map((iss, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30">
              <Checkbox checked={iss.resolved} onCheckedChange={() => toggleIssue(i)} />
              <span className={`text-sm flex-1 ${iss.resolved ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{iss.text}</span>
            </div>
          ))}
          {issues.length === 0 && <p className="text-xs text-muted-foreground">No issues added yet</p>}
        </div>
        <div className="flex gap-2">
          <Input value={newIssue} onChange={e => setNewIssue(e.target.value)} placeholder="Add an issue..." className="h-8 text-sm" onKeyDown={e => e.key === 'Enter' && addIssue()} />
          <Button onClick={addIssue} variant="outline" size="sm" className="h-8"><Plus className="w-3 h-3" /></Button>
        </div>
      </Card>

      {/* To-Do List */}
      <Card className="p-6">
        <h4 className="font-display text-sm font-semibold mb-3">To-Do List</h4>
        <div className="space-y-1.5 mb-3">
          {todos.map((t, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30">
              <Checkbox checked={t.done} onCheckedChange={() => toggleTodo(i)} />
              <span className={`text-sm flex-1 ${t.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{t.text}</span>
              <Badge variant="outline" className="text-[9px]">{t.owner}</Badge>
            </div>
          ))}
          {todos.length === 0 && <p className="text-xs text-muted-foreground">No to-dos yet</p>}
        </div>
        <div className="flex gap-2">
          <Input value={newTodo} onChange={e => setNewTodo(e.target.value)} placeholder="Add a to-do..." className="h-8 text-sm flex-1" onKeyDown={e => e.key === 'Enter' && addTodo()} />
          <Select value={todoOwner} onValueChange={setTodoOwner}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Owner" /></SelectTrigger>
            <SelectContent>
              {members.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
              <SelectItem value="Unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addTodo} variant="outline" size="sm" className="h-8"><Plus className="w-3 h-3" /></Button>
        </div>
      </Card>
    </div>
  );
}
