// Coach Portal — View assigned agents, their journey progress, and leave feedback
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, MessageSquare, Target, Send, ChevronRight, ArrowLeft, Copy, Check, TrendingUp, Award } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

const LEVEL_NAMES = [
  'Solo Agent', 'First Admin Hire', "First Buyer's Agent",
  "Multiple Buyer's Agents", 'Listings Specialist', 'Full Team', 'Business Owner'
];

export default function CoachPortalPage() {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentDeliverableId, setCommentDeliverableId] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const agentsQuery = trpc.coachPortal.myAgents.useQuery();
  const detailQuery = trpc.coachPortal.agentDetail.useQuery(
    { agentId: selectedAgentId! },
    { enabled: !!selectedAgentId }
  );

  const inviteMutation = trpc.coachPortal.invite.useMutation({
    onSuccess: (data) => {
      setInviteLink(`${window.location.origin}${data.inviteUrl}`);
      toast.success('Invite created! Share the link with your agent.');
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

  const agents = agentsQuery.data || [];
  const detail = detailQuery.data;

  // Agent detail view
  if (selectedAgentId && detail) {
    const profile = detail.profile;
    const deliverables = detail.deliverables || [];
    const comments = detail.comments || [];
    const completedCount = deliverables.filter((d: any) => d.isComplete).length;
    const totalCount = deliverables.length || 1;
    const progressPct = Math.round((completedCount / totalCount) * 100);

    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Button variant="ghost" size="sm" className="mb-4 text-xs" onClick={() => setSelectedAgentId(null)}>
          <ArrowLeft className="w-3 h-3 mr-1" /> Back to Agents
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Agent Header */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#DC143C]/10 flex items-center justify-center text-[#DC143C] font-display font-bold text-lg shrink-0">
                {(profile?.name || 'A').charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-bold">{profile?.name || 'Agent'}</h2>
                <p className="text-xs text-muted-foreground">{profile?.brokerage} — {profile?.marketCenter}</p>
              </div>
              <div className="flex gap-3">
                <div className="text-center">
                  <div className="text-lg font-mono font-bold text-[#DC143C]">{profile?.currentLevel || 1}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-mono font-bold">{progressPct}%</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Progress</div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Level {profile?.currentLevel || 1}: {LEVEL_NAMES[(profile?.currentLevel || 1) - 1]}</span>
                <span>{completedCount}/{totalCount} deliverables</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>
          </Card>

          <Tabs defaultValue="deliverables" className="space-y-4">
            <TabsList className="h-auto flex-wrap">
              <TabsTrigger value="deliverables" className="text-xs"><Target className="w-3 h-3 mr-1" /> Deliverables</TabsTrigger>
              <TabsTrigger value="comments" className="text-xs"><MessageSquare className="w-3 h-3 mr-1" /> Comments ({comments.length})</TabsTrigger>
              <TabsTrigger value="metrics" className="text-xs"><TrendingUp className="w-3 h-3 mr-1" /> Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="deliverables" className="space-y-3">
              {deliverables.map((d: any) => (
                <Card key={d.deliverableId} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${d.isComplete ? 'bg-emerald-500 text-white' : 'border-2 border-muted-foreground/30'}`}>
                      {d.isComplete ? <Check className="w-3 h-3" /> : ''}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{d.title}</div>
                      <div className="text-[10px] text-muted-foreground">Level {d.level}</div>
                    </div>
                    <Badge variant={d.isComplete ? 'default' : 'outline'} className="text-[10px]">
                      {d.isComplete ? 'Complete' : 'In Progress'}
                    </Badge>
                  </div>
                  {/* Coach comment for this deliverable */}
                  {comments.filter((c: any) => c.deliverableId === d.deliverableId).map((c: any, i: number) => (
                    <div key={i} className="mt-2 ml-9 p-2 rounded bg-muted/50 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Coach: </span>{c.comment}
                    </div>
                  ))}
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <Card className="p-4">
                <h4 className="text-sm font-semibold mb-3">Add Comment</h4>
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
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Leave coaching feedback..."
                    className="text-sm min-h-[80px]"
                  />
                  <Button
                    size="sm"
                    className="bg-[#DC143C] hover:bg-[#B01030] text-white text-xs"
                    disabled={!commentText || !commentDeliverableId}
                    onClick={() => {
                      commentMutation.mutate({
                        agentId: selectedAgentId!,
                        deliverableId: commentDeliverableId,
                        comment: commentText,
                      });
                    }}
                  >
                    <Send className="w-3 h-3 mr-1" /> Send Comment
                  </Button>
                </div>
              </Card>

              {comments.map((c: any, i: number) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-3 h-3 text-[#DC143C]" />
                    <span className="text-xs font-medium">On: {deliverables.find((d: any) => d.deliverableId === c.deliverableId)?.title || c.deliverableId}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.comment}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="metrics">
              <Card className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold">${((profile?.gciLastYear || 0) / 1000).toFixed(0)}K</div>
                    <div className="text-[10px] text-muted-foreground uppercase">GCI Last Year</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold">${((profile?.incomeGoal || 0) / 1000).toFixed(0)}K</div>
                    <div className="text-[10px] text-muted-foreground uppercase">GCI Goal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold">{profile?.teamSize || 1}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Team Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold">{profile?.yearsExperience || 0}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Years Exp</div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Agent list view
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold">Coach Portal</h1>
            <p className="text-xs text-muted-foreground mt-1">View and coach your assigned agents through their MREA journey</p>
          </div>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#DC143C] hover:bg-[#B01030] text-white text-xs">
                <UserPlus className="w-3 h-3 mr-1" /> Invite Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Invite an Agent</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Agent's Email</label>
                  <Input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="agent@email.com"
                    className="h-9"
                  />
                </div>
                <Button
                  className="w-full bg-[#DC143C] hover:bg-[#B01030] text-white text-xs"
                  onClick={() => inviteMutation.mutate({ inviteEmail })}
                  disabled={!inviteEmail || inviteMutation.isPending}
                >
                  Generate Invite Link
                </Button>
                {inviteLink && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Share this link with your agent:</p>
                    <div className="flex gap-2">
                      <Input value={inviteLink} readOnly className="h-8 text-xs" />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 shrink-0"
                        onClick={() => {
                          navigator.clipboard.writeText(inviteLink);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                      >
                        {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {agents.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-display text-sm font-semibold mb-1">No Agents Yet</h3>
            <p className="text-xs text-muted-foreground mb-4">Invite agents to start coaching them through their MREA journey.</p>
            <Button size="sm" className="bg-[#DC143C] hover:bg-[#B01030] text-white text-xs" onClick={() => setInviteOpen(true)}>
              <UserPlus className="w-3 h-3 mr-1" /> Invite Your First Agent
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {agents.map((agent: any) => {
              const completedCount = (agent.deliverables || []).filter((d: any) => d.isComplete).length;
              const totalCount = (agent.deliverables || []).length || 1;
              const pct = Math.round((completedCount / totalCount) * 100);
              return (
                <Card
                  key={agent.relationshipId}
                  className="p-4 cursor-pointer hover:border-[#DC143C]/30 transition-colors"
                  onClick={() => setSelectedAgentId(agent.agentId)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#DC143C]/10 flex items-center justify-center text-[#DC143C] font-display font-bold">
                      {(agent.profile?.name || 'A').charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{agent.profile?.name || 'Agent'}</div>
                      <div className="text-[10px] text-muted-foreground">{agent.profile?.brokerage}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px]">
                      <Award className="w-3 h-3 mr-1" />
                      Level {agent.profile?.currentLevel || 1}
                    </Badge>
                    <div className="flex-1">
                      <Progress value={pct} className="h-1.5" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{pct}%</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
