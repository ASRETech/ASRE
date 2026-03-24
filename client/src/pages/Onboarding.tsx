// Screen 1: Onboarding — THE JOURNEY ENTRY POINT
// Design: "Command Center" — Narrative-driven, not a typical sign-up form
// Step 1: Welcome (level selection), Step 2: Profile, Step 3: Diagnostic, Step 4: Goals, Step 5: Results
import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LEVELS, DIAGNOSTIC_QUESTIONS, TOP_PROBLEMS } from '@/lib/store';
import { generateMockLeads, generateMockTransactions, generateMockFinancials, generateMockSOPs, generateDeliverables } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Lock, Check, MapPin, Zap } from 'lucide-react';

const ONBOARDING_HERO = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663267868321/DsnBpPCR9zPt6H566oZapB/onboarding-hero-X6E5CaPazPrJLybWpKQtMB.webp';

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(1);

  // Profile fields
  const [name, setName] = useState('');
  const [brokerage, setBrokerage] = useState('');
  const [marketCenter, setMarketCenter] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [yearsExp, setYearsExp] = useState('');
  const [gciLastYear, setGciLastYear] = useState('');
  const [teamSize, setTeamSize] = useState('');

  // Diagnostic
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no' | 'partial'>>({});

  // Goals
  const [incomeGoal, setIncomeGoal] = useState([250000]);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);

  const operationalScore = Object.values(answers).filter(a => a === 'yes').length +
    Object.values(answers).filter(a => a === 'partial').length * 0.5;

  const avgCommission = 8500;
  const transactionsNeeded = Math.ceil(incomeGoal[0] / avgCommission);

  const handleComplete = useCallback(() => {
    const user = {
      id: 'user-1',
      name: name || 'Agent',
      email: '',
      brokerage: brokerage || 'Keller Williams',
      marketCenter: marketCenter || '',
      state: stateVal || 'OH',
      yearsExperience: parseInt(yearsExp) || 1,
      gciLastYear: parseInt(gciLastYear) || 0,
      teamSize: parseInt(teamSize) || 1,
      currentLevel: selectedLevel,
      operationalScore: Math.round(operationalScore),
      incomeGoal: incomeGoal[0],
      diagnosticAnswers: answers,
      topProblems: selectedProblems,
    };

    dispatch({ type: 'SET_USER', payload: user });
    dispatch({ type: 'SET_ONBOARDED', payload: true });
    dispatch({ type: 'SET_LEADS', payload: generateMockLeads(25) });
    dispatch({ type: 'SET_DELIVERABLES', payload: generateDeliverables(selectedLevel) });

    // Add mock transactions
    generateMockTransactions(5).forEach(t => dispatch({ type: 'ADD_TRANSACTION', payload: t }));
    generateMockFinancials().forEach(f => dispatch({ type: 'ADD_FINANCIAL', payload: f }));
    generateMockSOPs().forEach(s => dispatch({ type: 'ADD_SOP', payload: s }));

    navigate('/execution');
  }, [name, brokerage, marketCenter, stateVal, yearsExp, gciLastYear, teamSize, selectedLevel, operationalScore, incomeGoal, answers, selectedProblems, dispatch, navigate]);

  const canProceed = () => {
    if (step === 2) return name.trim().length > 0;
    if (step === 3) return Object.keys(answers).length === 8;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Left visual panel - hidden on mobile */}
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
            <span className="font-display text-2xl font-bold tracking-tight">AgentOS</span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight mb-4">
            Your business has a
            <br />
            <span className="text-[#DC143C]">proven path.</span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-md">
            AgentOS guides you through the MREA 7-Level framework — one deliverable at a time. No guesswork. Just execution.
          </p>
          {/* Step indicator */}
          <div className="mt-12 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 ${
                  s === step ? 'bg-[#DC143C] text-white scale-110' :
                  s < step ? 'bg-[#DC143C]/30 text-[#DC143C]' :
                  'bg-white/10 text-white/30'
                }`}>
                  {s < step ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                {s < 5 && <div className={`w-6 h-0.5 ${s < step ? 'bg-[#DC143C]/30' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right content panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#DC143C] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold">AgentOS</span>
          </div>

          {/* Mobile step indicator */}
          <div className="lg:hidden flex items-center gap-1.5 mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-[#DC143C]' : 'bg-white/10'
              }`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Welcome — Level Selection */}
              {step === 1 && (
                <div>
                  <h1 className="font-display text-3xl font-bold mb-2">Where are you on the path?</h1>
                  <p className="text-white/50 mb-8">Select the level that best describes your current business stage.</p>
                  <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-2">
                    {LEVELS.map((level) => {
                      const isLocked = level.level > 4;
                      const isSelected = selectedLevel === level.level;
                      return (
                        <button
                          key={level.level}
                          onClick={() => !isLocked && setSelectedLevel(level.level)}
                          disabled={isLocked}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? 'border-[#DC143C] bg-[#DC143C]/10'
                              : isLocked
                                ? 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed'
                                : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-mono text-sm font-bold ${
                              isSelected ? 'bg-[#DC143C] text-white' :
                              isLocked ? 'bg-white/5 text-white/20' :
                              'bg-white/10 text-white/60'
                            }`}>
                              {isLocked ? <Lock className="w-3.5 h-3.5" /> : level.level}
                            </div>
                            <div>
                              <div className="font-display font-semibold text-sm mb-0.5">
                                {level.name}
                                {isLocked && <span className="text-white/30 ml-2 text-xs font-normal">Coming soon</span>}
                              </div>
                              <p className="text-white/40 text-xs leading-relaxed">{level.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Agent Profile */}
              {step === 2 && (
                <div>
                  <h1 className="font-display text-3xl font-bold mb-2">Tell us about yourself</h1>
                  <p className="text-white/50 mb-8">We'll use this to personalize your journey.</p>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white/70 text-xs uppercase tracking-wider mb-1.5 block">Full Name *</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white/70 text-xs uppercase tracking-wider mb-1.5 block">Brokerage</Label>
                        <Select value={brokerage} onValueChange={setBrokerage}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Keller Williams">Keller Williams</SelectItem>
                            <SelectItem value="RE/MAX">RE/MAX</SelectItem>
                            <SelectItem value="Coldwell Banker">Coldwell Banker</SelectItem>
                            <SelectItem value="Century 21">Century 21</SelectItem>
                            <SelectItem value="eXp Realty">eXp Realty</SelectItem>
                            <SelectItem value="Compass">Compass</SelectItem>
                            <SelectItem value="Independent">Independent</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white/70 text-xs uppercase tracking-wider mb-1.5 block">Market Center</Label>
                        <Input value={marketCenter} onChange={(e) => setMarketCenter(e.target.value)} placeholder="Location" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-white/70 text-xs uppercase tracking-wider mb-1.5 block">State</Label>
                        <Input value={stateVal} onChange={(e) => setStateVal(e.target.value)} placeholder="OH" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11" />
                      </div>
                      <div>
                        <Label className="text-white/70 text-xs uppercase tracking-wider mb-1.5 block">Years in RE</Label>
                        <Input type="number" value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} placeholder="3" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11" />
                      </div>
                      <div>
                        <Label className="text-white/70 text-xs uppercase tracking-wider mb-1.5 block">Team Size</Label>
                        <Input type="number" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} placeholder="1" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-white/70 text-xs uppercase tracking-wider mb-1.5 block">GCI Last 12 Months</Label>
                      <Input type="number" value={gciLastYear} onChange={(e) => setGciLastYear(e.target.value)} placeholder="150000" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Operational Diagnostic */}
              {step === 3 && (
                <div>
                  <h1 className="font-display text-3xl font-bold mb-2">Operational Diagnostic</h1>
                  <p className="text-white/50 mb-6">Answer honestly — this determines your starting point.</p>
                  <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2">
                    {DIAGNOSTIC_QUESTIONS.map((q, i) => (
                      <div key={q.id} className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                        <p className="text-sm text-white/80 mb-3">
                          <span className="font-mono text-[#DC143C] mr-2 text-xs">Q{i + 1}</span>
                          {q.text}
                        </p>
                        <div className="flex gap-2">
                          {(['yes', 'partial', 'no'] as const).map((val) => (
                            <button
                              key={val}
                              onClick={() => setAnswers(prev => ({ ...prev, [q.id]: val }))}
                              className={`flex-1 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${
                                answers[q.id] === val
                                  ? val === 'yes' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : val === 'partial' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Goal Setting */}
              {step === 4 && (
                <div>
                  <h1 className="font-display text-3xl font-bold mb-2">Set Your Target</h1>
                  <p className="text-white/50 mb-8">What GCI are you building toward?</p>

                  <div className="mb-8">
                    <div className="flex items-baseline justify-between mb-4">
                      <Label className="text-white/70 text-xs uppercase tracking-wider">GCI Goal</Label>
                      <span className="font-mono text-2xl font-bold text-[#DC143C]">
                        ${incomeGoal[0].toLocaleString()}
                      </span>
                    </div>
                    <Slider
                      value={incomeGoal}
                      onValueChange={setIncomeGoal}
                      min={50000}
                      max={1000000}
                      step={25000}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-white/30">
                      <span>$50K</span>
                      <span>$1M+</span>
                    </div>
                  </div>

                  {/* Live calculation */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 mb-8">
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Transactions Needed</div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-3xl font-bold text-white">{transactionsNeeded}</span>
                      <span className="text-white/40 text-sm">transactions / year</span>
                    </div>
                    <div className="text-[11px] text-white/30 mt-1 font-mono">
                      Based on ${avgCommission.toLocaleString()} avg commission per transaction
                    </div>
                  </div>

                  {/* Top Problems */}
                  <div>
                    <Label className="text-white/70 text-xs uppercase tracking-wider mb-3 block">Top 3 Challenges</Label>
                    <div className="flex flex-wrap gap-2">
                      {TOP_PROBLEMS.map((problem) => {
                        const isSelected = selectedProblems.includes(problem);
                        return (
                          <button
                            key={problem}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedProblems(prev => prev.filter(p => p !== problem));
                              } else if (selectedProblems.length < 3) {
                                setSelectedProblems(prev => [...prev, problem]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                              isSelected
                                ? 'bg-[#DC143C]/20 text-[#DC143C] border border-[#DC143C]/30'
                                : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/10'
                            }`}
                          >
                            {problem}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Results */}
              {step === 5 && (
                <div>
                  <h1 className="font-display text-3xl font-bold mb-2">Your Operations Score</h1>
                  <p className="text-white/50 mb-8">Here's where you stand — and where we'll take you.</p>

                  {/* Score display */}
                  <div className="flex items-center justify-center mb-8">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="#DC143C" strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={`${(operationalScore / 8) * 264} 264`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-mono text-3xl font-bold text-white">{operationalScore}</span>
                        <span className="text-[10px] text-white/40 uppercase tracking-wider">/8</span>
                      </div>
                    </div>
                  </div>

                  {/* Gap analysis */}
                  <div className="space-y-2 mb-8">
                    {DIAGNOSTIC_QUESTIONS.map((q, i) => {
                      const answer = answers[q.id];
                      return (
                        <div key={q.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02]">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${
                            answer === 'yes' ? 'bg-emerald-400' :
                            answer === 'partial' ? 'bg-amber-400' : 'bg-red-400'
                          }`} />
                          <span className="text-xs text-white/60 flex-1">{q.text}</span>
                          <span className={`text-[10px] font-mono uppercase ${
                            answer === 'yes' ? 'text-emerald-400' :
                            answer === 'partial' ? 'text-amber-400' : 'text-red-400'
                          }`}>{answer}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-xl border border-[#DC143C]/20 bg-[#DC143C]/5 mb-6">
                    <div className="text-xs text-[#DC143C] uppercase tracking-wider mb-1 font-medium">Starting at Level {selectedLevel}</div>
                    <div className="font-display text-lg font-semibold text-white">{LEVELS[selectedLevel - 1]?.name}</div>
                    <div className="text-xs text-white/40 mt-1">
                      {LEVELS[selectedLevel - 1]?.deliverables.length} deliverables to build
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setStep(s => s - 1)}
                className="text-white/50 hover:text-white hover:bg-white/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : <div />}

            {step < 5 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white px-6"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white px-8"
              >
                Build My Business
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
