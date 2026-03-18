// SubscriptionCard — Displays current tier + upgrade options (Phase 6)
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Users, Star } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const TIERS = [
  {
    id: 'self_guided',
    name: 'Self-Guided',
    price: '$97',
    icon: <Zap className="w-5 h-5" />,
    features: [
      'Full MREA deliverable system',
      'AI coaching assistant',
      'Pipeline & financial tracking',
      'SOP library',
      'Goal tracking (GPS + One Thing)',
    ],
  },
  {
    id: 'group',
    name: 'Group Coaching',
    price: '$297',
    icon: <Users className="w-5 h-5" />,
    popular: true,
    features: [
      'Everything in Self-Guided',
      'Monthly 90-min group sessions',
      'Bi-weekly 30-min check-ins',
      'Cohort accountability',
      'Coach feedback on deliverables',
    ],
  },
  {
    id: 'one_on_one',
    name: '1:1 Coaching',
    price: '$997',
    icon: <Star className="w-5 h-5" />,
    features: [
      'Everything in Group',
      'Weekly 1:1 sessions',
      'Pre-session AI briefs',
      'Custom commitment tracking',
      'Priority support',
    ],
  },
];

export function SubscriptionCard() {
  const subQuery = trpc.subscriptions.get.useQuery();
  const checkoutMutation = trpc.subscriptions.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const cancelMutation = trpc.subscriptions.cancel.useMutation({
    onSuccess: () => {
      subQuery.refetch();
      toast.success('Subscription will cancel at end of billing period');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const sub = subQuery.data;
  const currentTier = sub?.tier || 'self_guided';
  const status = sub?.status || 'trialing';

  return (
    <div className="space-y-4">
      {/* Current plan banner */}
      <Card className="p-4 border-[#DC143C]/20 bg-[#DC143C]/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#DC143C]" />
              <span className="text-sm font-semibold">
                Current Plan: {TIERS.find(t => t.id === currentTier)?.name || currentTier}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Status: <Badge variant="outline" className="text-[10px] ml-1 capitalize">{status}</Badge>
              {status === 'trialing' && sub?.trialEndsAt && (
                <span className="ml-2">
                  Trial ends {new Date(sub.trialEndsAt).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
          {sub?.stripeSubscriptionId && !sub?.cancelAtPeriodEnd && (
            <Button variant="outline" size="sm" className="text-xs text-destructive"
              disabled={cancelMutation.isPending}
              onClick={() => {
                if (confirm('Cancel your subscription? You will retain access until the end of the billing period.')) {
                  cancelMutation.mutate();
                }
              }}>
              Cancel Plan
            </Button>
          )}
          {sub?.cancelAtPeriodEnd && (
            <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30">
              Cancels at period end
            </Badge>
          )}
        </div>
      </Card>

      {/* Tier comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((tier) => {
          const isCurrent = tier.id === currentTier;
          return (
            <Card key={tier.id}
              className={`p-5 relative ${isCurrent ? 'border-[#DC143C]/40 bg-[#DC143C]/5' : ''} ${tier.popular ? 'ring-1 ring-[#DC143C]/30' : ''}`}>
              {tier.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#DC143C] text-white text-[10px]">
                  Most Popular
                </Badge>
              )}
              <div className="text-center mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${isCurrent ? 'bg-[#DC143C] text-white' : 'bg-muted text-muted-foreground'}`}>
                  {tier.icon}
                </div>
                <h3 className="text-sm font-semibold">{tier.name}</h3>
                <div className="text-2xl font-mono font-bold mt-1">{tier.price}<span className="text-xs text-muted-foreground font-normal">/mo</span></div>
              </div>
              <ul className="space-y-2 mb-4">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button variant="outline" size="sm" className="w-full text-xs" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button size="sm"
                  className={`w-full text-xs ${tier.popular ? 'bg-[#DC143C] text-white' : ''}`}
                  variant={tier.popular ? 'default' : 'outline'}
                  disabled={checkoutMutation.isPending}
                  onClick={() => checkoutMutation.mutate({ tier: tier.id as any })}>
                  {checkoutMutation.isPending ? 'Loading...' : 'Upgrade'}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
