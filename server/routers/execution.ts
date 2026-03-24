/**
 * server/routers/execution.ts
 *
 * tRPC router for the Execution pillar.
 * Exposes: getSummary, getActions, completeAction
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import {
  getExecutionSummary,
  getRecommendedActions,
  completeAction as executeCompleteAction,
  getStreakData,
  getLeaderboard,
} from '../domains/execution/executionService';

export const executionRouter = router({
  // ── GET FULL SUMMARY (score + actions + streak + leaderboard) ──
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    return getExecutionSummary(ctx.user.id);
  }),

  // ── GET ACTIONS ONLY ──
  getActions: protectedProcedure.query(async ({ ctx }) => {
    return getRecommendedActions(ctx.user.id);
  }),

  // ── GET STREAK DATA ──
  getStreak: protectedProcedure.query(async ({ ctx }) => {
    return getStreakData(ctx.user.id);
  }),

  // ── GET LEADERBOARD ──
  getLeaderboard: protectedProcedure.query(async ({ ctx }) => {
    return getLeaderboard(ctx.user.id);
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
      const result = await executeCompleteAction(
        ctx.user.id,
        input.actionId,
        input.actionType,
        input.points,
        input.metadata
      );
      return result;
    }),
});
