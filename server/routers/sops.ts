/**
 * sops.ts — SOPs / Knowledge Library router
 * Extracted from routers.ts for modularization.
 */
import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const sopsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserSOPs(ctx.user.id);
  }),
  create: protectedProcedure
    .input(z.object({
      sopId: z.string(),
      title: z.string(),
      category: z.string().optional(),
      content: z.string().optional(),
      status: z.enum(["draft", "active", "archived"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.insertSOP({ ...input, userId: ctx.user.id });
      return { success: true };
    }),
  update: protectedProcedure
    .input(z.object({
      sopId: z.string(),
      updates: z.object({
        title: z.string().optional(),
        category: z.string().optional(),
        content: z.string().optional(),
        status: z.enum(["draft", "active", "archived"]).optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.updateSOP(ctx.user.id, input.sopId, input.updates);
      return { success: true };
    }),
});
