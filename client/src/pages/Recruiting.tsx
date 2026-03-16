// Recruiting Pipeline — Kanban board with GWC assessment for team building
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Users, Search, GripVertical, Phone, Mail, Building2, DollarSign, CheckCircle2, XCircle, HelpCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { nanoid } from 'nanoid';

const STAGES = [
  { id: 'identified', label: 'Identified', color: 'bg-blue-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-amber-500' },
  { id: 'interviewing', label: 'Interviewing', color: 'bg-purple-500' },
  { id: 'offered', label: 'Offered', color: 'bg-cyan-500' },
  { id: 'accepted', label: 'Accepted', color: 'bg-emerald-500' },
  { id: 'onboarded', label: 'Onboarded', color: 'bg-green-600' },
];

const GWC_ICON: Record<string, any> = {
  yes: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  maybe: <HelpCircle className="w-4 h-4 text-amber-500" />,
  no: <XCircle className="w-4 h-4 text-red-500" />,
};

type Recruit = {
  recruitId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  currentBrokerage?: string | null;
  yearsLicensed?: number | null;
  annualVolume?: number | null;
  stage?: string | null;
  gwcGet?: string | null;
  gwcWant?: string | null;
  gwcCapacity?: string | null;
  cultureFitScore?: number | null;
  cultureFitNotes?: string | null;
  notes?: string | null;
};

export default function RecruitingPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [selectedRecruit, setSelectedRecruit] = useState<Recruit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Form state
  const [form, setForm] = useState({
    name: '', phone: '', email: '', currentBrokerage: '',
    yearsLicensed: 0, annualVolume: 0, stage: 'identified' as string,
    gwcGet: 'maybe' as string, gwcWant: 'maybe' as string, gwcCapacity: 'maybe' as string,
    cultureFitScore: 5, cultureFitNotes: '', notes: '',
  });

  const recruitsQuery = trpc.recruits.list.useQuery();
  const createMutation = trpc.recruits.create.useMutation({
    onSuccess: () => { recruitsQuery.refetch(); setAddOpen(false); resetForm(); toast.success('Recruit added'); },
  });
  const updateMutation = trpc.recruits.update.useMutation({
    onSuccess: () => { recruitsQuery.refetch(); toast.success('Recruit updated'); },
  });
  const deleteMutation = trpc.recruits.delete.useMutation({
    onSuccess: () => { recruitsQuery.refetch(); setSelectedRecruit(null); toast.success('Recruit removed'); },
  });

  const recruits: Recruit[] = (recruitsQuery.data || []) as Recruit[];

  const filteredRecruits = useMemo(() => {
    if (!searchQuery) return recruits;
    const q = searchQuery.toLowerCase();
    return recruits.filter(r => r.name.toLowerCase().includes(q) || (r.currentBrokerage || '').toLowerCase().includes(q));
  }, [recruits, searchQuery]);

  const resetForm = () => setForm({
    name: '', phone: '', email: '', currentBrokerage: '',
    yearsLicensed: 0, annualVolume: 0, stage: 'identified',
    gwcGet: 'maybe', gwcWant: 'maybe', gwcCapacity: 'maybe',
    cultureFitScore: 5, cultureFitNotes: '', notes: '',
  });

  const handleStageChange = (recruit: Recruit, newStage: string) => {
    updateMutation.mutate({ recruitId: recruit.recruitId, updates: { stage: newStage as any } });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-xl font-bold">Recruiting Pipeline</h1>
          <p className="text-xs text-muted-foreground mt-1">{recruits.length} recruits — Build your team with GWC + Culture Fit</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="h-8 pl-8 text-xs" />
          </div>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="hidden sm:block">
            <TabsList className="h-8">
              <TabsTrigger value="kanban" className="text-xs h-6 px-2">Board</TabsTrigger>
              <TabsTrigger value="list" className="text-xs h-6 px-2">List</TabsTrigger>
            </TabsList>
          </Tabs>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#DC143C] hover:bg-[#B01030] text-white text-xs h-8">
                <UserPlus className="w-3 h-3 mr-1" /> Add Recruit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">Add Recruit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Current Brokerage</Label>
                    <Input value={form.currentBrokerage} onChange={(e) => setForm(f => ({ ...f, currentBrokerage: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Years Licensed</Label>
                    <Input type="number" value={form.yearsLicensed} onChange={(e) => setForm(f => ({ ...f, yearsLicensed: parseInt(e.target.value) || 0 }))} className="h-8 text-sm font-mono" />
                  </div>
                  <div>
                    <Label className="text-xs">Annual Volume ($)</Label>
                    <Input type="number" value={form.annualVolume} onChange={(e) => setForm(f => ({ ...f, annualVolume: parseInt(e.target.value) || 0 }))} className="h-8 text-sm font-mono" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-2 block">GWC Assessment</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['gwcGet', 'gwcWant', 'gwcCapacity'] as const).map((field) => (
                      <div key={field}>
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{field.replace('gwc', '')}</Label>
                        <Select value={form[field]} onValueChange={(v) => setForm(f => ({ ...f, [field]: v }))}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="maybe">Maybe</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Culture Fit Score (1-10)</Label>
                  <Input type="number" min={1} max={10} value={form.cultureFitScore} onChange={(e) => setForm(f => ({ ...f, cultureFitScore: parseInt(e.target.value) || 5 }))} className="h-8 text-sm font-mono" />
                </div>

                <div>
                  <Label className="text-xs">Notes</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} className="text-sm min-h-[60px]" />
                </div>

                <Button
                  className="w-full bg-[#DC143C] hover:bg-[#B01030] text-white text-xs"
                  disabled={!form.name || createMutation.isPending}
                  onClick={() => createMutation.mutate({ recruitId: nanoid(), ...form, stage: form.stage as any, gwcGet: form.gwcGet as any, gwcWant: form.gwcWant as any, gwcCapacity: form.gwcCapacity as any })}
                >
                  Add Recruit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Recruits', value: recruits.length },
          { label: 'In Pipeline', value: recruits.filter(r => !['accepted', 'onboarded'].includes(r.stage || '')).length },
          { label: 'Accepted', value: recruits.filter(r => r.stage === 'accepted').length },
          { label: 'Onboarded', value: recruits.filter(r => r.stage === 'onboarded').length },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-3 text-center">
            <div className="text-lg font-mono font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground uppercase">{kpi.label}</div>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {STAGES.map((stage) => {
            const stageRecruits = filteredRecruits.filter(r => (r.stage || 'identified') === stage.id);
            return (
              <div key={stage.id} className="min-w-[260px] sm:min-w-[220px] flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                  <span className="text-xs font-semibold uppercase tracking-wider">{stage.label}</span>
                  <Badge variant="outline" className="text-[10px] ml-auto">{stageRecruits.length}</Badge>
                </div>
                <div className="space-y-2">
                  {stageRecruits.map((recruit) => (
                    <Card
                      key={recruit.recruitId}
                      className="p-3 cursor-pointer hover:border-[#DC143C]/30 transition-colors"
                      onClick={() => setSelectedRecruit(recruit)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-[#DC143C]/10 flex items-center justify-center text-[#DC143C] font-display font-bold text-xs shrink-0">
                          {recruit.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{recruit.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{recruit.currentBrokerage || 'No brokerage'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5" title="GWC: Get / Want / Capacity">
                          {GWC_ICON[recruit.gwcGet || 'maybe']}
                          {GWC_ICON[recruit.gwcWant || 'maybe']}
                          {GWC_ICON[recruit.gwcCapacity || 'maybe']}
                        </div>
                        {recruit.annualVolume ? (
                          <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                            ${(recruit.annualVolume / 1000000).toFixed(1)}M
                          </span>
                        ) : null}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Brokerage</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Stage</th>
                  <th className="text-center p-3 text-xs font-medium text-muted-foreground">GWC</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Volume</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecruits.map((r) => (
                  <tr key={r.recruitId} className="border-b hover:bg-muted/20 cursor-pointer" onClick={() => setSelectedRecruit(r)}>
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3 text-muted-foreground hidden sm:table-cell">{r.currentBrokerage || '—'}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px]">
                        {STAGES.find(s => s.id === r.stage)?.label || 'Identified'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-0.5">
                        {GWC_ICON[r.gwcGet || 'maybe']}
                        {GWC_ICON[r.gwcWant || 'maybe']}
                        {GWC_ICON[r.gwcCapacity || 'maybe']}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono hidden sm:table-cell">
                      {r.annualVolume ? `$${(r.annualVolume / 1000).toFixed(0)}K` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Recruit Detail Sheet */}
      <Sheet open={!!selectedRecruit} onOpenChange={(open) => { if (!open) setSelectedRecruit(null); }}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedRecruit && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display">{selectedRecruit.name}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3 text-sm">
                  {selectedRecruit.phone && <span className="flex items-center gap-1 text-muted-foreground"><Phone className="w-3 h-3" /> {selectedRecruit.phone}</span>}
                  {selectedRecruit.email && <span className="flex items-center gap-1 text-muted-foreground"><Mail className="w-3 h-3" /> {selectedRecruit.email}</span>}
                </div>
                {selectedRecruit.currentBrokerage && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Building2 className="w-3 h-3" /> {selectedRecruit.currentBrokerage}
                  </div>
                )}

                <div>
                  <Label className="text-xs font-semibold mb-2 block">Stage</Label>
                  <Select
                    value={selectedRecruit.stage || 'identified'}
                    onValueChange={(v) => {
                      handleStageChange(selectedRecruit, v);
                      setSelectedRecruit({ ...selectedRecruit, stage: v });
                    }}
                  >
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold mb-2 block">GWC Assessment</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['gwcGet', 'gwcWant', 'gwcCapacity'] as const).map((field) => (
                      <div key={field}>
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{field.replace('gwc', '')}</Label>
                        <Select
                          value={selectedRecruit[field] || 'maybe'}
                          onValueChange={(v) => {
                            updateMutation.mutate({ recruitId: selectedRecruit.recruitId, updates: { [field]: v as any } });
                            setSelectedRecruit({ ...selectedRecruit, [field]: v });
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="maybe">Maybe</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Years Licensed</Label>
                    <div className="text-sm font-mono">{selectedRecruit.yearsLicensed || 0}</div>
                  </div>
                  <div>
                    <Label className="text-xs">Annual Volume</Label>
                    <div className="text-sm font-mono">${((selectedRecruit.annualVolume || 0) / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <Label className="text-xs">Culture Fit</Label>
                    <div className="text-sm font-mono">{selectedRecruit.cultureFitScore || 5}/10</div>
                  </div>
                </div>

                {selectedRecruit.notes && (
                  <div>
                    <Label className="text-xs">Notes</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedRecruit.notes}</p>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-red-500 hover:text-red-600 w-full"
                  onClick={() => deleteMutation.mutate({ recruitId: selectedRecruit.recruitId })}
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Remove Recruit
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
