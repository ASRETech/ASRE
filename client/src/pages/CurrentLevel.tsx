/**
 * CurrentLevel.tsx — v12
 *
 * Full-page selected level view. Clicking any MREA level updates the entire page.
 * Locked levels show full detail but interactions are disabled.
 * Landscape-optimized: level rail on left, detail panel on right.
 */
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { LEVELS } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronRight, Award, ArrowRight, Lock, Wrench, CheckCircle, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { BUILDER_REGISTRY } from '@/components/DeliverableBuilders';

export default function CurrentLevel() {
  const { state, dispatch } = useApp();
  const currentLevel = state.user?.currentLevel ?? 1;

  // selectedLevel drives the full-page view — defaults to active level
  const [selectedLevel, setSelectedLevel] = useState(currentLevel);
  const [activeBuilder, setActiveBuilder] = useState<string | null>(null);

  // Data for the currently ACTIVE (user's real) level
  const activeLevelData = LEVELS[currentLevel - 1];
  const activeLevelDeliverables = state.deliverables.filter(d => d.level === currentLevel);
  const activeCompletedCount = activeLevelDeliverables.filter(d => d.isComplete).length;
  const activeTotalCount = activeLevelDeliverables.length;
  const allActiveComplete = activeCompletedCount === activeTotalCount && activeTotalCount > 0;

  // Data for the SELECTED level (what the page is showing)
  const selectedLevelData = LEVELS[selectedLevel - 1];
  const isSelectedLocked = selectedLevel > currentLevel;
  const isSelectedActive = selectedLevel === currentLevel;
  const isSelectedComplete = selectedLevel < currentLevel;
  const selectedDeliverables = state.deliverables.filter(d => d.level === selectedLevel);
  const selectedCompletedCount = selectedDeliverables.filter(d => d.isComplete).length;
  const selectedTotalCount = selectedDeliverables.length;
  const selectedProgress = selectedTotalCount > 0 ? Math.round((selectedCompletedCount / selectedTotalCount) * 100) : 0;

  // Overall progress
  const totalAllDeliverables = LEVELS.reduce((sum, l) => sum + l.deliverables.length, 0);
  const completedAllDeliverables = state.deliverables.filter(d => d.isComplete).length;
  const overallProgress = totalAllDeliverables > 0 ? Math.round((completedAllDeliverables / totalAllDeliverables) * 100) : 0;

  const handleToggle = (id: string) => {
    if (isSelectedLocked) return; // Safety guard
    dispatch({ type: 'TOGGLE_DELIVERABLE', payload: id });
    const del = selectedDeliverables.find(d => d.id === id);
    if (del && !del.isComplete) {
      toast.success('Deliverable completed!', { description: del.title });
    }
  };

  const handleAdvance = () => {
    if (currentLevel < 7) {
      dispatch({ type: 'ADVANCE_LEVEL' });
      const nextLevel = currentLevel + 1;
      toast.success(`Advanced to Level ${nextLevel}!`, {
        description: LEVELS[nextLevel - 1]?.name,
      });
      setSelectedLevel(nextLevel);
    }
  };

  const handleBuildClick = (deliverableId: string, moduleRoute: string) => {
    if (isSelectedLocked) return;
    if (BUILDER_REGISTRY[deliverableId]) {
      setActiveBuilder(deliverableId);
    } else {
      window.location.href = moduleRoute;
    }
  };

  const ActiveBuilderComponent = activeBuilder ? BUILDER_REGISTRY[activeBuilder] : null;

  return (
    <div className="asre-page asre-page-enter">
      {/* Advance Banner — only when active level is complete */}
      {allActiveComplete && isSelectedActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-4 rounded-xl bg-[#DC143C]/10 border border-[#DC143C]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
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

      {/* Main layout: level rail + detail panel */}
      <div className="grid lg:grid-cols-[280px_1fr] gap-5">

        {/* LEFT: Level Rail */}
        <div className="space-y-3">
          {/* Overall progress card */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">MREA Roadmap</div>
                <div className="font-display font-bold text-foreground mt-0.5">7 Levels</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-foreground text-lg">{overallProgress}%</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Overall</div>
              </div>
            </div>
            <Progress value={overallProgress} className="h-1.5" />
          </Card>

          {/* Level buttons */}
          <div className="space-y-1.5">
            {LEVELS.map((level, idx) => {
              const lvlNum = idx + 1;
              const isActive = lvlNum === currentLevel;
              const isComplete = lvlNum < currentLevel;
              const isLocked = lvlNum > currentLevel;
              const isSelected = lvlNum === selectedLevel;
              const lvlDeliverables = state.deliverables.filter(d => d.level === lvlNum);
              const lvlDone = lvlDeliverables.filter(d => d.isComplete).length;
              const lvlTotal = lvlDeliverables.length;
              const lvlPct = lvlTotal > 0 ? Math.round((lvlDone / lvlTotal) * 100) : 0;

              return (
                <button
                  key={lvlNum}
                  onClick={() => setSelectedLevel(lvlNum)}
                  className="w-full rounded-xl border p-3 text-left transition-all duration-150"
                  style={{
                    borderColor: isSelected
                      ? isActive ? '#DC143C' : isComplete ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.15)'
                      : isActive ? 'rgba(220,20,60,0.3)' : isComplete ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                    background: isSelected
                      ? isActive ? 'rgba(220,20,60,0.1)' : isComplete ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.04)'
                      : 'rgba(255,255,255,0.02)',
                    boxShadow: isSelected ? `0 0 0 1.5px ${isActive ? 'rgba(220,20,60,0.4)' : isComplete ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}` : 'none',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Level badge */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm font-bold shrink-0"
                      style={{
                        background: isActive ? '#DC143C' : isComplete ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                        color: isActive ? '#fff' : isComplete ? '#10b981' : 'oklch(0.5 0.01 250)',
                      }}
                    >
                      {isComplete ? <Check className="w-4 h-4" /> : isLocked ? <Lock className="w-3.5 h-3.5" /> : lvlNum}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground truncate">{level.name}</span>
                        {isActive && (
                          <span className="text-[9px] font-bold px-1 py-0.5 rounded shrink-0" style={{ background: 'rgba(220,20,60,0.2)', color: '#DC143C' }}>
                            ACTIVE
                          </span>
                        )}
                      </div>
                      {!isLocked && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Progress value={lvlPct} className="h-1 flex-1" />
                          <span className="text-[9px] font-mono text-muted-foreground shrink-0">{lvlPct}%</span>
                        </div>
                      )}
                      {isLocked && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">Complete L{lvlNum - 1} to unlock</div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Selected Level Detail Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedLevel}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="space-y-4"
          >
            {/* Level header */}
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center font-mono text-2xl font-bold shrink-0"
                    style={{
                      background: isSelectedActive ? '#DC143C' : isSelectedComplete ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                      color: isSelectedActive ? '#fff' : isSelectedComplete ? '#10b981' : 'oklch(0.5 0.01 250)',
                    }}
                  >
                    {isSelectedComplete ? <Check className="w-7 h-7" /> : isSelectedLocked ? <Lock className="w-6 h-6" /> : selectedLevel}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Level {selectedLevel}</span>
                      {isSelectedActive && (
                        <Badge className="bg-[#DC143C]/20 text-[#DC143C] border-[#DC143C]/30 text-[10px] h-4 px-1.5">ACTIVE</Badge>
                      )}
                      {isSelectedComplete && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] h-4 px-1.5">COMPLETE</Badge>
                      )}
                      {isSelectedLocked && (
                        <Badge variant="outline" className="text-muted-foreground text-[10px] h-4 px-1.5">
                          <Lock className="w-2.5 h-2.5 mr-1" /> LOCKED
                        </Badge>
                      )}
                    </div>
                    <h2 className="font-display font-bold text-foreground">{selectedLevelData?.name}</h2>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-foreground text-xl">{selectedProgress}%</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {selectedCompletedCount}/{selectedTotalCount} done
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mt-4 mb-4">
                {selectedLevelData?.description}
              </p>

              <Progress value={selectedProgress} className="h-2" />

              {isSelectedLocked && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Locked — viewing in preview mode</p>
                    <p className="text-xs text-muted-foreground">Complete Level {selectedLevel - 1} to unlock interactions. All deliverables are visible for planning.</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto shrink-0 text-xs"
                    onClick={() => setSelectedLevel(currentLevel)}
                  >
                    Go to Active Level
                  </Button>
                </div>
              )}
            </Card>

            {/* Deliverables list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground">
                  {isSelectedLocked ? 'Deliverables Preview' : `Level ${selectedLevel} Deliverables`}
                </h3>
                <Badge variant="outline" className="font-mono text-xs">
                  {selectedCompletedCount}/{selectedTotalCount}
                </Badge>
              </div>

              <div className={`space-y-2 ${isSelectedLocked ? 'opacity-60 pointer-events-none select-none' : ''}`}>
                {selectedLevelData?.deliverables.map((d, index) => {
                  const deliverable = selectedDeliverables.find(dd => dd.id === d.id);
                  const isComplete = deliverable?.isComplete ?? false;
                  const hasBuilder = !!BUILDER_REGISTRY[d.id];

                  return (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card className={`p-3 sm:p-4 transition-all ${isComplete ? 'bg-muted/20 border-emerald-500/20' : 'hover:border-border'}`}>
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isComplete}
                            onCheckedChange={() => handleToggle(d.id)}
                            disabled={isSelectedLocked}
                            className={`mt-0.5 shrink-0 ${isComplete ? 'border-emerald-500 data-[state=checked]:bg-emerald-500' : 'border-[#DC143C]/50 data-[state=checked]:bg-[#DC143C]'}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <span className={`text-sm font-medium ${isComplete ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                {d.title}
                              </span>
                              {isSelectedLocked ? (
                                <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5 py-0 h-4 font-mono">
                                  <Eye className="w-2.5 h-2.5 mr-1" />PREVIEW
                                </Badge>
                              ) : isComplete ? (
                                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px] px-1.5 py-0 h-4 font-mono">DONE</Badge>
                              ) : hasBuilder ? (
                                <Badge variant="outline" className="text-[#DC143C] border-[#DC143C]/30 text-[10px] px-1.5 py-0 h-4 font-mono">INTERACTIVE</Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5 py-0 h-4 font-mono">TODO</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{d.description}</p>
                          </div>
                          {!isSelectedLocked && hasBuilder && (
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
                          {!isSelectedLocked && !hasBuilder && !isComplete && (
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
          </motion.div>
        </AnimatePresence>
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
