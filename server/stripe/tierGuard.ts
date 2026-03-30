/**
 * Tier Guard — Phase 3
 *
 * Provides tRPC middleware factories for subscription-tier enforcement.
 *
 * Usage in routers.ts:
 *   import { requireTier } from '../stripe/tierGuard';
 *   import { protectedProcedure } from './_core/trpc';
 *
 *   const groupProcedure = protectedProcedure.use(requireTier(['group', 'one_on_one', 'enterprise']));
 *
 * Tier hierarchy (lowest → highest):
 *   self_guided → group → one_on_one → enterprise
 *
 * Trial users (status=trialing) are granted access to self_guided features only.
 * past_due users retain read access but are blocked from premium mutations.
 */

import { TRPCError } from "@trpc/server";
import * as db from "../db";

export type Tier = "self_guided" | "group" | "one_on_one" | "enterprise";

const TIER_RANK: Record<Tier, number> = {
  self_guided: 1,
  group: 2,
  one_on_one: 3,
  enterprise: 4,
};

/**
 * Returns a tRPC middleware function that blocks the procedure unless the
 * user's subscription tier is in the `allowedTiers` list.
 *
 * Trial users are treated as self_guided.
 * past_due users are blocked from all premium tiers.
 */
export function requireTier(allowedTiers: Tier[]) {
  return async function tierMiddleware({ ctx, next }: { ctx: any; next: () => Promise<any> }) {
    // Admin bypass
    if (ctx.user?.role === "admin") return next();

    const userId: number = ctx.user.id;
    const sub = await db.getSubscription(userId);

    // No subscription row → treat as self_guided trialing
    const tier: Tier = (sub?.tier as Tier) ?? "self_guided";
    const status = sub?.status ?? "trialing";

    // past_due users are blocked from everything except self_guided
    if (status === "past_due" && !allowedTiers.includes("self_guided")) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Your payment is past due. Please update your billing information.",
      });
    }

    if (status === "cancelled") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Your subscription has been cancelled. Please resubscribe to access this feature.",
      });
    }

    if (!allowedTiers.includes(tier)) {
      const minRequired = allowedTiers.reduce<Tier | null>((best, t) => {
        if (!best || TIER_RANK[t] < TIER_RANK[best]) return t;
        return best;
      }, null);

      throw new TRPCError({
        code: "FORBIDDEN",
        message: `This feature requires the ${minRequired ?? "higher"} plan or above.`,
      });
    }

    return next();
  };
}

/**
 * Convenience: blocks cancelled/past_due users from any mutation.
 * Useful as a lightweight guard on write procedures that don't need
 * a specific tier but should require an active subscription.
 */
export function requireActiveSubscription() {
  return requireTier(["self_guided", "group", "one_on_one", "enterprise"]);
}
