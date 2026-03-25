/**
 * BigWhy.tsx — Vision Layer: Your Big Why
 *
 * Inspired by Gary Keller's "One Thing" and KW's purpose-first philosophy.
 * Stores 6 dimensions of "why" in the agent profile, persisted via tRPC.
 *
 * Dimensions (5 F's + Core):
 *   Core Why   — The overarching purpose statement
 *   Faith      — Spiritual/values foundation
 *   Family     — Who you're doing this for
 *   Financial  — Freedom number and financial purpose
 *   Fulfillment — What makes the work meaningful
 *   Fun        — What you're building toward enjoying
 */

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Heart, Save, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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

export default function BigWhy() {
  const profileQuery = trpc.profile.get.useQuery(undefined, { staleTime: 60_000 });
  const upsertMutation = trpc.profile.upsert.useMutation();

  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

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
    // Reset saved indicator after 3s
    setTimeout(() => setSaved(false), 3000);
  };

  const isLoading = profileQuery.isLoading;
  const isSaving = upsertMutation.isPending;

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
                style={{ '--tw-ring-color': field.color } as React.CSSProperties}
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
