/**
 * BigWhy.tsx — Vision Layer: Your Big Why
 *
 * Inspired by Gary Keller's "One Thing" and KW's purpose-first philosophy.
 * Stores 6 dimensions of "why" in the agent profile, persisted via tRPC.
 * AI generation produces: Mission Statement, Purpose Paragraph, Behavior Anchors.
 * Sprint D: + Why Moments micro-journal, Snapshot History, Drift Check
 */

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Heart, Save, CheckCircle, Sparkles, Loader2, Copy, Check,
  Plus, Trash2, Clock, ChevronDown, RefreshCw, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface WhyField {
  key: 'bigWhy' | 'bigWhyFaith' | 'bigWhyFamily' | 'bigWhyFinancial' | 'bigWhyFulfillment' | 'bigWhyFun';
  label: string;
  subtitle: string;
  placeholder: string;
  color: string;
}

const WHY_FIELDS: WhyField[] = [
  {
    key: 'bigWhy',
    label: 'My Core Why',
    subtitle: 'The one sentence that drives everything you do.',
    placeholder: 'e.g. "I build wealth and freedom so my family never has to worry, and so I can be generous beyond measure."',
    color: '#DC143C',
  },
  {
    key: 'bigWhyFaith',
    label: 'Faith',
    subtitle: 'How does your faith or values foundation shape your purpose?',
    placeholder: 'e.g. "I believe God has called me to be a faithful steward of the gifts and opportunities He\'s given me..."',
    color: '#8b5cf6',
  },
  {
    key: 'bigWhyFamily',
    label: 'Family',
    subtitle: 'Who are you building this for? What do you want for them?',
    placeholder: 'e.g. "I want my kids to see what it looks like to build something from nothing, with integrity..."',
    color: '#3b82f6',
  },
  {
    key: 'bigWhyFinancial',
    label: 'Financial',
    subtitle: 'What does financial freedom mean to you? What\'s your number?',
    placeholder: 'e.g. "My freedom number is $15K/month in passive income. That means I can choose my work, not need it..."',
    color: '#10b981',
  },
  {
    key: 'bigWhyFulfillment',
    label: 'Fulfillment',
    subtitle: 'What makes the work itself meaningful to you?',
    placeholder: 'e.g. "Helping a first-time buyer get keys to their home — that moment never gets old..."',
    color: '#f59e0b',
  },
  {
    key: 'bigWhyFun',
    label: 'Fun',
    subtitle: 'What are you building toward enjoying? What does the good life look like?',
    placeholder: 'e.g. "Traveling with my family, coaching youth sports, and having the margin to say yes to what matters..."',
    color: '#06b6d4',
  },
];

interface GeneratedContent {
  missionStatement: string;
  purposeParagraph: string;
  behaviorAnchors: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  client_win: '#DC143C',
  income_milestone: '#10b981',
  family: '#3b82f6',
  faith: '#8b5cf6',
  personal: '#f59e0b',
};
const CATEGORY_LABELS: Record<string, string> = {
  client_win: 'Client Win',
  income_milestone: 'Milestone',
  family: 'Family',
  faith: 'Faith',
  personal: 'Personal',
};

export default function BigWhy() {
  const profileQuery = trpc.profile.get.useQuery(undefined, { staleTime: 60_000 });
  const upsertMutation = trpc.profile.upsert.useMutation();
  const generateMutation = trpc.profile.generateBigWhy.useMutation();

  // Why Moments
  const momentsQuery = trpc.profile.listWhyMoments.useQuery(undefined, { staleTime: 60_000 });
  const addMomentMutation = trpc.profile.addWhyMoment.useMutation({
    onSuccess: () => { momentsQuery.refetch(); setMomentText(''); toast.success('Moment captured.'); },
  });
  const deleteMomentMutation = trpc.profile.deleteWhyMoment.useMutation({
    onSuccess: () => momentsQuery.refetch(),
  });

  // Snapshots
  const snapshotsQuery = trpc.profile.listWhySnapshots.useQuery(undefined, { staleTime: 300_000 });
  const takeSnapshotMutation = trpc.profile.takeWhySnapshot.useMutation({
    onSuccess: () => {
      snapshotsQuery.refetch();
      profileQuery.refetch();
      setReflectionNote('');
      toast.success('Reflection saved to your Why History.');
    },
  });

  // Drift Check
  const driftCheckMutation = trpc.profile.generateWhyDriftCheck.useMutation();

  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [momentText, setMomentText] = useState('');
  const [momentCategory, setMomentCategory] = useState<string>('personal');
  const [reflectionNote, setReflectionNote] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showReflectionForm, setShowReflectionForm] = useState(false);
  const [driftResult, setDriftResult] = useState<{ observations: string[]; question: string } | null>(null);

  // Load from profile when data arrives
  useEffect(() => {
    if (profileQuery.data) {
      const p = profileQuery.data as any;
      setValues({
        bigWhy: p.bigWhy ?? '',
        bigWhyFaith: p.bigWhyFaith ?? '',
        bigWhyFamily: p.bigWhyFamily ?? '',
        bigWhyFinancial: p.bigWhyFinancial ?? '',
        bigWhyFulfillment: p.bigWhyFulfillment ?? '',
        bigWhyFun: p.bigWhyFun ?? '',
      });
    }
  }, [profileQuery.data]);

  const handleChange = (key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }));
    setDirty(true);
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      await upsertMutation.mutateAsync({
        bigWhy: values.bigWhy || undefined,
        bigWhyFaith: values.bigWhyFaith || undefined,
        bigWhyFamily: values.bigWhyFamily || undefined,
        bigWhyFinancial: values.bigWhyFinancial || undefined,
        bigWhyFulfillment: values.bigWhyFulfillment || undefined,
        bigWhyFun: values.bigWhyFun || undefined,
      });
      setSaved(true);
      setDirty(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error('Failed to save. Please try again.');
    }
  };

  const handleGenerate = async () => {
    const filledCount = Object.values(values).filter(v => v && v.trim().length > 10).length;
    if (filledCount === 0) {
      toast.error('Fill in at least one Why field before generating.');
      return;
    }
    try {
      const result = await generateMutation.mutateAsync({
        bigWhy: values.bigWhy || undefined,
        bigWhyFaith: values.bigWhyFaith || undefined,
        bigWhyFamily: values.bigWhyFamily || undefined,
        bigWhyFinancial: values.bigWhyFinancial || undefined,
        bigWhyFulfillment: values.bigWhyFulfillment || undefined,
        bigWhyFun: values.bigWhyFun || undefined,
      });
      setGenerated(result);
      toast.success('Your purpose statement has been generated.');
    } catch {
      toast.error('Generation failed. Please try again.');
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDriftCheck = async () => {
    try {
      const result = await driftCheckMutation.mutateAsync();
      setDriftResult(result);
    } catch (err: any) {
      toast.error(err?.message ?? 'Drift check failed. Please try again.');
    }
  };

  const profile = profileQuery.data as any;
  const lastSnapshotAt = profile?.bigWhyLastSnapshotAt ? new Date(profile.bigWhyLastSnapshotAt) : null;
  const daysSinceSnapshot = lastSnapshotAt
    ? Math.floor((Date.now() - lastSnapshotAt.getTime()) / 86_400_000)
    : null;
  const showSnapshotNudge = daysSinceSnapshot === null || daysSinceSnapshot > 90;

  const isLoading = profileQuery.isLoading;
  const isSaving = upsertMutation.isPending;
  const isGenerating = generateMutation.isPending;
  const filledCount = Object.values(values).filter(v => v && v.trim().length > 10).length;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5" style={{ color: '#DC143C' }} />
            <h1 className="text-2xl font-bold text-foreground">My Big Why</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Your purpose is your foundation. When execution gets hard, your Why pulls you forward.
            Write it clearly. Revisit it often.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Drift Check — only when snapshots exist */}
          {(snapshotsQuery.data?.length ?? 0) > 0 && (
            <Button
              onClick={handleDriftCheck}
              disabled={driftCheckMutation.isPending}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {driftCheckMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              )}
              Drift Check
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!dirty || isSaving}
            style={{ background: '#DC143C', color: 'white' }}
          >
            {saved ? (
              <><CheckCircle className="w-4 h-4 mr-2" />Saved</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />{isSaving ? 'Saving...' : 'Save'}</>
            )}
          </Button>
        </div>
      </div>

      {/* Drift Check Result */}
      {driftResult && (
        <Card className="p-4 border-amber-500/30 bg-amber-500/5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-foreground">Quarterly Why Reflection</span>
          </div>
          <div className="space-y-2">
            {driftResult.observations.map((obs, i) => (
              <p key={i} className="text-sm text-foreground leading-relaxed">
                <span className="font-medium text-amber-600 dark:text-amber-400">{i + 1}.</span> {obs}
              </p>
            ))}
          </div>
          <div className="rounded-lg bg-background border border-border/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Coaching Question</p>
            <p className="text-sm text-foreground italic">"{driftResult.question}"</p>
          </div>
          <button
            onClick={() => setDriftResult(null)}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </Card>
      )}

      {/* Quote */}
      <blockquote
        className="border-l-4 pl-4 py-1 text-sm italic text-muted-foreground"
        style={{ borderColor: '#DC143C' }}
      >
        "People don't buy what you do, they buy why you do it. And what you do simply proves what you believe."
        <span className="block mt-1 not-italic font-medium text-foreground/60">— Simon Sinek</span>
      </blockquote>

      {/* Why Fields */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#DC143C] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          {WHY_FIELDS.map((field) => (
            <div
              key={field.key}
              className="rounded-xl border border-border/60 bg-card p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: field.color }} />
                <Label className="text-base font-semibold text-foreground">{field.label}</Label>
              </div>
              <p className="text-xs text-muted-foreground">{field.subtitle}</p>
              <Textarea
                value={values[field.key] ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="min-h-[80px] text-sm resize-none bg-background border-border/50 focus:border-[#DC143C] transition-colors"
              />
              {values[field.key] && (
                <p className="text-[10px] text-muted-foreground text-right">
                  {values[field.key].length} chars
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AI Generation Panel */}
      <Card className="p-5 border-[#DC143C]/20 bg-[#DC143C]/[0.02] space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#DC143C]" />
              <span className="text-base font-semibold text-foreground">AI Purpose Generator</span>
              <Badge variant="outline" className="text-[10px] h-4 border-[#DC143C]/30 text-[#DC143C]">
                {filledCount}/6 fields filled
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Fill in your Why fields above, then generate your Mission Statement, Purpose Paragraph, and Behavior Anchors.
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || filledCount === 0}
            size="sm"
            className="shrink-0"
            style={{ background: '#DC143C', color: 'white' }}
          >
            {isGenerating ? (
              <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Generating...</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5 mr-2" />Generate</>
            )}
          </Button>
        </div>

        {generated && (
          <div className="space-y-4 pt-2 border-t border-border/40">
            {/* Mission Statement */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">Mission Statement</Label>
                <button
                  onClick={() => handleCopy(generated.missionStatement, 'mission')}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedField === 'mission' ? (
                    <><Check className="w-3 h-3 text-emerald-500" /> Copied</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy</>
                  )}
                </button>
              </div>
              <div className="rounded-lg bg-background border border-border/50 p-3">
                <p className="text-sm text-foreground leading-relaxed italic">
                  "{generated.missionStatement}"
                </p>
              </div>
            </div>

            {/* Purpose Paragraph */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">Purpose Paragraph</Label>
                <button
                  onClick={() => handleCopy(generated.purposeParagraph, 'paragraph')}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedField === 'paragraph' ? (
                    <><Check className="w-3 h-3 text-emerald-500" /> Copied</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy</>
                  )}
                </button>
              </div>
              <div className="rounded-lg bg-background border border-border/50 p-3">
                <p className="text-sm text-foreground leading-relaxed">{generated.purposeParagraph}</p>
              </div>
            </div>

            {/* Behavior Anchors */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">Daily Behavior Anchors</Label>
              <div className="grid gap-2">
                {generated.behaviorAnchors.map((anchor, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-background border border-border/50 p-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: '#DC143C' }}
                    >
                      {i + 1}
                    </div>
                    <p className="text-sm text-foreground">{anchor}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground">
              This content was generated from your Why answers. Edit your fields and regenerate anytime.
            </p>
          </div>
        )}
      </Card>

      {/* ── WHY MOMENTS — micro-journal ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#DC143C]" />
          <h2 className="text-base font-semibold text-foreground">Moments That Prove My Why</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Capture wins, milestones, and moments that reconnect you to your purpose. These build your evidence base over time.
        </p>

        {/* Capture form */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <Textarea
            value={momentText}
            onChange={(e) => setMomentText(e.target.value)}
            placeholder='e.g. "Gave keys to a first-time buyer today. She cried. This is why I do this."'
            className="min-h-[72px] text-sm resize-none bg-background border-border/50 focus:border-[#DC143C]"
            maxLength={400}
          />
          <div className="flex items-center gap-2">
            <Select value={momentCategory} onValueChange={setMomentCategory}>
              <SelectTrigger className="h-8 text-xs w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client_win">Client Win</SelectItem>
                <SelectItem value="income_milestone">Income Milestone</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="faith">Faith</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                if (!momentText.trim()) return;
                addMomentMutation.mutate({
                  text: momentText.trim(),
                  category: momentCategory as any,
                });
              }}
              disabled={!momentText.trim() || addMomentMutation.isPending}
              size="sm"
              style={{ background: '#DC143C', color: 'white' }}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Capture
            </Button>
          </div>
        </div>

        {/* Timeline */}
        {momentsQuery.data && momentsQuery.data.length > 0 && (
          <div className="space-y-2">
            {momentsQuery.data.map((moment) => (
              <div
                key={moment.momentId}
                className="flex items-start gap-3 rounded-lg border border-border/40 bg-card/60 p-3 group"
              >
                <div
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ background: CATEGORY_COLORS[moment.category] ?? '#888' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">{moment.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{
                        background: (CATEGORY_COLORS[moment.category] ?? '#888') + '18',
                        color: CATEGORY_COLORS[moment.category] ?? '#888',
                      }}
                    >
                      {CATEGORY_LABELS[moment.category] ?? moment.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(moment.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteMomentMutation.mutate({ momentId: moment.momentId })}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── QUARTERLY REFLECTION + SNAPSHOT HISTORY ── */}
      <div className="space-y-4">
        {/* Quarterly reflection nudge */}
        {showSnapshotNudge && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-foreground">
                {daysSinceSnapshot === null ? 'Capture Your First Why Reflection' : `${daysSinceSnapshot} Days Since Your Last Reflection`}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              A quarterly snapshot preserves your Why at this moment in your journey. Future you will thank you.
            </p>
            {!showReflectionForm ? (
              <Button
                size="sm"
                variant="outline"
                className="border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                onClick={() => setShowReflectionForm(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Capture Quarterly Reflection
              </Button>
            ) : (
              <div className="space-y-2">
                <Textarea
                  value={reflectionNote}
                  onChange={(e) => setReflectionNote(e.target.value)}
                  placeholder="What's changed since you last wrote your Why? What's stayed the same? What are you most grateful for right now?"
                  className="min-h-[80px] text-sm resize-none bg-background border-border/50 focus:border-amber-500"
                  maxLength={1000}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => takeSnapshotMutation.mutate({ reflectionNote: reflectionNote || undefined })}
                    disabled={takeSnapshotMutation.isPending}
                    style={{ background: '#DC143C', color: 'white' }}
                  >
                    {takeSnapshotMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
                    Save Reflection
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowReflectionForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Snapshot History */}
        {snapshotsQuery.data && snapshotsQuery.data.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => setHistoryOpen(h => !h)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${historyOpen ? 'rotate-180' : ''}`}
              />
              Why History ({snapshotsQuery.data.length} reflection{snapshotsQuery.data.length !== 1 ? 's' : ''})
            </button>
            {historyOpen && (
              <div className="space-y-3 pl-4 border-l-2 border-[#DC143C]/20">
                {snapshotsQuery.data.map((snap) => (
                  <div key={snap.snapshotId} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(snap.createdAt).toLocaleDateString('en-US', {
                          month: 'long', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                      <span className="text-[10px] text-[#DC143C] bg-[#DC143C]/10 px-1.5 py-0.5 rounded-full">
                        Level {snap.mrealLevel}
                      </span>
                    </div>
                    {snap.bigWhy && (
                      <p className="text-sm text-foreground italic">"{snap.bigWhy}"</p>
                    )}
                    {snap.reflectionNote && (
                      <p className="text-xs text-muted-foreground">{snap.reflectionNote}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom save */}
      {dirty && (
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            style={{ background: '#DC143C', color: 'white' }}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}
