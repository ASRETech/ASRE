/**
 * Onboarding.tsx — Sprint D Group 4: First-Win Redesign
 *
 * 5-step flow designed to get a new user to their "first win" within 5 minutes:
 *   Step 1 — Welcome + Basics (name, market center, MREA level)
 *   Step 2 — Your Goal (GCI goal + live breakdown preview)
 *   Step 3 — Your First Lead (quick-add lead form, skippable)
 *   Step 4 — Your First Action (static action card preview)
 *   Step 5 — Complete (2.5s celebration screen then auto-redirect to /execution)
 *
 * Sprint B/C constraints preserved:
 *   - profileMutation.mutate() still fires on completion
 *   - ASRE branding (not AgentOS)
 *   - generateDeliverables() still called for local state
 */

import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LEVELS } from '@/lib/store';
import { generateDeliverables } from '@/lib/mockData';
import { trpc } from '@/lib/trpc';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Lock, Check, Zap, CheckCircle2 } from 'lucide-react';
import { nanoid } from 'nanoid';

const ONBOARDING_HERO =
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663267868321/DsnBpPCR9zPt6H566oZapB/onboarding-hero-X6E5CaPazPrJLybWpKQtMB.webp';

const TOTAL_STEPS = 5;

const LEAD_SOURCES = ['Sphere', 'Referral', 'Open House', 'Other'] as const;
const LEAD_STAGES = ['New', 'Active'] as const;

type LeadSource = (typeof LEAD_SOURCES)[number];
type LeadStage = (typeof LEAD_STAGES)[number];

// ── GCI breakdown helper ──────────────────────────────────────────────────────
function computeGciBreakdown(goal: number) {
  const closings = Math.round(goal / 6000);
  const weeklyContacts = Math.round((closings / 48) * 36);
  return { closings, weeklyContacts };
}

// ── Static action card text ───────────────────────────────────────────────────
function buildFirstAction(level: number, weeklyContacts: number): string {
  if (level <= 2 && weeklyContacts > 0) {
    return `Make 5 contacts from your sphere today. Your weekly contact goal is approximately ${weeklyContacts}.`;
  }
  if (level >= 3) {
    return 'Review your 90-day sprint plan and confirm your weekly contact target aligns with your GCI goal.';
  }
  return 'Open your Action Engine daily for your recommended next steps.';
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            i + 1 <= current ? 'bg-[#DC143C]' : 'bg-white/10'
          }`}
        />
      ))}
      <span className="text-white/30 text-xs font-mono ml-2 shrink-0">
        {current} of {total}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Onboarding() {
  const [, navigate] = useLocation();
  const { dispatch } = useApp();

  const profileMutation = trpc.profile.upsert.useMutation();
  const createLeadMutation = trpc.leads.create.useMutation();

  const [step, setStep] = useState(1);

  // Step 1: Basics
  const [name, setName] = useState('');
  const [marketCenter, setMarketCenter] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(1);

  // Step 2: Goal
  const [incomeGoalRaw, setIncomeGoalRaw] = useState('250000');
  const incomeGoal = parseInt(incomeGoalRaw.replace(/\D/g, '')) || 0;
  const { closings, weeklyContacts } = computeGciBreakdown(incomeGoal);

  // Step 3: First Lead
  const [leadName, setLeadName] = useState('');
  const [leadSource, setLeadSource] = useState<LeadSource>('Sphere');
  const [leadStage, setLeadStage] = useState<LeadStage>('New');
  const [leadGci, setLeadGci] = useState('');
  const [leadSkipped, setLeadSkipped] = useState(false);

  const canProceed = (): boolean => {
    if (step === 1) return name.trim().length > 0;
    if (step === 3) return leadSkipped || leadName.trim().length > 0;
    return true;
  };

  // Final completion — fires when step 5 mounts
  const handleComplete = useCallback(() => {
    profileMutation.mutate({
      name: name || undefined,
      marketCenter: marketCenter || undefined,
      currentLevel: selectedLevel,
      incomeGoal: incomeGoal || undefined,
    });

    dispatch({
      type: 'SET_USER',
      payload: {
        id: 'user-1',
        name: name || 'Agent',
        email: '',
        brokerage: 'Keller Williams',
        marketCenter: marketCenter || '',
        state: 'OH',
        yearsExperience: 1,
        gciLastYear: 0,
        teamSize: 1,
        currentLevel: selectedLevel,
        operationalScore: 0,
        incomeGoal: incomeGoal,
        diagnosticAnswers: {},
        topProblems: [],
      },
    });
    dispatch({ type: 'SET_ONBOARDED', payload: true });
    dispatch({ type: 'SET_DELIVERABLES', payload: generateDeliverables(selectedLevel) });

    setTimeout(() => navigate('/execution'), 2500);
  }, [name, marketCenter, selectedLevel, incomeGoal, dispatch, navigate, profileMutation]);

  // Handle Next button
  const handleNext = useCallback(async () => {
    if (step === 3 && !leadSkipped && leadName.trim()) {
      try {
        await createLeadMutation.mutateAsync({
          leadId: nanoid(16),
          firstName: leadName.trim().split(' ')[0] || leadName.trim(),
          lastName: leadName.trim().split(' ').slice(1).join(' ') || undefined,
          source: leadSource,
          stage: leadStage,
          budget: leadGci ? parseInt(leadGci.replace(/\D/g, '')) || undefined : undefined,
        });
      } catch {
        // Non-blocking
      }
    }
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  }, [step, leadSkipped, leadName, leadSource, leadStage, leadGci, createLeadMutation]);

  // Trigger completion when step 5 renders
  useEffect(() => {
    if (step === 5) handleComplete();
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Left visual panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center">
        <img
          src={ONBOARDING_HERO}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 px-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#DC143C] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight">ASRE</span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight mb-4">
            Your business has a
            <br />
            <span className="text-[#DC143C]">proven path.</span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-md">
            ASRE guides you through the MREA 7-Level framework — one deliverable at a time. No guesswork. Just execution.
          </p>
          <div className="mt-12 flex items-center gap-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 ${
                    i + 1 === step
                      ? 'bg-[#DC143C] text-white scale-110'
                      : i + 1 < step
                      ? 'bg-[#DC143C]/30 text-[#DC143C]'
                      : 'bg-white/10 text-white/30'
                  }`}
                >
                  {i + 1 < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                {i < TOTAL_STEPS - 1 && (
                  <div className={`w-6 h-0.5 ${i + 1 < step ? 'bg-[#DC143C]/30' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right content panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#DC143C] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold">ASRE</span>
          </div>

          <StepIndicator current={step} total={TOTAL_STEPS} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* ── Step 1: Welcome + Basics ── */}
              {step === 1 && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider font-mono mb-2">
                    Welcome to ASRE
                  </p>
                  <h1 className="font-display text-3xl font-bold mb-1">
                    Your execution OS for the MREA framework.
                  </h1>
                  <p className="text-white/50 mb-8">This takes about 4 minutes.</p>

                  <div className="space-y-5">
                    <div>
                      <Label className="text-white/70 text-xs uppercase tracking-wider mb-1.5 block">
                        Full Name <span className="text-[#DC143C]">*</span>
                      </Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11"
                      />
                    </div>
                    <div>
                      <Label className="text-white/70 text-xs uppercase tracking-wider mb-1.5 block">
                        KW Market Center
                      </Label>
                      <Input
                        value={marketCenter}
                        onChange={(e) => setMarketCenter(e.target.value)}
                        placeholder="e.g. KW Cincinnati East"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11"
                      />
                    </div>
                    <div>
                      <Label className="text-white/70 text-xs uppercase tracking-wider mb-3 block">
                        Current MREA Level (1–7)
                      </Label>
                      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                        {LEVELS.map((level) => {
                          const isLocked = level.level > 4;
                          const isSelected = selectedLevel === level.level;
                          return (
                            <button
                              key={level.level}
                              onClick={() => !isLocked && setSelectedLevel(level.level)}
                              disabled={isLocked}
                              className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
                                isSelected
                                  ? 'border-[#DC143C] bg-[#DC143C]/10'
                                  : isLocked
                                  ? 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed'
                                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono text-sm font-bold ${
                                    isSelected
                                      ? 'bg-[#DC143C] text-white'
                                      : isLocked
                                      ? 'bg-white/5 text-white/20'
                                      : 'bg-white/10 text-white/60'
                                  }`}
                                >
                                  {isLocked ? <Lock className="w-3.5 h-3.5" /> : level.level}
                                </div>
                                <div>
                                  <div className="font-display font-semibold text-sm">
                                    {level.name}
                                    {isLocked && (
                                      <span className="text-white/30 ml-2 text-xs font-normal">
                                        Coming soon
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-white/40 text-xs mt-0.5">
                                    {level.deliverables.length} deliverables
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: Your Goal ── */}
              {step === 2 && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider font-mono mb-2">
                    Step 2 of 5
                  </p>
                  <h1 className="font-display text-3xl font-bold mb-1">Your Goal</h1>
                  <p className="text-white/50 mb-8">What GCI are you building toward this year?</p>

                  <div className="mb-6">
                    <Label className="text-white/70 text-xs uppercase tracking-wider mb-1.5 block">
                      Annual GCI Goal
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-mono">
                        $
                      </span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={incomeGoalRaw}
                        onChange={(e) => setIncomeGoalRaw(e.target.value)}
                        placeholder="250000"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 pl-7 font-mono text-lg"
                      />
                    </div>
                  </div>

                  {incomeGoal > 0 && (
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 mb-6">
                      <div className="text-xs text-white/40 uppercase tracking-wider mb-3 font-mono">
                        To hit ${incomeGoal.toLocaleString()} in GCI you need approximately:
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-mono text-2xl font-bold text-[#DC143C]">{closings}</div>
                          <div className="text-white/50 text-xs mt-0.5">closings at $6,000 avg commission</div>
                        </div>
                        <div>
                          <div className="font-mono text-2xl font-bold text-white">{weeklyContacts}</div>
                          <div className="text-white/50 text-xs mt-0.5">contacts per week to generate that pipeline</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-white/25 mt-3 font-mono">
                        Approximate based on KW averages
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 3: Your First Lead ── */}
              {step === 3 && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider font-mono mb-2">
                    Step 3 of 5
                  </p>
                  <h1 className="font-display text-3xl font-bold mb-1">Add your first lead</h1>
                  <p className="text-white/50 mb-8">
                    to activate your pipeline. Takes 15 seconds. You can add more later.
                  </p>

                  <div className="space-y-5">
                    <div>
                      <Label className="text-white/70 text-xs uppercase tracking-wider mb-1.5 block">
                        Lead Name
                      </Label>
                      <Input
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        placeholder="Jane Smith"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11"
                      />
                    </div>

                    <div>
                      <Label className="text-white/70 text-xs uppercase tracking-wider mb-2 block">
                        Source
                      </Label>
                      <div className="flex gap-2 flex-wrap">
                        {LEAD_SOURCES.map((src) => (
                          <button
                            key={src}
                            onClick={() => setLeadSource(src)}
                            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all border ${
                              leadSource === src
                                ? 'bg-[#DC143C]/20 text-[#DC143C] border-[#DC143C]/30'
                                : 'bg-white/5 text-white/50 border-transparent hover:bg-white/10'
                            }`}
                          >
                            {src}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white/70 text-xs uppercase tracking-wider mb-2 block">
                        Stage
                      </Label>
                      <div className="flex gap-2">
                        {LEAD_STAGES.map((stg) => (
                          <button
                            key={stg}
                            onClick={() => setLeadStage(stg)}
                            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all border ${
                              leadStage === stg
                                ? 'bg-[#DC143C]/20 text-[#DC143C] border-[#DC143C]/30'
                                : 'bg-white/5 text-white/50 border-transparent hover:bg-white/10'
                            }`}
                          >
                            {stg}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white/70 text-xs uppercase tracking-wider mb-1.5 block">
                        Estimated GCI ($) — optional
                      </Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={leadGci}
                        onChange={(e) => setLeadGci(e.target.value)}
                        placeholder="e.g. 9000"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 font-mono"
                      />
                    </div>
                  </div>

                  <p className="text-white/25 text-xs mt-5 leading-relaxed">
                    ASRE is not a CRM. This activates your pipeline tracker — not a contact database.
                    KW Command manages your relationships.
                  </p>
                </div>
              )}

              {/* ── Step 4: Your First Action ── */}
              {step === 4 && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider font-mono mb-2">
                    Step 4 of 5
                  </p>
                  <h1 className="font-display text-3xl font-bold mb-1">
                    Here is your first recommended action.
                  </h1>
                  <p className="text-white/50 mb-8">
                    ASRE generated this from your goal and level.
                  </p>

                  <div className="p-4 rounded-xl border border-[#DC143C]/30 bg-[#DC143C]/5 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-[#DC143C]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start gap-2 flex-wrap mb-1">
                          <span className="text-sm font-medium text-white leading-snug">
                            {buildFirstAction(selectedLevel, weeklyContacts)}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 shrink-0 bg-red-500/10 text-red-500 border-red-500/20"
                          >
                            High
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-[#DC143C]">
                          <Zap className="w-3 h-3" />
                          <span>+10 XP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-white/40 text-sm leading-relaxed">
                    When you finish setup, your full action list will be waiting in Execution HQ.
                  </p>
                </div>
              )}

              {/* ── Step 5: Complete ── */}
              {step === 5 && (
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-full bg-[#DC143C]/20 border border-[#DC143C]/30 flex items-center justify-center mb-6"
                  >
                    <Check className="w-8 h-8 text-[#DC143C]" />
                  </motion.div>

                  <h1 className="font-display text-3xl font-bold mb-2">Your ASRE is live.</h1>

                  <div className="space-y-2 mt-6 mb-8 text-left w-full max-w-xs mx-auto">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/10">
                      <span className="text-white/50 text-sm">Goal</span>
                      <span className="text-white font-mono font-semibold">
                        {incomeGoal > 0 ? `$${incomeGoal.toLocaleString()}` : '\u2014'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/10">
                      <span className="text-white/50 text-sm">Level</span>
                      <span className="text-white font-mono font-semibold">{selectedLevel}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/10">
                      <span className="text-white/50 text-sm">Streak starts</span>
                      <span className="text-white font-mono font-semibold">Today</span>
                    </div>
                  </div>

                  <p className="text-white/40 text-sm">Taking you to Execution HQ\u2026</p>
                  <div className="mt-3 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#DC143C]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation — hidden on step 5 */}
          {step < 5 && (
            <div className="flex items-center justify-between mt-8">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => setStep((s) => s - 1)}
                  className="text-white/50 hover:text-white hover:bg-white/5"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              <div className="flex flex-col items-end gap-2">
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || createLeadMutation.isPending}
                  className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white px-6"
                >
                  {step === 4 ? 'Finish Setup' : 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {step === 3 && (
                  <button
                    onClick={() => {
                      setLeadSkipped(true);
                      setStep((s) => s + 1);
                    }}
                    className="text-white/30 text-xs hover:text-white/50 transition-colors"
                  >
                    Skip for now \u2192
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
