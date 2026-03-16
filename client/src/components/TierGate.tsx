import { useTier, SubscriptionTier } from '@/hooks/useTier';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { Link } from 'wouter';

const TIER_ORDER: SubscriptionTier[] = [
  'self_guided', 'group', 'one_on_one', 'enterprise',
];

interface TierGateProps {
  requiredTier: SubscriptionTier;
  featureName: string;
  children: React.ReactNode;
}

export function TierGate({ requiredTier, featureName, children }: TierGateProps) {
  const { tier } = useTier();
  const hasAccess =
    TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(requiredTier);

  if (hasAccess) return <>{children}</>;

  const upgradeLabel =
    requiredTier === 'group'
      ? 'Group Coaching — $297/mo'
      : '1:1 Coaching — $997/mo';

  return (
    <Card className="p-8 text-center border-dashed">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <Lock className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="font-display text-sm font-semibold mb-2">
        {featureName}
      </div>
      <div className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
        Available on the {upgradeLabel} plan.
      </div>
      <Link href="/settings">
        <Button className="bg-[#DC143C] hover:bg-[#DC143C]/90 text-white text-xs">
          Upgrade to Unlock
        </Button>
      </Link>
    </Card>
  );
}
