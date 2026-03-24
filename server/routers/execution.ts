/**
 * server/routers/execution.ts
 *
 * tRPC router for the Execution pillar.
 * All procedures wrapped with try/catch + structured logs.
 * getSummary returns EMPTY_SUMMARY on DB failure — never breaks UI.
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '../../drizzle/schema';
import { getDb } from '../db';
import {
  getExecutionSummary,
  getRecommendedActions,
  completeAction as executeCompleteAction,
  getStreakData,
  getLeaderboard,
} from '../domains/execution/executionService';

// Safe fallback returned when DB is unavailable
const EMPTY_SUMMARY = {
  score: 0,
  actions: [] as Awaited<ReturnType<typeof getRecommendedActions>>,
  currentStreak: 0,
  longestStreak: 0,
  completedActionsToday: 0,
  qualifiesForStreakToday: false,
  leaderboard: [] as Awaited<ReturnType<typeof getLeaderboard>>,
};

// Get the Monday of the current UTC week (YYYY-MM-DD)
function currentWeekStart(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day; // days to Monday
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  return monday.toISOString().split('T')[0];
}

export const executionRouter = router({
  // ── GET FULL SUMMARY (score + actions + streak + leaderboard) ──
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getExecutionSummary(ctx.user.id);
    } catch (err) {
      console.error('[execution.getSummary] DB error — returning empty state:', err);
      return EMPTY_SUMMARY;
    }
  }),

  // ── GET ACTIONS ONLY ──
  getActions: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getRecommendedActions(ctx.user.id);
    } catch (err) {
      console.error('[execution.getActions] DB error — returning empty list:', err);
      return [];
    }
  }),

  // ── GET STREAK DATA ──
  getStreak: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getStreakData(ctx.user.id);
    } catch (err) {
      console.error('[execution.getStreak] DB error — returning zero streak:', err);
      return { currentStreak: 0, longestStreak: 0, lastQualifiedDate: null };
    }
  }),

  // ── GET LEADERBOARD (scope: global | cohort | team | market_center) ──
  getLeaderboard: protectedProcedure
    .input(
      z.object({
        scope: z.enum(['global', 'cohort', 'team', 'market_center']).optional().default('global'),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        return await getLeaderboard(ctx.user.id, input?.scope ?? 'global');
      } catch (err) {
        console.error('[execution.getLeaderboard] DB error — returning empty list:', err);
        return [];
      }
    }),

  // ── GET WEEKLY STATS (current week + last 12 weeks) ──
  getWeeklyStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const conn = await getDb();
      if (!conn) return { current: null, history: [] };

      const rows = await conn
        .select()
        .from(schema.executionWeeklyStats)
        .where(eq(schema.executionWeeklyStats.userId, ctx.user.id))
        .orderBy(desc(schema.executionWeeklyStats.weekStart))
        .limit(12);

      const weekStart = currentWeekStart();
      const current = rows.find(r => r.weekStart === weekStart) ?? null;
      const history = rows;

      return { current, history, weekStart };
    } catch (err) {
      console.error('[execution.getWeeklyStats] DB error — returning empty:', err);
      return { current: null, history: [], weekStart: currentWeekStart() };
    }
  }),

  // ── SAVE WEEKLY STATS (upsert current week) ──
  saveWeeklyStats: protectedProcedure
    .input(
      z.object({
        contacts: z.number().min(0).default(0),
        appointments: z.number().min(0).default(0),
        listings: z.number().min(0).default(0),
        closings: z.number().min(0).default(0),
        reviewRequests: z.number().min(0).default(0),
        referrals: z.number().min(0).default(0),
        gciCents: z.number().min(0).default(0),
        notes: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const conn = await getDb();
        if (!conn) throw new Error('Database not available');

        const weekStart = currentWeekStart();

        await conn
          .insert(schema.executionWeeklyStats)
          .values({
            userId: ctx.user.id,
            weekStart,
            contacts: input.contacts,
            appointments: input.appointments,
            listings: input.listings,
            closings: input.closings,
            reviewRequests: input.reviewRequests,
            referrals: input.referrals,
            actionsCompleted: 0, // auto-populated from completions
            qualifiedDays: 0,    // auto-populated from daily stats
            gciCents: input.gciCents,
            notes: input.notes,
          })
          .onDuplicateKeyUpdate({
            set: {
              contacts: input.contacts,
              appointments: input.appointments,
              listings: input.listings,
              closings: input.closings,
              reviewRequests: input.reviewRequests,
              referrals: input.referrals,
              gciCents: input.gciCents,
              notes: input.notes,
            },
          });

        return { success: true, weekStart };
      } catch (err) {
        console.error('[execution.saveWeeklyStats] DB error:', err);
        throw err;
      }
    }),

  // ── COMPLETE AN ACTION ──
  completeAction: protectedProcedure
    .input(
      z.object({
        actionId: z.string(),
        actionType: z.string(),
        points: z.number().default(10),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await executeCompleteAction(
          ctx.user.id,
          input.actionId,
          input.actionType,
          input.points,
          input.metadata
        );
        return result;
      } catch (err) {
        console.error('[execution.completeAction] DB error:', err);
        throw err; // Re-throw mutations so UI shows error toast
      }
    }),
});
