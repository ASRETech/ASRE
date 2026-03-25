/**
 * BigWhy.tsx — Vision Layer: Your Big Why
 *
 * Inspired by Gary Keller's "One Thing" and KW's purpose-first philosophy.
 * Stores 6 dimensions of "why" in the agent profile, persisted via tRPC.
 * AI generation produces: Mission Statement, Purpose Paragraph, Behavior Anchors.
 */

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Heart, Save, CheckCircle, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export default function BigWhy() {
  const profileQuery = trpc.profile.get.useQuery(undefined, { staleTime: 60_000 });
  const upsertMutation = trpc.profile.upsert.useMutation();
  const generateMutation = trpc.profile.generateBigWhy.useMutation();

  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
            <h1 className="text-xl font-bold text-foreground">My Big Why</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Your purpose is your foundation. When execution gets hard, your Why pulls you forward.
            Write it clearly. Revisit it often.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!dirty || isSaving}
          className="shrink-0"
          style={{ background: '#DC143C', color: 'white' }}
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </>
          )}
        </Button>
      </div>

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
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: field.color }}
                />
                <Label className="text-sm font-semibold text-foreground">
                  {field.label}
                </Label>
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
              <span className="text-sm font-semibold text-foreground">AI Purpose Generator</span>
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
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Generate
              </>
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
                <p className="text-sm font-medium text-foreground leading-relaxed">
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
                <p className="text-sm text-foreground leading-relaxed">
                  {generated.purposeParagraph}
                </p>
              </div>
            </div>

            {/* Behavior Anchors */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">Daily Behavior Anchors</Label>
              <div className="grid gap-2">
                {generated.behaviorAnchors.map((anchor, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg bg-background border border-border/50 p-3"
                  >
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
