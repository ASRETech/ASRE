// server/routers/agentJourney.ts
// tRPC router for the Agent Essentials journey (T6–T9, domain='agent')

import { z } from 'zod';
import { protectedProcedure } from '../_core/trpc';
import * as db from '../db';
import {
  computeUnlockedAgentTracks,
  computeAgentHealthScore,
} from '../milestones/allMilestoneKeys';

export const agentJourneyRouter = {
  getJourney: protectedProcedure.query(async ({ ctx }) => {
    const milestones = await db.getMilestonesByDomain(ctx.user.id, 'agent');
    const unlockedTracks = computeUnlockedAgentTracks(milestones);
    const healthScore = computeAgentHealthScore(milestones);
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
      await db.upsertMilestone(ctx.user.id, 'agent', input);
      return { success: true };
    }),
};
