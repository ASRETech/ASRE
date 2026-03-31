// server/routers/businessJourney.ts
// tRPC router for the Business Excellence journey (T10–T13, domain='business')

import { z } from 'zod';
import { protectedProcedure } from '../_core/trpc';
import * as db from '../db';
import {
  computeUnlockedBusinessTracks,
  computeBusinessHealthScore,
} from '../milestones/allMilestoneKeys';

export const businessJourneyRouter = {
  getJourney: protectedProcedure.query(async ({ ctx }) => {
    const milestones = await db.getMilestonesByDomain(ctx.user.id, 'business');
    const unlockedTracks = computeUnlockedBusinessTracks(milestones);
    const healthScore = computeBusinessHealthScore(milestones);
    return { milestones, unlockedTracks, healthScore };
  }),

  updateMilestone: protectedProcedure
    .input(z.object({
      milestoneKey: z.string(),
      status: z.enum(['not_started', 'in_progress', 'done']),
      notes: z.string().optional(),
      completedDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.upsertMilestone(ctx.user.id, 'business', input);
      return { success: true };
    }),
};
