import { trpc } from '@/lib/trpc';

export type SubscriptionTier = 'self_guided' | 'group' | 'one_on_one' | 'enterprise';

export function useTier() {
  const { data: subscription } = trpc.subscriptions.get.useQuery();
  const tier = (subscription?.tier ?? 'self_guided') as SubscriptionTier;
  const status = subscription?.status ?? 'trialing';
  const isActive = status === 'active' || status === 'trialing';

  return {
    tier,
    isActive,
    subscription,
    isSelfGuided: tier === 'self_guided',
    isGroup: ['group', 'one_on_one', 'enterprise'].includes(tier),
    isOneOnOne: ['one_on_one', 'enterprise'].includes(tier),
    isEnterprise: tier === 'enterprise',
  };
}
