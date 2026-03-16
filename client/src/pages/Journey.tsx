// Screen 2: My Journey — THE MREA 7-LEVEL MAP
// Design: "Command Center" — Vertical path progression with crimson progress spine
// The emotional heart of the product
import { useApp } from '@/contexts/AppContext';
import { LEVELS } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, Lock, ChevronRight, MapPin } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

const JOURNEY_MAP_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663267868321/DsnBpPCR9zPt6H566oZapB/hero-journey-map-FZicBi8pNW3JstTTZPzT2k.webp';

export default function Journey() {
  const { state } = useApp();
  const currentLevel = state.user?.currentLevel ?? 1;
  const deliverables = state.deliverables;

  const getLevelProgress = (level: number) => {
    const levelDeliverables = deliverables.filter(d => d.level === level);
    if (levelDeliverables.length === 0) return 0;
    const completed = levelDeliverables.filter(d => d.isComplete).length;
    return Math.round((completed / levelDeliverables.length) * 100);
  };

  const getLevelStatus = (level: number): 'complete' | 'in-progress' | 'locked' => {
    if (level < currentLevel) return 'complete';
    if (level === currentLevel) return 'in-progress';
    return 'locked';
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header with journey context */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <MapPin className="w-3.5 h-3.5 text-[#DC143C]" />
          <span className="font-mono uppercase tracking-wider">MREA 7-Level Framework</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Your Journey Map</h2>
        <p className="text-muted-foreground text-sm">
          Each level builds on the last. Complete your deliverables to advance.
        </p>
      </div>

      {/* Journey Path */}
      <div className="relative">
        {/* Vertical progress spine */}
        <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-border" />
        <div
          className="absolute left-[27px] top-0 w-0.5 bg-[#DC143C] transition-all duration-1000 ease-out rounded-full"
          style={{ height: `${((currentLevel - 0.5) / 7) * 100}%` }}
        />

        {/* Level cards */}
        <div className="space-y-4">
          {LEVELS.map((level, index) => {
            const status = getLevelStatus(level.level);
            const progress = getLevelProgress(level.level);
            const isLocked = status === 'locked';
            const isCurrent = status === 'in-progress';
            const isComplete = status === 'complete';

            return (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
              >
                <div className="flex gap-4">
                  {/* Level node */}
                  <div className="relative z-10 shrink-0">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-mono text-lg font-bold transition-all ${
                      isCurrent
                        ? 'bg-[#DC143C] text-white shadow-lg shadow-[#DC143C]/25'
                        : isComplete
                          ? 'bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/30'
                          : 'bg-muted text-muted-foreground/40 border border-border'
                    }`}>
                      {isComplete ? <Check className="w-6 h-6" /> : isLocked ? <Lock className="w-5 h-5" /> : level.level}
                    </div>
                  </div>

                  {/* Level card */}
                  <Card className={`flex-1 p-5 transition-all duration-200 ${
                    isCurrent
                      ? 'border-[#DC143C]/30 bg-[#DC143C]/[0.02] shadow-sm'
                      : isLocked
                        ? 'opacity-50 bg-muted/30'
                        : 'hover:border-border/80'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-base font-semibold text-foreground">
                            {level.name}
                          </h3>
                          {isCurrent && (
                            <Badge variant="default" className="bg-[#DC143C] text-white text-[10px] px-2 py-0 h-5 font-mono">
                              CURRENT
                            </Badge>
                          )}
                          {isComplete && (
                            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px] px-2 py-0 h-5 font-mono">
                              COMPLETE
                            </Badge>
                          )}
                          {isLocked && (
                            <Badge variant="outline" className="text-muted-foreground/50 text-[10px] px-2 py-0 h-5 font-mono">
                              LOCKED
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{level.description}</p>
                      </div>
                    </div>

                    {/* Progress bar for current and completed levels */}
                    {!isLocked && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {level.deliverables.length} deliverables
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {progress}%
                          </span>
                        </div>
                        <Progress
                          value={progress}
                          className="h-1.5"
                        />
                      </div>
                    )}

                    {/* Deliverable preview for current level */}
                    {isCurrent && (
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <div className="grid grid-cols-2 gap-1.5">
                          {level.deliverables.slice(0, 4).map((d) => {
                            const del = deliverables.find(dd => dd.id === d.id);
                            return (
                              <div key={d.id} className="flex items-center gap-2 text-xs">
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                  del?.isComplete
                                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500'
                                    : 'border-border'
                                }`}>
                                  {del?.isComplete && <Check className="w-2.5 h-2.5" />}
                                </div>
                                <span className={`truncate ${del?.isComplete ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                  {d.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {level.deliverables.length > 4 && (
                          <div className="text-[11px] text-muted-foreground mt-2">
                            +{level.deliverables.length - 4} more deliverables
                          </div>
                        )}
                        <Link href="/level" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#DC143C] hover:text-[#DC143C]/80 transition-colors">
                          View all deliverables
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}

                    {/* Locked level preview */}
                    {isLocked && (
                      <div className="mt-3 text-xs text-muted-foreground/50">
                        <span className="font-mono">{level.deliverables.length}</span> deliverables unlock at this level
                      </div>
                    )}
                  </Card>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
