// Client Portal — Public-facing page for clients to view transaction progress
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Home, Calendar, DollarSign, CheckCircle2, Circle, Clock, FileText, Shield, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  'pre-contract': { label: 'Pre-Contract', color: 'text-blue-500' },
  'under-contract': { label: 'Under Contract', color: 'text-amber-500' },
  'clear-to-close': { label: 'Clear to Close', color: 'text-emerald-500' },
  'closed': { label: 'Closed', color: 'text-green-600' },
};

export default function ClientPortalPage() {
  const [token, setToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) setToken(t);
  }, []);

  const portalQuery = trpc.clientPortal.view.useQuery(
    { token },
    { enabled: !!token }
  );

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA]">
        <Card className="p-8 max-w-md w-full text-center">
          <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <h1 className="font-display text-lg font-bold mb-2">Invalid Link</h1>
          <p className="text-sm text-muted-foreground">This portal link is missing a token. Please contact your agent for a new link.</p>
        </Card>
      </div>
    );
  }

  if (portalQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA]">
        <Loader2 className="w-8 h-8 animate-spin text-[#DC143C]" />
      </div>
    );
  }

  const data = portalQuery.data;
  if (!data || !data.transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA]">
        <Card className="p-8 max-w-md w-full text-center">
          <h1 className="font-display text-lg font-bold mb-2">Transaction Not Found</h1>
          <p className="text-sm text-muted-foreground">This portal link may have expired. Please contact your agent.</p>
        </Card>
      </div>
    );
  }

  const txn = data.transaction;
  const messages = data.communications || [];
  const statusInfo = STATUS_LABELS[txn.status] || STATUS_LABELS['pre-contract'];

  // Calculate checklist progress from messages that mention completion
  const milestones = [
    { label: 'Offer Accepted', done: true },
    { label: 'Inspection Complete', done: txn.status !== 'pre-contract' },
    { label: 'Appraisal Ordered', done: ['clear-to-close', 'closed'].includes(txn.status) },
    { label: 'Clear to Close', done: txn.status === 'clear-to-close' || txn.status === 'closed' },
    { label: 'Closing Day', done: txn.status === 'closed' },
  ];
  const completedMilestones = milestones.filter(m => m.done).length;
  const progressPct = Math.round((completedMilestones / milestones.length) * 100);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#DC143C] flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-display text-lg font-bold">Transaction Portal</h1>
          </div>
          <p className="text-xs text-muted-foreground">Your real-time transaction dashboard</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Property Card */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-base font-bold">{txn.propertyAddress}</h2>
              <p className="text-xs text-muted-foreground">{txn.clientName} — {txn.type === 'buyer' ? 'Buyer' : 'Seller'}</p>
            </div>
            <Badge variant="outline" className={`text-xs ${statusInfo.color}`}>
              {statusInfo.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Sale Price</div>
              <div className="font-mono text-lg font-bold">—</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Close Date</div>
              <div className="font-mono text-lg font-bold">{txn.closeDate ? new Date(txn.closeDate).toLocaleDateString() : '—'}</div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Transaction Progress</span>
              <span className="font-mono">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2 mb-4" />
            <div className="space-y-2">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  {m.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                  )}
                  <span className={`text-sm ${m.done ? 'text-foreground' : 'text-muted-foreground'}`}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Messages / Updates */}
        <div>
          <h3 className="font-display text-sm font-semibold mb-3">Updates from Your Agent</h3>
          {messages.length === 0 ? (
            <Card className="p-6 text-center">
              <FileText className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No updates yet. Your agent will post updates here as your transaction progresses.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {messages.map((msg: any, i: number) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.sentAt || msg.createdAt).toLocaleDateString()} at {new Date(msg.sentAt || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Badge variant="outline" className="text-[9px] ml-auto">{msg.channel || 'update'}</Badge>
                  </div>
                  {msg.subject && <h4 className="text-sm font-medium mb-1">{msg.subject}</h4>}
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.body}</p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-[10px] text-muted-foreground">Powered by AgentOS — Your agent's business operating system</p>
        </div>
      </div>
    </div>
  );
}
