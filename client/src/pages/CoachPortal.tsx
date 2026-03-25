// CoachPortal — Full coaching operations center (Phase 6)
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Users, UserPlus, MessageSquare, Target, Send,
  ChevronRight, ArrowLeft, Copy, Check, TrendingUp,
  Award, Calendar, ClipboardList, Zap,
  BookOpen, Mail, Circle, GraduationCap, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';

const LEVEL_NAMES = [
  'Solo Agent', 'First Admin Hire', "First Buyer's Agent",
  "Multiple Buyer's Agents", 'Listings Specialist', 'Full Team', 'Business Owner',
];

const SESSION_TYPE_LABELS: Record<string, string> = {
  one_on_one: '1:1 Session',
  group_monthly: 'Group Monthly',
  group_checkin: 'Group Check-in',
};

export default function CoachPortalPage() {
  const profileQuery = trpc.profile.get.useQuery(undefined, { staleTime: 60_000 });
  const isCoach = !!(profileQuery.data as any)?.coachMode;
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentDeliverableId, setCommentDeliverableId] = useState('');

  // Session scheduling state
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [sessionType, setSessionType] = useState<'one_on_one'|'group_monthly'|'group_checkin'>('one_on_one');
  const [sessionAgentId, setSessionAgentId] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionZoom, setSessionZoom] = useState('');

  // Session notes state
  const [notesSessionId, setNotesSessionId] = useState('');
  const [coachNotes, setCoachNotes] = useState('');
  const [clientSummary, setClientSummary] = useState('');
  const [commitmentText, setCommitmentText] = useState('');
  const [commitments, setCommitments] = useState<{agentId: number; text: string}[]>([]);

  const agentsQuery = trpc.coachPortal.myAgents.useQuery();
  const cohortsQuery = trpc.coachPortal.myCohorts.useQuery();
  const upcomingQuery = trpc.coachPortal.upcomingSessions.useQuery();
  const allSessionsQuery = trpc.coachPortal.allSessions.useQuery();
  const detailQuery = trpc.coachPortal.agentDetail.useQuery(
    { agentId: selectedAgentId! },
    { enabled: !!selectedAgentId }
  );

  const inviteMutation = trpc.coachPortal.invite.useMutation({
    onSuccess: (data) => {
      setInviteLink(`${window.location.origin}${data.inviteUrl}`);
      toast.success('Invite link created');
    },
  });

  const commentMutation = trpc.coachPortal.addComment.useMutation({
    onSuccess: () => {
      setCommentText('');
      setCommentDeliverableId('');
      detailQuery.refetch();
      toast.success('Comment added');
    },
  });

  const scheduleMutation = trpc.coachPortal.scheduleSession.useMutation({
    onSuccess: () => {
      setScheduleOpen(false);
      setSessionDate('');
      setSessionZoom('');
      setSessionAgentId('');
      upcomingQuery.refetch();
      allSessionsQuery.refetch();
      toast.success('Session scheduled');
    },
  });

  const notesMutation = trpc.coachPortal.saveSessionNotes.useMutation({
    onSuccess: () => {
      setNotesSessionId('');
      setCoachNotes('');
      setClientSummary('');
      setCommitments([]);
      allSessionsQuery.refetch();
      toast.success('Session notes saved');
    },
  });

  const briefMutation = trpc.coachPortal.generatePreBrief.useMutation({
    onSuccess: (data) => {
      toast.success(`Pre-brief generated for ${data.agentName}`);
    },
  });

  const agents = agentsQuery.data || [];
  const cohorts = cohortsQuery.data || [];
  const upcoming = upcomingQuery.data || [];
  const allSessions = allSessionsQuery.data || [];
  const detail = detailQuery.data;

  // ── Non-coach state ──────────────────────────────────────────────
  if (!profileQuery.isLoading && !isCoach) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#DC143C]/10 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-[#DC143C]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Coaching Hub</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              You're currently in agent mode. This area is for KW Productivity Coaches managing their agents.
              If you have a coach, they'll use this portal to track your progress and leave feedback.
            </p>
          </div>
          <div className="grid gap-3 w-full max-w-sm">
            <a
              href="https://coursecreator360.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card hover:border-[#DC143C]/30 transition-colors group"
            >
              <div className="text-left">
                <div className="text-sm font-semibold text-foreground">KW Course Creator</div>
                <div className="text-xs text-muted-foreground">Access your KW training library</div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-[#DC143C] transition-colors" />
            </a>
            <div className="p-4 rounded-xl border border-border/60 bg-card">
              <div className="text-sm font-semibold text-foreground mb-1">Want to become a coach?</div>
              <div className="text-xs text-muted-foreground">
                Contact your Market Center ALC or regional leadership to get set up as a Productivity Coach.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Agent detail drill-down ──────────────────────────────────────
  if (selectedAgentId && detail) {
    const profile = detail.profile;
    const deliverables = detail.deliverables || [];
    const comments = detail.comments || [];
    const completedCount = deliverables.filter((d: any) => d.isComplete).length;
    const progressPct = Math.round((completedCount / Math.max(1, deliverables.length)) * 100);

    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Button variant="ghost" size="sm" className="mb-4 text-xs"
          onClick={() => setSelectedAgentId(null)}>
          <ArrowLeft className="w-3 h-3 mr-1" /> Back
        </Button>
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#DC143C]/10 flex items-center justify-center text-[#DC143C] font-bold text-lg shrink-0">
                {(profile?.name || 'A').charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-bold">{profile?.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {profile?.brokerage} · Level {profile?.currentLevel} — {LEVEL_NAMES[(profile?.currentLevel ?? 1) - 1]}
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono text-2xl font-bold text-[#DC143C]">{progressPct}%</div>
                <div className="text-[10px] text-muted-foreground uppercase">Progress</div>
              </div>
            </div>
            <Progress value={progressPct} className="h-2 mt-4" />
          </Card>

          <Tabs defaultValue="deliverables">
            <TabsList className="h-auto flex-wrap">
              <TabsTrigger value="deliverables" className="text-xs">
                <Target className="w-3 h-3 mr-1" /> Deliverables
              </TabsTrigger>
              <TabsTrigger value="feedback" className="text-xs">
                <MessageSquare className="w-3 h-3 mr-1" /> Feedback ({comments.length})
              </TabsTrigger>
              <TabsTrigger value="metrics" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" /> Metrics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deliverables" className="space-y-3 mt-4">
              {deliverables.map((d: any) => (
                <Card key={d.deliverableId} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0
                      ${d.isComplete ? 'bg-emerald-500' : 'border-2 border-muted-foreground/30'}`}>
                      {d.isComplete && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{d.title}</div>
                      <div className="text-[10px] text-muted-foreground">Level {d.level}</div>
                    </div>
                    <Badge variant={d.isComplete ? 'default' : 'outline'} className="text-[10px]">
                      {d.isComplete ? 'Done' : 'Pending'}
                    </Badge>
                  </div>
                  {comments
                    .filter((c: any) => c.deliverableId === d.deliverableId)
                    .map((c: any, i: number) => (
                      <div key={i} className="mt-2 ml-8 p-2 rounded bg-[#DC143C]/5 border border-[#DC143C]/10 text-xs text-muted-foreground">
                        <span className="font-medium text-[#DC143C]">Coach: </span>{c.comment}
                      </div>
                    ))}
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4 mt-4">
              <Card className="p-4">
                <div className="text-sm font-semibold mb-3">Add Feedback</div>
                <div className="space-y-3">
                  <Select value={commentDeliverableId} onValueChange={setCommentDeliverableId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select deliverable..." />
                    </SelectTrigger>
                    <SelectContent>
                      {deliverables.map((d: any) => (
                        <SelectItem key={d.deliverableId} value={d.deliverableId} className="text-xs">
                          {d.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea value={commentText} onChange={e => setCommentText(e.target.value)}
                    placeholder="Leave coaching feedback..." className="min-h-[80px] text-sm" />
                  <Button size="sm" className="bg-[#DC143C] text-white text-xs"
                    disabled={!commentText || !commentDeliverableId || commentMutation.isPending}
                    onClick={() => commentMutation.mutate({
                      agentId: selectedAgentId!,
                      deliverableId: commentDeliverableId,
                      comment: commentText,
                    })}>
                    <Send className="w-3 h-3 mr-1" /> Send Feedback
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="mt-4">
              <Card className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    ['GCI Goal', `$${((profile?.incomeGoal || 0)/1000).toFixed(0)}K`],
                    ['GCI Last Yr', `$${((profile?.gciLastYear || 0)/1000).toFixed(0)}K`],
                    ['Team Size', profile?.teamSize || 1],
                    ['Years Exp', profile?.yearsExperience || 0],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="text-center">
                      <div className="text-2xl font-mono font-bold">{value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // ── Main Coach Hub ───────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="overview">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <TabsList className="h-auto flex-wrap">
              <TabsTrigger value="overview" className="text-xs">
                <Zap className="w-3 h-3 mr-1" /> Overview
              </TabsTrigger>
              <TabsTrigger value="clients" className="text-xs">
                <Users className="w-3 h-3 mr-1" /> Clients ({agents.length})
              </TabsTrigger>
              <TabsTrigger value="sessions" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" /> Sessions
              </TabsTrigger>
              <TabsTrigger value="cohorts" className="text-xs">
                <BookOpen className="w-3 h-3 mr-1" /> Cohorts ({cohorts.length})
              </TabsTrigger>
            </TabsList>

            <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#DC143C] text-white text-xs">
                  <Calendar className="w-3 h-3 mr-1" /> Schedule Session
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display">Schedule a Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Session Type</label>
                    <Select value={sessionType} onValueChange={(v: any) => setSessionType(v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_on_one" className="text-xs">1:1 Session</SelectItem>
                        <SelectItem value="group_monthly" className="text-xs">Group Monthly (90 min)</SelectItem>
                        <SelectItem value="group_checkin" className="text-xs">Group Check-in (30 min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {sessionType === 'one_on_one' && (
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Agent</label>
                      <Select value={sessionAgentId} onValueChange={setSessionAgentId}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select agent..." /></SelectTrigger>
                        <SelectContent>
                          {agents.map((a: any) => (
                            <SelectItem key={a.agentId} value={String(a.agentId)} className="text-xs">
                              {a.profile?.name || `Agent ${a.agentId}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Date & Time</label>
                    <Input type="datetime-local" value={sessionDate}
                      onChange={e => setSessionDate(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Zoom Link (optional)</label>
                    <Input value={sessionZoom} onChange={e => setSessionZoom(e.target.value)}
                      placeholder="https://zoom.us/j/..." className="h-9 text-xs" />
                  </div>
                  <Button className="w-full bg-[#DC143C] text-white text-xs"
                    disabled={!sessionDate || scheduleMutation.isPending}
                    onClick={() => scheduleMutation.mutate({
                      type: sessionType,
                      agentId: sessionAgentId ? parseInt(sessionAgentId) : undefined,
                      scheduledAt: new Date(sessionDate).toISOString(),
                      zoomLink: sessionZoom || undefined,
                    })}>
                    Schedule Session
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* ── OVERVIEW TAB ── */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-5">
              <h3 className="font-display text-sm font-semibold mb-4">Upcoming Sessions</h3>
              {upcoming.length === 0 ? (
                <p className="text-xs text-muted-foreground">No sessions scheduled. Use the button above to schedule one.</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.slice(0, 5).map((s: any) => (
                    <div key={s.sessionId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="outline" className="text-[10px]">{SESSION_TYPE_LABELS[s.type]}</Badge>
                          <span className="text-xs font-medium">
                            {format(new Date(s.scheduledAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        {s.agentId && (
                          <p className="text-[10px] text-muted-foreground">
                            {agents.find((a: any) => a.agentId === s.agentId)?.profile?.name || `Agent ${s.agentId}`}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {s.agentId && (
                          <Button variant="outline" size="sm" className="text-[10px] h-7"
                            disabled={briefMutation.isPending}
                            onClick={() => briefMutation.mutate({ sessionId: s.sessionId, sendEmail: false })}>
                            <Mail className="w-3 h-3 mr-1" /> Pre-Brief
                          </Button>
                        )}
                        {s.zoomLink && (
                          <Button variant="outline" size="sm" className="text-[10px] h-7"
                            onClick={() => window.open(s.zoomLink, '_blank')}>
                            Open Zoom
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {agents.length > 0 && (
              <Card className="p-5">
                <h3 className="font-display text-sm font-semibold mb-4">Client Health</h3>
                <div className="space-y-2">
                  {agents.map((a: any) => {
                    const delivs = a.deliverables || [];
                    const pct = Math.round(
                      (delivs.filter((d: any) => d.isComplete).length / Math.max(1, delivs.length)) * 100
                    );
                    return (
                      <div key={a.agentId}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => setSelectedAgentId(a.agentId)}>
                        <div className="w-7 h-7 rounded-full bg-[#DC143C]/10 flex items-center justify-center text-[#DC143C] font-bold text-xs shrink-0">
                          {(a.profile?.name || 'A').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium truncate">{a.profile?.name}</span>
                            <Badge variant="outline" className="text-[10px] shrink-0">Lvl {a.profile?.currentLevel}</Badge>
                          </div>
                          <Progress value={pct} className="h-1 mt-1" />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">{pct}%</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* ── CLIENTS TAB ── */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-xs">
                    <UserPlus className="w-3 h-3 mr-1" /> Invite Agent
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display">Invite an Agent</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                      placeholder="agent@email.com" className="h-9" />
                    <Button className="w-full bg-[#DC143C] text-white text-xs"
                      onClick={() => inviteMutation.mutate({ inviteEmail })}
                      disabled={!inviteEmail || inviteMutation.isPending}>
                      Generate Invite Link
                    </Button>
                    {inviteLink && (
                      <div className="flex gap-2">
                        <Input value={inviteLink} readOnly className="h-8 text-xs" />
                        <Button variant="outline" size="sm" className="h-8 shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(inviteLink);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}>
                          {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {agents.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-display text-sm font-semibold mb-1">No Clients Yet</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Invite agents to start coaching them through their MREA journey.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {agents.map((a: any) => {
                  const delivs = a.deliverables || [];
                  const pct = Math.round(
                    (delivs.filter((d: any) => d.isComplete).length / Math.max(1, delivs.length)) * 100
                  );
                  return (
                    <Card key={a.agentId}
                      className="p-4 cursor-pointer hover:border-[#DC143C]/30 transition-colors"
                      onClick={() => setSelectedAgentId(a.agentId)}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#DC143C]/10 flex items-center justify-center text-[#DC143C] font-bold">
                          {(a.profile?.name || 'A').charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{a.profile?.name}</div>
                          <div className="text-[10px] text-muted-foreground">{a.profile?.brokerage}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[10px]">
                          <Award className="w-3 h-3 mr-1" /> Level {a.profile?.currentLevel}
                        </Badge>
                        <div className="flex-1">
                          <Progress value={pct} className="h-1.5" />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{pct}%</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── SESSIONS TAB ── */}
          <TabsContent value="sessions" className="space-y-4">
            {allSessions.length === 0 ? (
              <Card className="p-8 text-center">
                <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-xs text-muted-foreground">No sessions yet.</p>
              </Card>
            ) : (
              allSessions.map((s: any) => (
                <Card key={s.sessionId} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">{SESSION_TYPE_LABELS[s.type]}</Badge>
                        <span className="text-xs font-medium">
                          {format(new Date(s.scheduledAt), 'MMM d, yyyy h:mm a')}
                        </span>
                        {s.completedAt && (
                          <Badge className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                            Completed
                          </Badge>
                        )}
                      </div>
                      {s.clientSummary && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.clientSummary}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="text-[10px] h-7 ml-3 shrink-0"
                      onClick={() => setNotesSessionId(notesSessionId === s.sessionId ? '' : s.sessionId)}>
                      <ClipboardList className="w-3 h-3 mr-1" />
                      {s.completedAt ? 'View' : 'Add Notes'}
                    </Button>
                  </div>

                  {notesSessionId === s.sessionId && (
                    <div className="mt-4 space-y-3 pt-4 border-t border-border/50">
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
                          Private Coach Notes (never shown to agent)
                        </label>
                        <Textarea value={coachNotes} onChange={e => setCoachNotes(e.target.value)}
                          placeholder="Internal observations..." className="min-h-[80px] text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
                          Client Summary (shared after session)
                        </label>
                        <Textarea value={clientSummary} onChange={e => setClientSummary(e.target.value)}
                          placeholder="Key takeaways for the agent..." className="min-h-[60px] text-sm" />
                      </div>

                      {s.agentId && (
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
                            Add Commitment
                          </label>
                          <div className="flex gap-2">
                            <Input value={commitmentText}
                              onChange={e => setCommitmentText(e.target.value)}
                              placeholder="e.g. Write EA scorecard by Friday"
                              className="h-8 text-xs" />
                            <Button variant="outline" size="sm" className="h-8 text-xs shrink-0"
                              onClick={() => {
                                if (commitmentText.trim()) {
                                  setCommitments(prev => [...prev, {
                                    agentId: s.agentId!, text: commitmentText.trim(),
                                  }]);
                                  setCommitmentText('');
                                }
                              }}>
                              Add
                            </Button>
                          </div>
                          {commitments.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {commitments.map((c, i) => (
                                <li key={i} className="text-xs flex items-center gap-2">
                                  <Circle className="w-3 h-3 text-muted-foreground shrink-0" />
                                  {c.text}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      <Button size="sm" className="bg-[#DC143C] text-white text-xs"
                        disabled={notesMutation.isPending}
                        onClick={() => notesMutation.mutate({
                          sessionId: s.sessionId,
                          coachNotes: coachNotes || undefined,
                          clientSummary: clientSummary || undefined,
                          commitments,
                        })}>
                        Save Session Notes
                      </Button>
                    </div>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          {/* ── COHORTS TAB ── */}
          <TabsContent value="cohorts" className="space-y-4">
            {cohorts.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-display text-sm font-semibold mb-1">No Cohorts Yet</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Group coaching cohorts let you manage multiple agents together.
                </p>
              </Card>
            ) : (
              cohorts.map((c: any) => (
                <Card key={c.cohortId} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold">{c.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] capitalize">{c.type}</Badge>
                        <Badge variant="outline" className="text-[10px]">
                          Levels {c.targetLevelMin}–{c.targetLevelMax}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {c.members?.length || 0}/{c.maxSize} members
                        </span>
                      </div>
                    </div>
                  </div>
                  {c.members && c.members.length > 0 && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-border/50">
                      {c.members.map((m: any) => (
                        <div key={m.agentId} className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 cursor-pointer"
                          onClick={() => setSelectedAgentId(m.agentId)}>
                          <div className="w-6 h-6 rounded-full bg-[#DC143C]/10 flex items-center justify-center text-[#DC143C] font-bold text-[10px] shrink-0">
                            {(m.profile?.name || 'A').charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium truncate block">{m.profile?.name}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px]">Lvl {m.currentLevel}</Badge>
                          <span className="text-[10px] font-mono text-muted-foreground">{m.healthScore}/100</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
