// Screen 3: Current MREA Level — Full 7-Level Roadmap Always Visible
// Design: Active level deliverables + full roadmap progression bar showing all 7 levels
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { LEVELS } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronRight, Award, ArrowRight, Lock, Wrench, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { BUILDER_REGISTRY } from '@/components/DeliverableBuilders';

export default function CurrentLevel() {
  const { state, dispatch } = useApp();
  const currentLevel = state.user?.currentLevel ?? 1;
  const levelData = LEVELS[currentLevel - 1];
  const levelDeliverables = state.deliverables.filter(d => d.level === currentLevel);
  const completedCount = levelDeliverables.filter(d => d.isComplete).length;
  const totalCount = levelDeliverables.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allComplete = completedCount === totalCount && totalCount > 0;

  const [activeBuilder, setActiveBuilder] = useState<string | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

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

  const handleBuildClick = (deliverableId: string, moduleRoute: string) => {
    if (BUILDER_REGISTRY[deliverableId]) {
      setActiveBuilder(deliverableId);
    } else {
      window.location.href = moduleRoute;
    }
  };

  const ActiveBuilderComponent = activeBuilder ? BUILDER_REGISTRY[activeBuilder] : null;

  const totalAllDeliverables = LEVELS.reduce((sum, l) => sum + l.deliverables.length, 0);
  const completedAllDeliverables = state.deliverables.filter(d => d.isComplete).length;
  const overallProgress = totalAllDeliverables > 0 ? Math.round((completedAllDeliverables / totalAllDeliverables) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Advance Banner */}
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-[#DC143C]/10 border border-[#DC143C]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DC143C]/20 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-[#DC143C]" />
              </div>
              <div>
                <div className="font-display font-semibold text-foreground">Ready to Advance!</div>
                <div className="text-sm text-muted-foreground">All deliverables for Level {currentLevel} are complete.</div>
              </div>
            </div>
            {currentLevel < 7 && (
              <Button onClick={handleAdvance} className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white w-full sm:w-auto">
                Advance to Level {currentLevel + 1}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </motion.div>
        )}

        {/* Full 7-Level MREA Roadmap */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-bold text-foreground">MREA Roadmap</h2>
              <p className="text-xs text-muted-foreground mt-0.5">7 levels from Solo Agent to CEO</p>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm font-bold text-foreground">{overallProgress}%</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Overall</div>
            </div>
          </div>
          <div className="mb-5">
            <Progress value={overallProgress} className="h-2" />
          </div>
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {LEVELS.map((level, idx) => {
              const lvlNum = idx + 1;
              const isActive = lvlNum === currentLevel;
              const isComplete = lvlNum < currentLevel;
              const isLocked = lvlNum > currentLevel;
              return (
                <button
                  key={lvlNum}
                  onClick={() => setExpandedLevel(expandedLevel === lvlNum ? null : lvlNum)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-center ${
                    isActive
                      ? 'border-[#DC143C] bg-[#DC143C]/10'
                      : isComplete
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-border/50 bg-muted/10'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                    isActive ? 'bg-[#DC143C] text-white' :
                    isComplete ? 'bg-emerald-500 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {isComplete ? <Check className="w-3.5 h-3.5" /> : isLocked ? <Lock className="w-3 h-3" /> : lvlNum}
                  </div>
                  <span className="text-[9px] font-medium leading-tight hidden sm:block text-muted-foreground">
                    {level.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                  <span className="text-[9px] font-mono sm:hidden text-muted-foreground">{lvlNum}</span>
                </button>
              );
            })}
          </div>
          {expandedLevel && expandedLevel !== currentLevel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 border border-border/50 rounded-lg p-4 bg-muted/20"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm font-bold shrink-0 ${
                  expandedLevel < currentLevel ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {expandedLevel < currentLevel ? <Check className="w-4 h-4" /> : expandedLevel}
                </div>
                <div>
                  <div className="font-display font-semibold text-sm text-foreground">
                    Level {expandedLevel}: {LEVELS[expandedLevel - 1]?.name}
                  </div>
                  {expandedLevel > currentLevel && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      Complete Level {expandedLevel - 1} to unlock
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{LEVELS[expandedLevel - 1]?.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {LEVELS[expandedLevel - 1]?.deliverables.map(d => (
                  <span key={d.id} className="text-[10px] bg-muted rounded px-2 py-0.5 text-muted-foreground">{d.title}</span>
                ))}
              </div>
            </motion.div>
          )}
        </Card>

        {/* Active Level Deliverables */}
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#DC143C] flex items-center justify-center font-mono text-xl font-bold text-white shrink-0">
                  {currentLevel}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Active Level</div>
                  <h3 className="font-display text-base font-bold text-foreground">{levelData?.name}</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {levelData?.description}
              </p>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" className="stroke-muted" strokeWidth="6" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="#DC143C" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${(progress / 100) * 264} 264`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-xl font-bold text-foreground">{progress}%</span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Done</span>
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
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-semibold text-foreground">
                Level {currentLevel} Deliverables
              </h3>
              <Badge variant="outline" className="font-mono text-xs">
                {completedCount}/{totalCount}
              </Badge>
            </div>
            <div className="space-y-2">
              {levelData?.deliverables.map((d, index) => {
                const deliverable = levelDeliverables.find(dd => dd.id === d.id);
                const isComplete = deliverable?.isComplete ?? false;
                const hasBuilder = !!BUILDER_REGISTRY[d.id];
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Card className={`p-3 sm:p-4 transition-all ${isComplete ? 'bg-muted/20 border-emerald-500/20' : 'hover:border-border'}`}>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isComplete}
                          onCheckedChange={() => handleToggle(d.id)}
                          className={`mt-0.5 shrink-0 ${isComplete ? 'border-emerald-500 data-[state=checked]:bg-emerald-500' : 'border-[#DC143C]/50 data-[state=checked]:bg-[#DC143C]'}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span className={`text-sm font-medium ${isComplete ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {d.title}
                            </span>
                            {isComplete ? (
                              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px] px-1.5 py-0 h-4 font-mono">DONE</Badge>
                            ) : hasBuilder ? (
                              <Badge variant="outline" className="text-[#DC143C] border-[#DC143C]/30 text-[10px] px-1.5 py-0 h-4 font-mono">INTERACTIVE</Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5 py-0 h-4 font-mono">TODO</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{d.description}</p>
                        </div>
                        {hasBuilder && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`text-xs h-8 px-3 shrink-0 ${
                              isComplete
                                ? 'text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/5'
                                : 'text-[#DC143C] hover:text-[#DC143C]/80 hover:bg-[#DC143C]/5'
                            }`}
                            onClick={() => handleBuildClick(d.id, d.moduleRoute)}
                          >
                            {isComplete
                              ? <><CheckCircle className="w-3.5 h-3.5 mr-1" /> View</>
                              : <><Wrench className="w-3.5 h-3.5 mr-1" /> Build This</>
                            }
                          </Button>
                        )}
                        {!hasBuilder && !isComplete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#DC143C] hover:text-[#DC143C]/80 hover:bg-[#DC143C]/5 text-xs h-8 px-3 shrink-0"
                            onClick={() => handleBuildClick(d.id, d.moduleRoute)}
                          >
                            <ChevronRight className="w-3.5 h-3.5 mr-1" />
                            Go
                          </Button>
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

      {ActiveBuilderComponent && (
        <ActiveBuilderComponent
          open={!!activeBuilder}
          onClose={() => setActiveBuilder(null)}
        />
      )}
    </div>
  );
}
