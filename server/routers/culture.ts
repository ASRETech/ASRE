/**
 * culture.ts — Culture Docs router (mission, vision, values)
 * Extracted from routers.ts for modularization.
 */
import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const cultureRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserCultureDoc(ctx.user.id);
  }),
  upsert: protectedProcedure
    .input(z.object({
      missionStatement: z.string().max(500).optional(),
      visionStatement: z.string().max(500).optional(),
      coreValues: z.array(z.string().max(200)).max(10).optional(),
      teamCommitments: z.array(z.string().max(500)).max(20).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.upsertCultureDoc({ ...input, userId: ctx.user.id });
      return { success: true };
    }),
});
