/**
 * server/routers/execution.ts
 *
 * tRPC router for the Execution pillar.
 * All procedures wrapped with try/catch + structured logs.
 * getSummary returns EMPTY_SUMMARY on DB failure — never breaks UI.
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import * as schema from '../../drizzle/schema';
import { getDb } from '../db';
import { invokeLLM } from '../_core/llm';
import {
  getExecutionSummary,
  getRecommendedActions,
  completeAction as executeCompleteAction,
  getStreakData,
  getLeaderboard,
} from '../domains/execution/executionService';

// ── In-memory coaching nudge cache (userId:YYYY-MM-DD → nudge string) ──
const nudgeCache = new Map<string, string>();

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

// Get today's UTC date string (YYYY-MM-DD)
function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

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

  // ── GET STREAK SUMMARY (lightweight — for sidebar) ──
  getStreakSummary: protectedProcedure.query(async ({ ctx }) => {
    try {
      const conn = await getDb();
      if (!conn) return { currentStreak: 0, longestStreak: 0 };
      const rows = await conn
        .select({
          currentStreak: schema.executionStreaks.currentStreak,
          longestStreak: schema.executionStreaks.longestStreak,
        })
        .from(schema.executionStreaks)
        .where(eq(schema.executionStreaks.userId, ctx.user.id))
        .limit(1);
      if (rows.length === 0) return { currentStreak: 0, longestStreak: 0 };
      return { currentStreak: rows[0].currentStreak, longestStreak: rows[0].longestStreak };
    } catch (err) {
      console.error('[execution.getStreakSummary] DB error — returning zero streak:', err);
      return { currentStreak: 0, longestStreak: 0 };
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

  // ── GET AI COACHING NUDGE (Sprint D — Group 1) ──
  // Returns a context-aware 1-2 sentence observation generated by Claude.
  // Cached per user per day (in-memory Map) to prevent duplicate LLM calls.
  getCoachingNudge: protectedProcedure.query(async ({ ctx }) => {
    const FALLBACK = {
      nudge: "Your execution data is loading — check back after logging today's actions.",
    };
    try {
      const today = todayString();
      const cacheKey = `${ctx.user.id}:${today}`;

      // Return cached value if available
      if (nudgeCache.has(cacheKey)) {
        return { nudge: nudgeCache.get(cacheKey)! };
      }

      const conn = await getDb();
      if (!conn) return FALLBACK;

      const weekStart = currentWeekStart();
      const [profileRows, streakRows, weeklyRows, activePipelineRows] = await Promise.all([
        conn
          .select({
            incomeGoal: schema.agentProfiles.incomeGoal,
            currentLevel: schema.agentProfiles.currentLevel,
          })
          .from(schema.agentProfiles)
          .where(eq(schema.agentProfiles.userId, ctx.user.id))
          .limit(1),
        conn
          .select({ currentStreak: schema.executionStreaks.currentStreak })
          .from(schema.executionStreaks)
          .where(eq(schema.executionStreaks.userId, ctx.user.id))
          .limit(1),
        conn
          .select()
          .from(schema.executionWeeklyStats)
          .where(
            and(
              eq(schema.executionWeeklyStats.userId, ctx.user.id),
              eq(schema.executionWeeklyStats.weekStart, weekStart)
            )
          )
          .limit(1),
        conn
          .select({ count: sql<number>`count(*)` })
          .from(schema.leads)
          .where(
            and(
              eq(schema.leads.userId, ctx.user.id),
              sql`${schema.leads.stage} NOT IN ('Closed', 'Dead', 'Nurture')`
            )
          ),
      ]);

      // Get today's score from summary
      let score = 0;
      try {
        const summary = await getExecutionSummary(ctx.user.id);
        score = summary.score;
      } catch {
        // non-fatal
      }

      const profile = profileRows[0];
      const streak = streakRows[0]?.currentStreak ?? 0;
      const weekly = weeklyRows[0];
      const activePipelineCount = Number(activePipelineRows[0]?.count ?? 0);
      const incomeGoal = profile?.incomeGoal ?? 0;
      const currentLevel = profile?.currentLevel ?? 1;

      const contextMessage = `Agent data:\n- Execution score: ${score}/100\n- Current streak: ${streak} days\n- This week: ${weekly?.contacts ?? 0} contacts, ${weekly?.appointments ?? 0} appointments, ${weekly?.actionsCompleted ?? 0} actions completed, ${weekly?.qualifiedDays ?? 0} qualified days\n- MREA level: ${currentLevel}\n- Active pipeline leads: ${activePipelineCount}\n- Annual GCI goal: $${incomeGoal}\n\nWrite a 1-2 sentence coaching observation based on this data.`;

      const result = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are ASRE — a KW real estate business execution coach.\nYou have access to an agent's real-time business data.\nWrite exactly 1-2 sentences. Be specific and data-driven.\nUse the agent's actual numbers. Do not be generic or motivational.\nDo not use the agent's name. Do not use exclamation marks.\nFocus on the single most actionable observation given the data.\nTone: direct, calm, like a trusted advisor who has seen the numbers.`,
          },
          {
            role: 'user',
            content: contextMessage,
          },
        ],
        maxTokens: 150,
      });

      const nudge = (result.choices[0]?.message?.content as string)?.trim();
      if (!nudge) return FALLBACK;

      // Cache for today
      nudgeCache.set(cacheKey, nudge);

      return { nudge };
    } catch (err) {
      console.error('[execution.getCoachingNudge] Error:', err);
      return FALLBACK;
    }
  }),

  // ── GET GCI PACE INDICATOR (Sprint D — Group 1) ──
  // Returns YTD GCI vs annual goal with projected annual pace.
  // All transaction data is manually entered by the agent.
  getGciPace: protectedProcedure.query(async ({ ctx }) => {
    const EMPTY = {
      incomeGoal: 0,
      ytdGci: 0,
      projectedYtd: 0,
      percentComplete: 0,
      onPace: false,
      projectedGap: 0,
    };
    try {
      const conn = await getDb();
      if (!conn) return EMPTY;

      const currentYear = new Date().getFullYear();
      const yearStart = `${currentYear}-01-01`;

      const [profileRows, transactionRows] = await Promise.all([
        conn
          .select({ incomeGoal: schema.agentProfiles.incomeGoal })
          .from(schema.agentProfiles)
          .where(eq(schema.agentProfiles.userId, ctx.user.id))
          .limit(1),
        conn
          .select({ commission: schema.transactions.commission })
          .from(schema.transactions)
          .where(
            and(
              eq(schema.transactions.userId, ctx.user.id),
              eq(schema.transactions.status, 'closed'),
              gte(schema.transactions.closeDate, yearStart)
            )
          ),
      ]);

      const incomeGoal = profileRows[0]?.incomeGoal ?? 0;
      if (!incomeGoal) return EMPTY;

      // Sum closed GCI for current year (commission stored in dollars)
      const ytdGci = transactionRows.reduce((sum, t) => sum + (t.commission ?? 0), 0);

      // Calculate pace
      const now = new Date();
      const startOfYear = new Date(currentYear, 0, 1);
      const dayOfYear = Math.max(
        1,
        Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1
      );
      const isLeapYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0;
      const daysInYear = isLeapYear ? 366 : 365;

      const dailyRunRate = ytdGci / dayOfYear;
      const projectedYtd = Math.round(dailyRunRate * daysInYear);
      const percentComplete = Math.min(100, (ytdGci / incomeGoal) * 100);
      const onPace = projectedYtd >= incomeGoal;
      const projectedGap = incomeGoal - projectedYtd;

      return {
        incomeGoal,
        ytdGci,
        projectedYtd,
        percentComplete,
        onPace,
        projectedGap,
      };
    } catch (err) {
      console.error('[execution.getGciPace] DB error:', err);
      return EMPTY;
    }
  }),
});
