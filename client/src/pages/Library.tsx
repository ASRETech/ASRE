// Screen 8: Knowledge Library — SOP BUILDER + SCRIPT VAULT
// Design: "Command Center" — Categorized SOPs with step-by-step builder
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { SOP } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  BookOpen, Plus, Search, FileText, Play,
  ChevronRight, Zap, User, Bot, Copy, Edit
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

// Script vault templates
const SCRIPT_TEMPLATES = [
  {
    id: 'script-1',
    title: 'Buyer Consultation Opening',
    category: 'Buyer',
    script: `"Hi [Name], thanks for coming in today. Before we dive in, I want you to know that my goal isn't just to help you find a house — it's to help you find the RIGHT house, at the RIGHT price, with the RIGHT terms. Let me walk you through how I work so you know exactly what to expect..."`,
  },
  {
    id: 'script-2',
    title: 'Listing Presentation Close',
    category: 'Seller',
    script: `"Based on everything we've discussed — the market data, the marketing plan, and the pricing strategy — I'm confident we can get your home sold for top dollar. The next step is to sign the listing agreement so I can start working for you immediately. Shall we go ahead and get started?"`,
  },
  {
    id: 'script-3',
    title: 'FSBO Prospecting Call',
    category: 'Prospecting',
    script: `"Hi [Name], I noticed your home on [Street] is for sale by owner. I'm not calling to list your home — I actually have a question. If I could bring you a qualified buyer who's ready to purchase at your asking price, would you be willing to pay a buyer's agent commission? Great. The reason I ask is..."`,
  },
  {
    id: 'script-4',
    title: 'Expired Listing Call',
    category: 'Prospecting',
    script: `"Hi [Name], I noticed your home at [Address] was on the market but didn't sell. I'm sorry to hear that — I know that can be frustrating. I've been studying your area and I have some ideas about why it may not have sold and what we could do differently. Would you be open to a quick conversation about it?"`,
  },
  {
    id: 'script-5',
    title: 'Sphere of Influence Check-In',
    category: 'Database',
    script: `"Hey [Name], it's [Agent Name]. I was thinking about you and wanted to check in. How's everything going? ... By the way, the market in [Area] has been really interesting lately — [brief market insight]. If you or anyone you know ever has questions about real estate, I'm always here. Talk soon!"`,
  },
  {
    id: 'script-6',
    title: 'Price Reduction Conversation',
    category: 'Seller',
    script: `"[Name], I want to have an honest conversation with you about our pricing strategy. The market is telling us something through the data — we've had [X] showings, [X] online views, and [X] days on market. Based on comparable sales and buyer feedback, I'm recommending we adjust the price to [New Price]. Here's why..."`,
  },
];

export default function Library() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null);
  const [showNewSOP, setShowNewSOP] = useState(false);
  const [newSOP, setNewSOP] = useState({ name: '', category: '', steps: [{ title: '', description: '', assigneeRole: '', isAutomated: false }] });

  const sops = state.sops;
  const filteredSOPs = sops.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredScripts = SCRIPT_TEMPLATES.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSOP = () => {
    if (!newSOP.name.trim()) {
      toast.error('SOP name is required');
      return;
    }
    const sop: SOP = {
      id: `sop-${nanoid(8)}`,
      name: newSOP.name,
      category: newSOP.category || 'General',
      version: 1,
      status: 'draft',
      steps: newSOP.steps.filter(s => s.title.trim()).map((s, i) => ({
        stepNumber: i + 1,
        title: s.title,
        description: s.description,
        assigneeRole: s.assigneeRole || 'Agent',
        isAutomated: s.isAutomated,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_SOP', payload: sop });
    setShowNewSOP(false);
    setNewSOP({ name: '', category: '', steps: [{ title: '', description: '', assigneeRole: '', isAutomated: false }] });
    toast.success('SOP created!', { description: sop.name });
  };

  const addStep = () => {
    setNewSOP(prev => ({
      ...prev,
      steps: [...prev.steps, { title: '', description: '', assigneeRole: '', isAutomated: false }],
    }));
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search SOPs and scripts..." className="pl-9 w-72 h-9 text-sm" />
          </div>
          <Button onClick={() => setShowNewSOP(true)} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white h-9 text-sm">
            <Plus className="w-4 h-4 mr-1.5" /> New SOP
          </Button>
        </div>

        <Tabs defaultValue="sops" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="sops" className="text-xs">SOPs ({sops.length})</TabsTrigger>
            <TabsTrigger value="scripts" className="text-xs">Script Vault ({SCRIPT_TEMPLATES.length})</TabsTrigger>
          </TabsList>

          {/* SOPs */}
          <TabsContent value="sops">
            {filteredSOPs.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-display text-lg font-semibold mb-1">No SOPs yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first Standard Operating Procedure to systematize your business.</p>
                <Button onClick={() => setShowNewSOP(true)} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white">
                  <Plus className="w-4 h-4 mr-1.5" /> Create SOP
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredSOPs.map((sop, i) => (
                  <motion.div key={sop.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="p-4 cursor-pointer hover:border-border/80 hover:shadow-sm transition-all" onClick={() => setSelectedSOP(sop)}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">{sop.name}</div>
                            <div className="text-[10px] text-muted-foreground">{sop.category}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[9px] font-mono ${sop.status === 'active' ? 'text-emerald-500 border-emerald-500/20' : 'text-amber-500 border-amber-500/20'}`}>
                          {sop.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{sop.steps.length} steps</span>
                        <span className="font-mono">v{sop.version}</span>
                      </div>
                      <div className="mt-2 flex gap-1">
                        {sop.steps.map((step, si) => (
                          <div key={si} className={`h-1 flex-1 rounded-full ${step.isAutomated ? 'bg-[#DC143C]/40' : 'bg-muted'}`} />
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Script Vault */}
          <TabsContent value="scripts">
            <div className="grid md:grid-cols-2 gap-3">
              {filteredScripts.map((script, i) => (
                <motion.div key={script.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-medium text-foreground">{script.title}</div>
                        <Badge variant="outline" className="text-[9px] font-mono mt-1">{script.category}</Badge>
                      </div>
                      <Button
                        variant="ghost" size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          navigator.clipboard.writeText(script.script);
                          toast.success('Script copied to clipboard!');
                        }}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-4">
                      {script.script}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* SOP Detail Drawer */}
        <Sheet open={!!selectedSOP} onOpenChange={() => setSelectedSOP(null)}>
          <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="font-display">{selectedSOP?.name}</SheetTitle>
              <SheetDescription>{selectedSOP?.category} — v{selectedSOP?.version}</SheetDescription>
            </SheetHeader>
            {selectedSOP && (
              <div className="mt-4 space-y-3">
                {selectedSOP.steps.map((step) => (
                  <div key={step.stepNumber} className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 font-mono text-xs font-bold text-muted-foreground">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-foreground">{step.title}</span>
                        {step.isAutomated && (
                          <Badge variant="outline" className="text-[9px] font-mono text-[#DC143C] border-[#DC143C]/20">
                            <Zap className="w-2.5 h-2.5 mr-0.5" /> AUTO
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        {step.isAutomated ? <Bot className="w-3 h-3 text-muted-foreground" /> : <User className="w-3 h-3 text-muted-foreground" />}
                        <span className="text-[10px] text-muted-foreground">{step.assigneeRole}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* New SOP Dialog */}
        <Dialog open={showNewSOP} onOpenChange={setShowNewSOP}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Create New SOP</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">SOP Name *</Label>
                  <Input value={newSOP.name} onChange={(e) => setNewSOP(p => ({ ...p, name: e.target.value }))} className="h-9" placeholder="e.g., Buyer Onboarding" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Category</Label>
                  <Input value={newSOP.category} onChange={(e) => setNewSOP(p => ({ ...p, category: e.target.value }))} className="h-9" placeholder="e.g., Operations" />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Steps</Label>
                <div className="space-y-2">
                  {newSOP.steps.map((step, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono text-muted-foreground">Step {i + 1}</span>
                      </div>
                      <Input
                        value={step.title}
                        onChange={(e) => {
                          const steps = [...newSOP.steps];
                          steps[i] = { ...steps[i], title: e.target.value };
                          setNewSOP(p => ({ ...p, steps }));
                        }}
                        placeholder="Step title"
                        className="h-8 text-sm mb-1.5"
                      />
                      <Textarea
                        value={step.description}
                        onChange={(e) => {
                          const steps = [...newSOP.steps];
                          steps[i] = { ...steps[i], description: e.target.value };
                          setNewSOP(p => ({ ...p, steps }));
                        }}
                        placeholder="Description"
                        className="text-xs min-h-[40px]"
                      />
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addStep} className="mt-2 text-xs h-7">
                  <Plus className="w-3 h-3 mr-1" /> Add Step
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewSOP(false)}>Cancel</Button>
              <Button onClick={handleCreateSOP} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white">Create SOP</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
