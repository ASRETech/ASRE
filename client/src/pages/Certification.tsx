// Certification — Coach certification journey (Phase 6)
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, BookOpen, CheckCircle2, Clock, GraduationCap, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

const MODULES = [
  { key: 'm1', title: 'MREA Framework Mastery', desc: 'Deep understanding of the 7-level model, economic model, and lead generation model.' },
  { key: 'm2', title: 'Coaching Methodology', desc: 'Accountability structures, session cadence, commitment tracking, and pre-brief workflows.' },
  { key: 'm3', title: 'AgentOS Platform Proficiency', desc: 'Navigate all platform features: deliverables, pipeline, financials, SOPs, and coach portal.' },
  { key: 'm4', title: 'Business Diagnostics', desc: 'Assess agent businesses, identify bottlenecks, and prescribe level-appropriate interventions.' },
  { key: 'm5', title: 'Compliance & Ethics', desc: 'Fair Housing, coaching boundaries, data privacy, and professional conduct standards.' },
] as const;

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  not_started: { label: 'Not Started', color: 'text-muted-foreground', icon: <Clock className="w-4 h-4" /> },
  in_progress: { label: 'In Progress', color: 'text-amber-500', icon: <BookOpen className="w-4 h-4" /> },
  assessment_pending: { label: 'Assessment Pending', color: 'text-blue-500', icon: <GraduationCap className="w-4 h-4" /> },
  certified: { label: 'Certified', color: 'text-emerald-500', icon: <Shield className="w-4 h-4" /> },
  expired: { label: 'Expired', color: 'text-red-500', icon: <Clock className="w-4 h-4" /> },
  revoked: { label: 'Revoked', color: 'text-red-500', icon: <Clock className="w-4 h-4" /> },
};

export default function CertificationPage() {
  const certQuery = trpc.certifications.get.useQuery();
  const startMutation = trpc.certifications.start.useMutation({
    onSuccess: () => {
      certQuery.refetch();
      toast.success('Certification journey started!');
    },
  });
  const completeMutation = trpc.certifications.completeModule.useMutation({
    onSuccess: () => {
      certQuery.refetch();
      toast.success('Module completed!');
    },
  });

  const cert = certQuery.data;
  const status = cert?.status || 'not_started';
  const progress = (cert?.moduleProgress as Record<string, boolean>) || {};
  const completedModules = MODULES.filter(m => progress[m.key]).length;
  const progressPct = Math.round((completedModules / MODULES.length) * 100);
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#DC143C]/10 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-[#DC143C]" />
          </div>
          <h1 className="font-display text-xl font-bold">Coach Certification</h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Complete all five modules and pass the assessment to become a certified AgentOS coach.
          </p>
        </div>

        {/* Status card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={statusConfig.color}>{statusConfig.icon}</span>
              <span className="text-sm font-semibold">{statusConfig.label}</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {completedModules}/{MODULES.length} modules
            </span>
          </div>
          <Progress value={progressPct} className="h-2" />
          {status === 'certified' && cert?.certifiedAt && (
            <p className="text-xs text-emerald-500 mt-2">
              Certified on {new Date(cert.certifiedAt).toLocaleDateString()}
              {cert.renewalDueAt && ` · Renewal due ${new Date(cert.renewalDueAt).toLocaleDateString()}`}
            </p>
          )}
        </Card>

        {/* Not started state */}
        {status === 'not_started' && (
          <Card className="p-8 text-center border-dashed">
            <GraduationCap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-display text-sm font-semibold mb-2">Ready to Begin?</h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">
              The certification program validates your expertise in the MREA framework and AgentOS platform.
              Complete all modules at your own pace.
            </p>
            <Button className="bg-[#DC143C] text-white text-xs"
              disabled={startMutation.isPending}
              onClick={() => startMutation.mutate()}>
              Start Certification
            </Button>
          </Card>
        )}

        {/* Module list */}
        {status !== 'not_started' && (
          <div className="space-y-3">
            {MODULES.map((mod, idx) => {
              const isComplete = progress[mod.key];
              const isLocked = idx > 0 && !progress[MODULES[idx - 1].key];
              return (
                <Card key={mod.key}
                  className={`p-4 transition-colors ${isComplete ? 'border-emerald-500/30 bg-emerald-500/5' : ''} ${isLocked ? 'opacity-50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5
                      ${isComplete ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-semibold">{mod.title}</h4>
                        {isComplete && (
                          <Badge className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                            Complete
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{mod.desc}</p>
                    </div>
                    {!isComplete && !isLocked && status === 'in_progress' && (
                      <Button size="sm" variant="outline" className="text-xs shrink-0"
                        disabled={completeMutation.isPending}
                        onClick={() => completeMutation.mutate({ module: mod.key as any })}>
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Assessment pending */}
        {status === 'assessment_pending' && (
          <Card className="p-6 text-center border-[#DC143C]/20 bg-[#DC143C]/5">
            <GraduationCap className="w-8 h-8 text-[#DC143C] mx-auto mb-3" />
            <h3 className="font-display text-sm font-semibold mb-1">All Modules Complete!</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Your assessment is pending review. A senior coach will schedule your final evaluation.
            </p>
            <Badge variant="outline" className="text-xs">Assessment Pending</Badge>
          </Card>
        )}
      </div>
    </div>
  );
}
