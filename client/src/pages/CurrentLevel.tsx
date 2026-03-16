// Screen 3: Current Level — ACTIVE DELIVERABLES
// Design: "Command Center" — Split panel: level context left, deliverable checklist right
import { useApp } from '@/contexts/AppContext';
import { LEVELS } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronRight, Award, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function CurrentLevel() {
  const { state, dispatch } = useApp();
  const currentLevel = state.user?.currentLevel ?? 1;
  const levelData = LEVELS[currentLevel - 1];
  const levelDeliverables = state.deliverables.filter(d => d.level === currentLevel);
  const completedCount = levelDeliverables.filter(d => d.isComplete).length;
  const totalCount = levelDeliverables.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allComplete = completedCount === totalCount && totalCount > 0;

  const handleToggle = (id: string) => {
    dispatch({ type: 'TOGGLE_DELIVERABLE', payload: id });
    const del = levelDeliverables.find(d => d.id === id);
    if (del && !del.isComplete) {
      toast.success('Deliverable completed!', { description: del.title });
    }
  };

  const handleAdvance = () => {
    if (currentLevel < 7) {
      dispatch({ type: 'ADVANCE_LEVEL' });
      toast.success(`Advanced to Level ${currentLevel + 1}!`, {
        description: LEVELS[currentLevel]?.name,
      });
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Advance banner */}
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-[#DC143C]/10 border border-[#DC143C]/20 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DC143C]/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#DC143C]" />
              </div>
              <div>
                <div className="font-display font-semibold text-foreground">Ready to Advance!</div>
                <div className="text-sm text-muted-foreground">All deliverables for Level {currentLevel} are complete.</div>
              </div>
            </div>
            {currentLevel < 7 && (
              <Button onClick={handleAdvance} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white">
                Advance to Level {currentLevel + 1}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-[340px_1fr] gap-6">
          {/* Left panel: Level context */}
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#DC143C] flex items-center justify-center font-mono text-xl font-bold text-white">
                  {currentLevel}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Level {currentLevel}</div>
                  <h3 className="font-display text-lg font-bold text-foreground">{levelData?.name}</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {levelData?.description}
              </p>

              {/* Progress ring */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" className="stroke-muted" strokeWidth="5" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="#DC143C" strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={`${(progress / 100) * 264} 264`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-2xl font-bold text-foreground">{progress}%</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Complete</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <span className="font-mono font-semibold text-foreground">{completedCount}</span>
                {' '}of{' '}
                <span className="font-mono font-semibold text-foreground">{totalCount}</span>
                {' '}deliverables built
              </div>
            </Card>

            {/* Next level preview */}
            {currentLevel < 7 && (
              <Card className="p-4 bg-muted/30 border-dashed">
                <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2">Next Level</div>
                <div className="font-display font-semibold text-sm text-foreground mb-1">
                  {LEVELS[currentLevel]?.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {LEVELS[currentLevel]?.deliverables.length} deliverables to unlock
                </div>
              </Card>
            )}
          </div>

          {/* Right panel: Deliverable checklist */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground">Deliverables</h3>
              <Badge variant="outline" className="font-mono text-xs">
                {completedCount}/{totalCount}
              </Badge>
            </div>

            <div className="space-y-2">
              {levelData?.deliverables.map((d, index) => {
                const deliverable = levelDeliverables.find(dd => dd.id === d.id);
                const isComplete = deliverable?.isComplete ?? false;

                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`p-4 transition-all duration-200 ${
                      isComplete ? 'bg-emerald-500/[0.03] border-emerald-500/20' : 'hover:border-border/80'
                    }`}>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isComplete}
                          onCheckedChange={() => handleToggle(d.id)}
                          className="mt-0.5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-sm font-medium ${isComplete ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {d.title}
                            </span>
                            {isComplete ? (
                              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px] px-1.5 py-0 h-4 font-mono">
                                DONE
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5 py-0 h-4 font-mono">
                                TODO
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{d.description}</p>
                        </div>
                        {!isComplete && (
                          <Link href={d.moduleRoute}>
                            <Button variant="ghost" size="sm" className="text-[#DC143C] hover:text-[#DC143C]/80 hover:bg-[#DC143C]/5 text-xs h-8 px-3">
                              Build This
                              <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
