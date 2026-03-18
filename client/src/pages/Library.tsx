// Screen: Model Library — KW Intellectual Framework + SOP Vault
// Two tabs: Models (KW model browser) and SOPs (existing SOP builder)
import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { SOP, SOPStep } from '@/lib/store';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BookOpen, Plus, Search, FileText, Play,
  ChevronRight, Zap, User, Bot, Copy, Edit,
  Target, TrendingUp, Users, Brain, BarChart3,
  ArrowRight, Star, X
} from 'lucide-react';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { Link } from 'wouter';

// ── Script vault templates ──────────────────────────────────────
const SCRIPT_TEMPLATES = [
  {
    id: 'script-1',
    title: 'Buyer Consultation Opening',
    category: 'Buyer',
    script: `"Hi [Name], thanks for coming in today. Before we dive in, I want you to know that my goal isn't just to help you find a house — it's to help you find the RIGHT house, at the RIGHT price, with the RIGHT terms. Let me walk you through how I work so you know exactly what to expect..."`,
  },
  {
    id: 'script-2',
    title: 'Listing Appointment Opener',
    category: 'Seller',
    script: `"Thank you for having me. I've done my research on your home and your neighborhood, and I'm going to show you exactly what I found. My goal today isn't to convince you to list — it's to give you the information you need to make the best decision for your family. Fair enough?"`,
  },
  {
    id: 'script-3',
    title: 'Price Reduction Conversation',
    category: 'Seller',
    script: `"[Name], I want to have a direct conversation with you about pricing. The market has spoken — we've had [X] showings and [Y] offers. What the data is telling us is that buyers see the value at a different number than we listed. Here's what I recommend, and here's why..."`,
  },
  {
    id: 'script-4',
    title: 'Referral Ask',
    category: 'SOI',
    script: `"I have a question for you — do you know anyone who's thinking about buying or selling in the next 6 months? I'm not asking you to sell them on me — just introduce us. I'll take it from there and make sure they're taken care of."`,
  },
  {
    id: 'script-5',
    title: 'FSBO Approach',
    category: 'Prospecting',
    script: `"Hi, I'm [Name] with [Brokerage]. I noticed your home is for sale by owner. I'm not calling to list your home — I'm calling because I have buyers actively looking in your neighborhood and I wanted to see if your home might be a fit. Would you be open to a conversation?"`,
  },
  {
    id: 'script-6',
    title: 'Sphere of Influence Check-In',
    category: 'Database',
    script: `"Hey [Name], it's [Agent Name]. I was thinking about you and wanted to check in. How's everything going? ... By the way, the market in [Area] has been really interesting lately — [brief market insight]. If you or anyone you know ever has questions about real estate, I'm always here. Talk soon!"`,
  },
];

// ── Category config ─────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  goal_setting: { label: 'Goal Setting', icon: Target, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  lead_generation: { label: 'Lead Generation', icon: TrendingUp, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  business_philosophy: { label: 'Business Philosophy', icon: Brain, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  team_leadership: { label: 'Team & Leadership', icon: Users, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  economic_model: { label: 'Economic Model', icon: BarChart3, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  organizational: { label: 'Organizational', icon: Zap, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  coaching: { label: 'Coaching', icon: Star, color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300' },
};

const TOOL_LINKS: Record<string, { label: string; path: string }> = {
  'one-thing': { label: 'Go to Goal Center', path: '/goals' },
  'gps': { label: 'Go to GPS Planner', path: '/goals' },
  'bold-goal': { label: 'Set Your BOLD Goal', path: '/goals' },
  '4-1-1': { label: 'Open 4-1-1 Tracker', path: '/goals' },
  '8x8': { label: 'Manage 8x8 Programs', path: '/pipeline' },
  '33-touch': { label: 'Manage 33 Touch', path: '/pipeline' },
  '36-12-3': { label: 'Run 36:12:3 Calculator', path: '/analytics' },
  'ttsa': { label: 'Open TTSA Dashboard', path: '/team' },
  'team-economic-model': { label: 'Build Team Economic Model', path: '/team' },
  'gwc': { label: 'Open TTSA Dashboard', path: '/team' },
  'economic-model': { label: 'View Financial Model', path: '/financials' },
  'accountability-ladder': { label: 'Use in Coach Session', path: '/coach' },
};

// ── Model detail renderer ───────────────────────────────────────
type ModelRecord = {
  modelId: string;
  title: string;
  category: string;
  summary: string;
  content: unknown;
  relevantLevels: unknown;
};

function ModelDetail({ model }: { model: ModelRecord }) {
  const content = model.content as Record<string, unknown>;
  const toolLink = TOOL_LINKS[model.modelId];
  const catConfig = CATEGORY_CONFIG[model.category] || CATEGORY_CONFIG.business_philosophy;
  const CatIcon = catConfig.icon;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge className={catConfig.color}>
            <CatIcon className="w-3 h-3 mr-1" />
            {catConfig.label}
          </Badge>
          {(model.relevantLevels as number[])?.length > 0 && (
            <Badge variant="outline" className="text-xs">
              Levels {(model.relevantLevels as number[]).join(', ')}
            </Badge>
          )}
        </div>
        <h2 className="text-xl font-bold text-foreground">{model.title}</h2>
        <p className="text-muted-foreground mt-2 leading-relaxed">{model.summary}</p>
      </div>

      {toolLink && (
        <Link href={toolLink.path}>
          <Button className="w-full bg-red-700 hover:bg-red-800 text-white gap-2">
            {toolLink.label}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      )}

      {content && Object.entries(content).map(([key, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return null;
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace(/_/g, ' ');

        if (Array.isArray(value)) {
          return (
            <div key={key}>
              <h3 className="font-semibold text-foreground mb-2">{label}</h3>
              <div className="space-y-2">
                {(value as Record<string, unknown>[]).map((item, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-3 text-sm">
                    {typeof item === 'string' ? (
                      <p className="text-foreground">{item}</p>
                    ) : (
                      Object.entries(item).map(([k, v]) => (
                        <div key={k} className="mb-1">
                          <span className="font-medium text-foreground capitalize">
                            {k.replace(/([A-Z])/g, ' $1')}: {' '}
                          </span>
                          <span className="text-muted-foreground">{String(v)}</span>
                        </div>
                      ))
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (typeof value === 'object' && value !== null) {
          return (
            <div key={key}>
              <h3 className="font-semibold text-foreground mb-2">{label}</h3>
              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                  <div key={k}>
                    <span className="font-medium text-foreground capitalize">
                      {k.replace(/([A-Z])/g, ' $1')}: {' '}
                    </span>
                    <span className="text-muted-foreground">
                      {Array.isArray(v) ? v.join(', ') : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div key={key}>
            <h3 className="font-semibold text-foreground mb-1">{label}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{String(value)}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── SOP Section ─────────────────────────────────────────────────
function SOPSection() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingSOP, setEditingSOP] = useState<SOP | null>(null);
  const [activeScript, setActiveScript] = useState<typeof SCRIPT_TEMPLATES[0] | null>(null);
  const [newSOP, setNewSOP] = useState<Partial<SOP>>({
    name: '', category: 'Lead Generation', steps: []
  });

  const filteredSOPs = (state.sops || []).filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveSOP = () => {
    if (!newSOP.name) return;
    const sop: SOP = {
      id: editingSOP?.id || nanoid(),
      name: newSOP.name!,
      category: newSOP.category || 'Lead Generation',
      version: editingSOP?.version || 1,
      status: editingSOP?.status || 'draft',
      steps: newSOP.steps || [],
      createdAt: editingSOP?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (editingSOP) {
      dispatch({ type: 'UPDATE_SOP', payload: { id: sop.id, updates: sop } });
    } else {
      dispatch({ type: 'ADD_SOP', payload: sop });
    }
    setShowBuilder(false);
    setEditingSOP(null);
    setNewSOP({ name: '', category: 'Lead Generation', steps: [] });
    toast.success('SOP saved');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search SOPs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => { setEditingSOP(null); setShowBuilder(true); }} className="gap-2 bg-red-700 hover:bg-red-800 text-white">
          <Plus className="w-4 h-4" /> New SOP
        </Button>
      </div>

      {/* Script Templates */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Script Vault</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SCRIPT_TEMPLATES.map(script => (
            <Card key={script.id} className="cursor-pointer hover:border-red-700/50 transition-colors" onClick={() => setActiveScript(script)}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{script.title}</p>
                    <Badge variant="outline" className="text-xs mt-1">{script.category}</Badge>
                  </div>
                  <Play className="w-4 h-4 text-red-700" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* SOPs */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Your SOPs</h3>
        {filteredSOPs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No SOPs yet. Create your first one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSOPs.map(sop => (
              <Card key={sop.id} className="hover:border-red-700/30 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{sop.name}</p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">{sop.category}</Badge>
                        <span className="text-xs text-muted-foreground">{sop.steps?.length || 0} steps</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingSOP(sop); setNewSOP({ ...sop }); setShowBuilder(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* SOP Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSOP ? 'Edit SOP' : 'New SOP'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={newSOP.name} onChange={e => setNewSOP(p => ({ ...p, name: e.target.value }))} placeholder="SOP title..." />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={newSOP.category} onChange={e => setNewSOP(p => ({ ...p, category: e.target.value }))} />
            </div>
            <div>
              <Label>Steps (one per line)</Label>
              <Textarea
                value={(newSOP.steps || []).map((s: SOPStep) => s.title).join('\n')}
                onChange={e => setNewSOP(p => ({ ...p, steps: e.target.value.split('\n').filter(Boolean).map((t, i) => ({ stepNumber: i + 1, title: t, description: '', assigneeRole: 'Agent', isAutomated: false })) }))}
                placeholder="Step 1&#10;Step 2&#10;Step 3"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuilder(false)}>Cancel</Button>
            <Button onClick={handleSaveSOP} className="bg-red-700 hover:bg-red-800 text-white">Save SOP</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Script Sheet */}
      <Sheet open={!!activeScript} onOpenChange={() => setActiveScript(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{activeScript?.title}</SheetTitle>
            <SheetDescription><Badge variant="outline">{activeScript?.category}</Badge></SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed font-mono whitespace-pre-wrap">
              {activeScript?.script}
            </div>
            <Button className="w-full gap-2" variant="outline" onClick={() => {
              navigator.clipboard.writeText(activeScript?.script || '');
              toast.success('Script copied to clipboard');
            }}>
              <Copy className="w-4 h-4" /> Copy Script
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ── Main Library Page ───────────────────────────────────────────
export default function Library() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: models = [], isLoading } = trpc.models.list.useQuery({
    category: selectedCategory || undefined,
  });

  const filtered = useMemo(() => {
    if (!search) return models;
    const q = search.toLowerCase();
    return models.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q)
    );
  }, [models, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach(m => {
      if (!groups[m.category]) groups[m.category] = [];
      groups[m.category].push(m);
    });
    return groups;
  }, [filtered]);

  const openModel = (model: typeof filtered[0]) => {
    setSelectedModel(model as unknown as ModelRecord);
    setDetailOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Tabs defaultValue="models">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="models" className="gap-2">
              <BookOpen className="w-4 h-4" /> KW Models
            </TabsTrigger>
            <TabsTrigger value="sops" className="gap-2">
              <FileText className="w-4 h-4" /> SOPs & Scripts
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── Models Tab ── */}
        <TabsContent value="models" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search KW models..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? 'default' : 'outline'}
                    size="sm"
                    className={selectedCategory === key ? 'bg-red-700 hover:bg-red-800 text-white' : ''}
                    onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {cfg.label}
                  </Button>
                );
              })}
              {selectedCategory && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No models found. Try a different search or filter.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([category, categoryModels]) => {
                const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.business_philosophy;
                const CatIcon = cfg.icon;
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3">
                      <CatIcon className="w-4 h-4 text-red-700" />
                      <h2 className="font-semibold text-foreground">{cfg.label}</h2>
                      <Badge variant="outline" className="text-xs">{categoryModels.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryModels.map(model => {
                        const toolLink = TOOL_LINKS[model.modelId];
                        return (
                          <Card
                            key={model.modelId}
                            className="cursor-pointer hover:border-red-700/50 hover:shadow-sm transition-all"
                            onClick={() => openModel(model)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-foreground truncate">{model.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{model.summary}</p>
                                  <div className="flex items-center gap-1 mt-2">
                                    {(model.relevantLevels as number[])?.length > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        L{(model.relevantLevels as number[]).join('/')}
                                      </Badge>
                                    )}
                                    {toolLink && (
                                      <Badge className="text-xs bg-red-700/10 text-red-700 border-red-700/20">
                                        Active Tool
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── SOPs Tab ── */}
        <TabsContent value="sops">
          <SOPSection />
        </TabsContent>
      </Tabs>

      {/* Model Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Model Detail</SheetTitle>
          </SheetHeader>
          {selectedModel && (
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="pr-4">
                <ModelDetail model={selectedModel} />
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
