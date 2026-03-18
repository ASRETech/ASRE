// Marketing / Content Studio — AI content generation
import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles, Copy, RefreshCw,
  Loader2, Megaphone, CalendarDays, Database, Magnet, FileText,
  Mail, Share2, Users, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const CONTENT_TYPES = [
  'Social Post', 'Email Newsletter', 'Listing Description',
  'Market Update', 'Agent Bio', 'Buyer Guide', 'Seller Guide', 'Review Response'
];
const TONES = ['Professional', 'Friendly', 'Educational', 'Conversational', 'Urgent'];
const PLATFORMS = ['Facebook', 'Instagram', 'LinkedIn', 'Email', 'Blog', 'YouTube'];

export default function Marketing() {
  const { state } = useApp();
  const leads = state.leads;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="studio" className="space-y-4">
          <TabsList className="bg-muted/50 w-full sm:w-auto flex flex-wrap">
            <TabsTrigger value="studio" className="text-xs flex-1 sm:flex-initial">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Content Studio
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs flex-1 sm:flex-initial">
              <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> Calendar
            </TabsTrigger>
            <TabsTrigger value="database" className="text-xs flex-1 sm:flex-initial">
              <Database className="w-3.5 h-3.5 mr-1.5" /> Database Marketing
            </TabsTrigger>
            <TabsTrigger value="magnets" className="text-xs flex-1 sm:flex-initial">
              <Magnet className="w-3.5 h-3.5 mr-1.5" /> Lead Magnets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="studio"><ContentStudioTab /></TabsContent>
          <TabsContent value="calendar"><CalendarTab /></TabsContent>
          <TabsContent value="database"><DatabaseMarketingTab leads={leads} /></TabsContent>
          <TabsContent value="magnets"><LeadMagnetsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Tab 1: Content Studio ───────────────────────────────────────────
function ContentStudioTab() {
  const { state } = useApp();
  const [contentType, setContentType] = useState('Social Post');
  const [tone, setTone] = useState('Professional');
  const [platform, setPlatform] = useState('Facebook');
  const [context, setContext] = useState('');
  const [generated, setGenerated] = useState('');
  const [generating, setGenerating] = useState(false);
  const coachMutation = trpc.coaching.ask.useMutation();

  const generate = () => {
    setGenerating(true);
    setGenerated('');

    coachMutation.mutate({
      context: 'content-generation',
      prompt: `Generate a ${contentType} for a real estate agent.
Tone: ${tone}
${platform ? 'Platform: ' + platform : ''}
Context/topic: ${context || 'General real estate content'}

Requirements:
- NO Fair Housing violations
- NO discriminatory language
- Property features only, never neighborhood demographics
- Authentic, not generic
- Appropriate length for ${contentType}

Return ONLY the content. No explanation or preamble.`,
      agentLevel: state.user?.currentLevel,
    }, {
      onSuccess: (data) => {
        setGenerated(data.response);
        setGenerating(false);
      },
      onError: () => { setGenerating(false); toast.error('Generation failed'); },
    });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6">
      {/* Left: Controls */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#DC143C]" />
          AI Content Generator
        </h3>

        {/* Content Type */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Content Type</label>
          <div className="flex flex-wrap gap-1.5">
            {CONTENT_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setContentType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  contentType === t
                    ? 'bg-[#DC143C] text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Tone</label>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map(t => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tone === t
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Platform */}
        {(contentType === 'Social Post' || contentType === 'Email Newsletter') && (
          <div className="mb-4">
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Platform</label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    platform === p
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Context */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Context / Topic</label>
          <Textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="e.g., New listing at 123 Main St, 4BR/3BA, $450K, renovated kitchen..."
            className="min-h-[100px] text-sm"
          />
        </div>

        <Button
          onClick={generate}
          disabled={generating}
          className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white w-full sm:w-auto"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-1.5" /> Generate Content</>
          )}
        </Button>
      </Card>

      {/* Right: Output */}
      <div className="space-y-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-display text-sm font-semibold">Generated Content</h4>

          </div>

          {generating ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : generated ? (
            <>
              <Textarea
                value={generated}
                onChange={e => setGenerated(e.target.value)}
                className="min-h-[200px] text-sm leading-relaxed mb-3"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => { navigator.clipboard.writeText(generated); toast.success('Copied!'); }}
                >
                  <Copy className="w-3 h-3 mr-1" /> Copy
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={generate}>
                  <RefreshCw className="w-3 h-3 mr-1" /> Regenerate
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info('Feature coming soon')}>
                  <CalendarDays className="w-3 h-3 mr-1" /> Schedule
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Configure your content and click Generate</p>
            </div>
          )}
        </Card>


      </div>
    </div>
  );
}

// ─── Tab 2: Calendar ─────────────────────────────────────────────────
function CalendarTab() {
  const now = new Date();
  const [currentMonth] = useState(now.getMonth());
  const [currentYear] = useState(now.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">{monthName}</h3>
        <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info('Feature coming soon')}>
          + Schedule Content
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="bg-muted/50 p-2 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-background p-2 min-h-[60px] sm:min-h-[80px]" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === now.getDate() && currentMonth === now.getMonth();
          return (
            <div
              key={day}
              className={`bg-background p-2 min-h-[60px] sm:min-h-[80px] cursor-pointer hover:bg-muted/30 transition-colors ${
                isToday ? 'ring-1 ring-[#DC143C]/30' : ''
              }`}
              onClick={() => toast.info('Content scheduling coming soon')}
            >
              <span className={`text-xs font-mono ${isToday ? 'text-[#DC143C] font-bold' : 'text-muted-foreground'}`}>
                {day}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center">
        Click any date to schedule content. Content dots will appear as you create and schedule posts.
      </p>
    </Card>
  );
}

// ─── Tab 3: Database Marketing ───────────────────────────────────────
function DatabaseMarketingTab({ leads }: { leads: any[] }) {
  const [dbSize, setDbSize] = useState(100);

  // 36:12:3 calculator — manual input, honest planning tool
  const contactsPerYear = dbSize * 36;
  const contactsPerWeek = Math.ceil(contactsPerYear / 52);
  const projectedTx = Math.round(dbSize * 0.03);
  const avgGCI = 9500;
  const projectedIncome = projectedTx * avgGCI;

  const segments = [
    { label: 'Past Clients', count: leads.filter(l => l.stage === 'Closed').length, color: 'bg-emerald-500', desc: 'Previous closings in pipeline' },
    { label: 'Sphere', count: leads.filter(l => l.source === 'Sphere of Influence').length, color: 'bg-violet-500', desc: 'Sphere of Influence tagged' },
    { label: 'Active', count: leads.filter(l => !['Closed', 'Dead'].includes(l.stage)).length, color: 'bg-blue-500', desc: 'Active pipeline records' },
  ];

  return (
    <div className="space-y-6">
      {/* Pipeline segments — based on stage, not contact timing */}
      <div className="grid grid-cols-3 gap-3">
        {segments.map(seg => (
          <Card key={seg.label} className="p-4 text-center">
            <div className={`w-3 h-3 rounded-full ${seg.color} mx-auto mb-2`} />
            <div className="font-mono text-2xl font-bold text-foreground">{seg.count}</div>
            <div className="text-xs font-medium text-foreground">{seg.label}</div>
            <div className="text-[10px] text-muted-foreground">{seg.desc}</div>
          </Card>
        ))}
      </div>

      {/* 36:12:3 Planning Calculator — honest: agents enter DB size, plan in Command */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#DC143C]" />
          36:12:3 Database Planning Calculator
        </h3>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Enter your full Met database size (managed in Command).
          AgentOS calculates the contact cadence and projected production
          the 36:12:3 model recommends.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground w-36">Your database size</label>
            <input
              type="number"
              value={dbSize}
              onChange={e => setDbSize(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-28 h-9 border border-border rounded-lg px-3 text-sm font-mono bg-background"
            />
            <span className="text-xs text-muted-foreground">contacts in Command</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">Contacts needed per year (36×)</span>
            <span className="font-mono text-lg font-bold text-foreground">{contactsPerYear.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">Weekly contact target</span>
            <span className="font-mono text-lg font-bold text-[#DC143C]">{contactsPerWeek} contacts/week</span>
          </div>
          <div className="flex items-center justify-center text-muted-foreground text-xs">
            → at 36:12:3 model rate (3 transactions per 100 people)
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">Projected annual transactions</span>
            <span className="font-mono text-lg font-bold text-foreground">{projectedTx}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#DC143C]/5 border border-[#DC143C]/10">
            <span className="text-sm font-medium text-foreground">Projected annual GCI</span>
            <span className="font-mono text-xl font-bold text-[#DC143C]">${projectedIncome.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">
            Execute your 36:12:3 contact plan in Command or your preferred CRM.
            Use the 4-1-1 in your Goal Center to track weekly contact activity against this target.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ─── Tab 4: Lead Magnets ─────────────────────────────────────────────
function LeadMagnetsTab() {
  const magnets = [
    { title: 'Home Value Estimator', icon: TrendingUp, leads: 0, conversion: '—' },
    { title: 'First-Time Buyer Guide', icon: FileText, leads: 0, conversion: '—' },
    { title: "Seller's Checklist", icon: FileText, leads: 0, conversion: '—' },
    { title: 'Market Report', icon: TrendingUp, leads: 0, conversion: '—' },
    { title: 'Relocation Guide', icon: Users, leads: 0, conversion: '—' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {magnets.map(m => (
          <motion.div key={m.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#DC143C]/10 flex items-center justify-center">
                  <m.icon className="w-5 h-5 text-[#DC143C]" />
                </div>
                <h4 className="font-display text-sm font-semibold">{m.title}</h4>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-3">
                <span>Leads Captured: <span className="font-mono text-foreground">{m.leads}</span></span>
                <span>Conv. Rate: <span className="font-mono text-foreground">{m.conversion}</span></span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(`https://yourdomain.com/lead-magnet/${m.title.toLowerCase().replace(/\s+/g, '-')}`);
                  toast.success('Share link copied!');
                }}
              >
                <Share2 className="w-3 h-3 mr-1" /> Get Share Link
              </Button>
            </Card>
          </motion.div>
        ))}

        {/* Add new */}
        <Card className="p-5 border-dashed flex items-center justify-center min-h-[160px] cursor-pointer hover:bg-muted/20 transition-colors"
          onClick={() => toast.info('Custom lead magnet builder coming soon')}
        >
          <div className="text-center text-muted-foreground">
            <Magnet className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">+ Create Lead Magnet</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
