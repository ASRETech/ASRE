// Coach Accept — Public page for accepting a coaching invite
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { Check, UserCheck, LogIn, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function CoachAcceptPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [token, setToken] = useState('');
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) setToken(t);
  }, []);

  const acceptMutation = trpc.coachPortal.acceptInvite.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setAccepted(true);
      }
    },
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA]">
        <Card className="p-8 max-w-md w-full text-center">
          <h1 className="font-display text-lg font-bold mb-2">Invalid Invite</h1>
          <p className="text-sm text-muted-foreground">This invite link is missing a token. Please ask your agent for a new link.</p>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA]">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="font-display text-lg font-bold mb-2">You're Connected!</h1>
          <p className="text-sm text-muted-foreground mb-4">
            You've been linked as a coach. Visit the Coach Portal to view your agent's journey progress and leave feedback.
          </p>
          <Button
            className="bg-[#DC143C] hover:bg-[#B01030] text-white"
            onClick={() => window.location.href = '/coach'}
          >
            Go to Coach Portal
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA]">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-[#DC143C]/10 flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-8 h-8 text-[#DC143C]" />
        </div>
        <h1 className="font-display text-lg font-bold mb-2">Coaching Invite</h1>
        <p className="text-sm text-muted-foreground mb-6">
          An agent has invited you to be their coach on AgentOS. Accept to view their MREA journey progress, deliverables, and leave coaching feedback.
        </p>

        {authLoading ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        ) : !isAuthenticated ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">You need to sign in first to accept this invite.</p>
            <Button
              className="w-full bg-[#DC143C] hover:bg-[#B01030] text-white"
              onClick={() => window.location.href = getLoginUrl()}
            >
              <LogIn className="w-4 h-4 mr-2" /> Sign In to Accept
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Signed in as <span className="font-medium text-foreground">{user?.name || user?.email}</span></p>
            <Button
              className="w-full bg-[#DC143C] hover:bg-[#B01030] text-white"
              onClick={() => acceptMutation.mutate({ token })}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Accept Coaching Invite
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
