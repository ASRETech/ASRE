/**
 * Stripe Webhook Handler — Phase 3
 *
 * Handles the full subscription lifecycle:
 *   checkout.session.completed          → activate subscription after checkout
 *   customer.subscription.updated       → sync tier/status/period changes
 *   customer.subscription.deleted       → mark cancelled
 *   invoice.payment_succeeded           → renew period dates
 *   invoice.payment_failed              → mark past_due
 *
 * All updates go through db.updateSubscription() which is already userId-scoped.
 * The handler is intentionally idempotent — re-processing the same event is safe.
 */

import type Stripe from "stripe";
import * as db from "../db";

// ── Tier mapping: Stripe price ID → internal tier slug ───────────────────────
// Populated from ENV at call time so we don't need top-level ENV access.
function getPriceTierMap(): Record<string, "self_guided" | "group" | "one_on_one"> {
  return {
    [process.env.STRIPE_PRICE_SELF_GUIDED ?? "__missing__"]: "self_guided",
    [process.env.STRIPE_PRICE_GROUP ?? "__missing__"]: "group",
    [process.env.STRIPE_PRICE_ONE_ON_ONE ?? "__missing__"]: "one_on_one",
  };
}

function tierFromPriceId(priceId: string): "self_guided" | "group" | "one_on_one" | null {
  return getPriceTierMap()[priceId] ?? null;
}

// ── Status mapping: Stripe subscription status → internal status ─────────────
function mapStripeStatus(
  stripeStatus: Stripe.Subscription["status"]
): "trialing" | "active" | "past_due" | "cancelled" {
  switch (stripeStatus) {
    case "trialing":    return "trialing";
    case "active":      return "active";
    case "past_due":    return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "cancelled";
    default:            return "active";
  }
}

// ── Main event dispatcher ─────────────────────────────────────────────────────
export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  console.log(`[Stripe] Processing event: ${event.type} (${event.id})`);

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;

    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    default:
      // Unhandled event — log and ignore
      console.log(`[Stripe] Unhandled event type: ${event.type}`);
  }
}

// ── Handlers ──────────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId ? parseInt(session.metadata.userId) : null;
  const tier = (session.metadata?.tier as "self_guided" | "group" | "one_on_one") ?? null;
  const stripeSubscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id ?? null;
  const stripeCustomerId = typeof session.customer === "string"
    ? session.customer
    : session.customer?.id ?? null;

  if (!userId || !tier) {
    console.warn("[Stripe] checkout.session.completed missing userId or tier in metadata");
    return;
  }

  await db.updateSubscription(userId, {
    tier,
    status: "active",
    stripeSubscriptionId: stripeSubscriptionId ?? undefined,
    stripeCustomerId: stripeCustomerId ?? undefined,
    cancelAtPeriodEnd: false,
  });

  console.log(`[Stripe] Checkout completed — userId=${userId} tier=${tier}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripeCustomerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer?.id;

  if (!stripeCustomerId) return;

  const sub = await db.getSubscriptionByStripeCustomer(stripeCustomerId);
  if (!sub) {
    console.warn(`[Stripe] No local subscription found for customer ${stripeCustomerId}`);
    return;
  }

  // Derive tier from the first line item's price
  const firstItem = subscription.items.data[0];
  const priceId = firstItem?.price?.id ?? "";
  const tier = tierFromPriceId(priceId);
  const status = mapStripeStatus(subscription.status);

  // In Stripe v20, period dates live on the subscription item, not the subscription object
  const currentPeriodStart = firstItem?.current_period_start
    ? new Date(firstItem.current_period_start * 1000)
    : undefined;
  const currentPeriodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000)
    : undefined;

  await db.updateSubscription(sub.userId, {
    ...(tier ? { tier } : {}),
    status,
    stripeSubscriptionId: subscription.id,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodStart,
    currentPeriodEnd,
  });

  console.log(`[Stripe] Subscription updated — userId=${sub.userId} status=${status} tier=${tier ?? "unchanged"}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeCustomerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer?.id;

  if (!stripeCustomerId) return;

  const sub = await db.getSubscriptionByStripeCustomer(stripeCustomerId);
  if (!sub) return;

  await db.updateSubscription(sub.userId, {
    status: "cancelled",
    cancelAtPeriodEnd: false,
  });

  console.log(`[Stripe] Subscription deleted — userId=${sub.userId}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const stripeCustomerId = typeof invoice.customer === "string"
    ? invoice.customer
    : invoice.customer?.id;

  if (!stripeCustomerId) return;

  const sub = await db.getSubscriptionByStripeCustomer(stripeCustomerId);
  if (!sub) return;

  // In Stripe v20, invoice.parent.subscription_details holds the subscription reference
  const parentSub = invoice.parent?.type === 'subscription_details'
    ? (invoice.parent as any).subscription_details?.subscription
    : null;
  const stripeSubId = typeof parentSub === "string" ? parentSub : parentSub?.id ?? undefined;

  await db.updateSubscription(sub.userId, {
    status: "active",
    ...(stripeSubId ? { stripeSubscriptionId: stripeSubId } : {}),
  });

  console.log(`[Stripe] Invoice payment succeeded — userId=${sub.userId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const stripeCustomerId = typeof invoice.customer === "string"
    ? invoice.customer
    : invoice.customer?.id;

  if (!stripeCustomerId) return;

  const sub = await db.getSubscriptionByStripeCustomer(stripeCustomerId);
  if (!sub) return;

  await db.updateSubscription(sub.userId, {
    status: "past_due",
  });

  console.log(`[Stripe] Invoice payment failed — userId=${sub.userId}`);
}
