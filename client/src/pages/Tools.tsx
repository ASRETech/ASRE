// AI Tools Directory — Phase 10
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, Bookmark, BookmarkCheck, ThumbsUp,
  ExternalLink, Plus, CheckCircle2, Zap,
  Star, Shield, Filter,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'all', label: 'All Tools' },
  { value: 'lead_generation', label: 'Lead Gen & CRM' },
  { value: 'ai_writing', label: 'AI Writing' },
  { value: 'video_presentations', label: 'Video & Presentations' },
  { value: 'transaction_management', label: 'Transaction Management' },
  { value: 'financial_intelligence', label: 'Financial & Analytics' },
  { value: 'marketing_social', label: 'Marketing & Social' },
  { value: 'team_operations', label: 'Team & Operations' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'learning_coaching', label: 'Learning & Coaching' },
  { value: 'data_analytics', label: 'Data & Analytics' },
];

const TIER_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode | null }> = {
  integrated: { label: 'Works with ASRE', color: 'bg-[#DC143C]/10 text-[#DC143C] border-[#DC143C]/20', icon: <Zap className="w-3 h-3" /> },
  vetted:     { label: 'Vetted', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
  featured:   { label: 'Featured', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: <Star className="w-3 h-3" /> },
  listed:     { label: 'Community', color: 'bg-muted text-muted-foreground border-border/50', icon: null },
};

const INTEGRATION_CONFIG: Record<string, { label: string; color: string }> = {
  native:    { label: 'Native integration', color: 'text-[#DC143C]' },
  connected: { label: 'Connected', color: 'text-emerald-600' },
  planned:   { label: 'Integration planned', color: 'text-amber-500' },
  none:      { label: '', color: '' },
};

// ── Tool Card ──────────────────────────────────────────────────────
function ToolCard({ tool, userId }: { tool: any; userId: number }) {
  const [localSaved, setLocalSaved] = useState(tool.isSaved);
  const [localUpvoted, setLocalUpvoted] = useState(tool.hasUpvoted);
  const [localUpvotes, setLocalUpvotes] = useState(tool.upvoteCount);
  const [detailOpen, setDetailOpen] = useState(false);

  const saveMutation = trpc.tools.toggleSave.useMutation({
    onSuccess: (data) => {
      setLocalSaved(data.saved);
      toast.success(data.saved ? 'Saved to your toolkit' : 'Removed from toolkit');
    },
  });
  const upvoteMutation = trpc.tools.toggleUpvote.useMutation({
    onSuccess: (data) => {
      setLocalUpvoted(data.voted);
      setLocalUpvotes((n: number) => data.voted ? n + 1 : n - 1);
    },
  });

  const tier = TIER_CONFIG[tool.curationTier] || TIER_CONFIG.listed;
  const integration = INTEGRATION_CONFIG[tool.integrationStatus] || INTEGRATION_CONFIG.none;

  const handleVisit = () => {
    const url = `/api/tools/click/${tool.toolId}?userId=${userId}&source=tool_card`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Card className={`p-4 flex flex-col gap-3 hover:border-border/80 transition-colors
        ${tool.curationTier === 'integrated' ? 'border-[#DC143C]/20' : ''}`}>

        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center
            text-lg font-bold text-muted-foreground shrink-0 overflow-hidden">
            {tool.logoUrl
              ? <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-cover" />
              : tool.name.charAt(0)
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <span className="text-sm font-semibold leading-tight">{tool.name}</span>
              {tier && (
                <Badge variant="outline"
                  className={`text-[9px] flex items-center gap-0.5 px-1.5 py-0 h-4 ${tier.color}`}>
                  {tier.icon}
                  {tier.label}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{tool.tagline}</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {tool.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px]">
            {tool.pricingLabel}
          </Badge>
          {integration.label && (
            <span className={`text-[10px] flex items-center gap-1 ${integration.color}`}>
              {tool.integrationStatus === 'native' && <Zap className="w-2.5 h-2.5" />}
              {integration.label}
            </span>
          )}
        </div>

        {/* Endorsement quote */}
        {tool.endorsementQuote && (
          <div className="p-2 rounded-lg bg-muted/30 border-l-2 border-[#DC143C]/40">
            <p className="text-[10px] text-muted-foreground italic leading-relaxed line-clamp-2">
              &ldquo;{tool.endorsementQuote}&rdquo;
            </p>
            {tool.endorsementContext && (
              <p className="text-[9px] text-muted-foreground/60 mt-1">
                &mdash; Trevor Amrein &middot; {tool.endorsementContext}
              </p>
            )}
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
          <Button size="sm" className="flex-1 bg-[#DC143C] text-white text-xs h-8"
            onClick={handleVisit}>
            Visit <ExternalLink className="w-3 h-3 ml-1.5" />
          </Button>
          <button
            className={`p-2 rounded-lg border transition-colors ${
              localSaved
                ? 'border-[#DC143C]/30 bg-[#DC143C]/5 text-[#DC143C]'
                : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
            }`}
            onClick={() => saveMutation.mutate({ toolId: tool.toolId })}
            title={localSaved ? 'Remove from toolkit' : 'Save to toolkit'}
          >
            {localSaved
              ? <BookmarkCheck className="w-3.5 h-3.5" />
              : <Bookmark className="w-3.5 h-3.5" />}
          </button>
          <button
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[11px]
              transition-colors ${
              localUpvoted
                ? 'border-blue-500/30 bg-blue-500/5 text-blue-600'
                : 'border-border/50 text-muted-foreground hover:border-border'
            }`}
            onClick={() => upvoteMutation.mutate({ toolId: tool.toolId })}
          >
            <ThumbsUp className="w-3 h-3" />
            {localUpvotes > 0 && localUpvotes}
          </button>
          <button
            className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1.5"
            onClick={() => setDetailOpen(true)}
          >
            Details
          </button>
        </div>
      </Card>

      {/* Detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              {tool.name}
              {tier && (
                <Badge variant="outline" className={`text-[10px] ${tier.color}`}>
                  {tier.label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tool.description}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Pricing', tool.pricingLabel],
                ['Category', CATEGORIES.find(c => c.value === tool.category)?.label || tool.category],
                ['Integration', integration.label || 'No integration'],
                ['Best for', tool.relevantLevels
                  ? `Levels ${(tool.relevantLevels as number[]).join(', ')}`
                  : 'All levels'],
              ].map(([label, value]) => (
                <div key={label as string} className="p-3 rounded-lg bg-muted/30">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    {label}
                  </div>
                  <div className="text-xs font-medium">{value}</div>
                </div>
              ))}
            </div>
            {tool.endorsementQuote && (
              <div className="p-3 rounded-lg bg-muted/30 border-l-2 border-[#DC143C]/40">
                <p className="text-xs italic text-muted-foreground leading-relaxed">
                  &ldquo;{tool.endorsementQuote}&rdquo;
                </p>
                {tool.endorsementContext && (
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    &mdash; Trevor Amrein &middot; {tool.endorsementContext}
                  </p>
                )}
              </div>
            )}
            {tool.tags && (
              <div className="flex flex-wrap gap-1.5">
                {(tool.tags as string[]).map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                ))}
              </div>
            )}
            <Button className="w-full bg-[#DC143C] text-white" onClick={() => {
              handleVisit();
              setDetailOpen(false);
            }}>
              Visit {tool.name} <ExternalLink className="w-3.5 h-3.5 ml-2" />
            </Button>
            {tool.affiliateUrl && (
              <p className="text-[10px] text-muted-foreground text-center">
                ASRE may earn a referral fee if you subscribe through this link.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Submit Tool Dialog ─────────────────────────────────────────────
function SubmitToolDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    toolName: '', toolUrl: '', category: '', description: '', whyRecommend: '',
  });
  const submitMutation = trpc.tools.submit.useMutation({
    onSuccess: () => {
      setOpen(false);
      setForm({ toolName: '', toolUrl: '', category: '', description: '', whyRecommend: '' });
      toast.success('Tool submitted for review \u2014 thank you!');
    },
    onError: () => toast.error('Submission failed'),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <Plus className="w-3 h-3 mr-1.5" /> Suggest a Tool
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Suggest a Tool</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <p className="text-xs text-muted-foreground">
            Know a tool that should be in the directory? Share it with the community.
            Approved tools get listed and the best ones earn a vetted endorsement.
          </p>
          <Input placeholder="Tool name *" value={form.toolName}
            onChange={e => setForm(f => ({ ...f, toolName: e.target.value }))} />
          <Input placeholder="Website URL *" value={form.toolUrl}
            onChange={e => setForm(f => ({ ...f, toolUrl: e.target.value }))} />
          <Select value={form.category || 'placeholder'} onValueChange={v => setForm(f => ({ ...f, category: v === 'placeholder' ? '' : v }))}>
            <SelectTrigger className="text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder" disabled className="text-xs">Category</SelectItem>
              {CATEGORIES.filter(c => c.value && c.value !== 'all').map(c => (
                <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea placeholder="Brief description" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="min-h-[60px] text-xs resize-none" />
          <Textarea placeholder="Why do you recommend this tool? *" value={form.whyRecommend}
            onChange={e => setForm(f => ({ ...f, whyRecommend: e.target.value }))}
            className="min-h-[80px] text-xs resize-none" />
          <Button className="w-full bg-[#DC143C] text-white text-xs"
            disabled={!form.toolName || !form.toolUrl || !form.whyRecommend || submitMutation.isPending}
            onClick={() => submitMutation.mutate(form)}>
            Submit for Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Tools Page ────────────────────────────────────────────────
export default function ToolsPage() {
  const { state } = useApp();
  const userId = parseInt(state.user?.id || '0');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState(false);

  const toolsQuery = trpc.tools.list.useQuery({
    category: category === 'all' ? undefined : category,
    search: search || undefined,
    relevantToMyLevel: levelFilter,
  });

  const recsQuery = trpc.tools.myRecommendations.useQuery();
  const tools = toolsQuery.data || [];
  const recs = recsQuery.data || [];
  const currentLevel = state.user?.currentLevel ?? 1;

  const integrated = tools.filter((t: any) => t.curationTier === 'integrated' || t.curationTier === 'featured');
  const vetted = tools.filter((t: any) => t.curationTier === 'vetted');
  const community = tools.filter((t: any) => t.curationTier === 'listed');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display text-xl font-bold">AI Tools Directory</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Curated tools for real estate professionals. Vetted by the ASRE team.
            </p>
          </div>
          <SubmitToolDialog />
        </div>

        {/* Coach recommendations banner */}
        {recs.length > 0 && (
          <div className="mb-6 p-4 rounded-xl border border-[#DC143C]/20 bg-[#DC143C]/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-[#DC143C]" />
              <span className="text-sm font-semibold">Recommended by your coach</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recs.slice(0, 4).map((rec: any, i: number) => (
                <div key={rec.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-background
                  border border-border/50">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{rec.tool?.name}</div>
                    <div className="text-[10px] text-muted-foreground">{rec.tool?.tagline}</div>
                    {rec.note && (
                      <div className="text-[10px] text-[#DC143C]/80 mt-1 italic">
                        &ldquo;{rec.note}&rdquo;
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="text-[10px] h-7 shrink-0"
                    onClick={() => window.open(
                      `/api/tools/click/${rec.toolId}?userId=${userId}&source=coach_rec`,
                      '_blank'
                    )}>
                    Visit
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="directory">
          <TabsList className="h-auto flex-wrap mb-4">
            <TabsTrigger value="directory" className="text-xs">Directory</TabsTrigger>
            <TabsTrigger value="saved" className="text-xs">
              My Toolkit {tools.filter((t: any) => t.isSaved).length
                ? `(${tools.filter((t: any) => t.isSaved).length})`
                : ''}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directory">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5
                  text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search tools..." className="pl-9 h-9 text-xs" />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 text-xs w-full sm:w-48">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant={levelFilter ? 'default' : 'outline'} size="sm"
                className={`text-xs h-9 ${levelFilter ? 'bg-[#DC143C] text-white' : ''}`}
                onClick={() => setLevelFilter(v => !v)}>
                <Filter className="w-3 h-3 mr-1.5" />
                Level {currentLevel} relevant
              </Button>
            </div>

            {toolsQuery.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-48 rounded-xl bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {integrated.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-3.5 h-3.5 text-[#DC143C]" />
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Works with ASRE
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {integrated.map((tool: any) => (
                        <ToolCard key={tool.toolId} tool={tool} userId={userId} />
                      ))}
                    </div>
                  </div>
                )}

                {vetted.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Vetted by ASRE
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vetted.map((tool: any) => (
                        <ToolCard key={tool.toolId} tool={tool} userId={userId} />
                      ))}
                    </div>
                  </div>
                )}

                {community.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Community submitted
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {community.map((tool: any) => (
                        <ToolCard key={tool.toolId} tool={tool} userId={userId} />
                      ))}
                    </div>
                  </div>
                )}

                {tools.length === 0 && (
                  <div className="text-center py-16">
                    <Search className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No tools match your filters.
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="saved">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.filter((t: any) => t.isSaved).length === 0 ? (
                <div className="col-span-3 text-center py-16">
                  <Bookmark className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Save tools to build your personal toolkit.
                  </p>
                </div>
              ) : (
                tools.filter((t: any) => t.isSaved).map((tool: any) => (
                  <ToolCard key={tool.toolId} tool={tool} userId={userId} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
