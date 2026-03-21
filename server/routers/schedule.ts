/**
 * server/routers/schedule.ts
 * Schedule Creator — tRPC router
 */
import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import * as schema from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { getTemplate } from '../schedule/templates';
import { extractWindowRules } from '../schedule/placementEngine';
import { BUCKET_METADATA, BUCKET_KEYS_ORDERED } from '../schedule/buckets';

async function requireDb() {
  const conn = await getDb();
  if (!conn) throw new Error('Database not available');
  return conn;
}

export const scheduleRouter = router({
  // ── GET PREFERENCES ──
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const conn = await requireDb();
    const rows = await conn.select().from(schema.schedulePreferences)
      .where(eq(schema.schedulePreferences.userId, ctx.user.id)).limit(1);
    return rows[0] ?? null;
  }),

  // ── SAVE GRID ──
  saveGrid: protectedProcedure
    .input(z.object({
      weeklyGrid: z.array(z.array(z.string())),
      templateApplied: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const conn = await requireDb();
      const existing = await conn.select().from(schema.schedulePreferences)
        .where(eq(schema.schedulePreferences.userId, ctx.user.id)).limit(1);

      if (existing[0]) {
        await conn.update(schema.schedulePreferences)
          .set({ weeklyGrid: input.weeklyGrid, templateApplied: input.templateApplied ?? null, updatedAt: new Date() })
          .where(eq(schema.schedulePreferences.userId, ctx.user.id));
      } else {
        await conn.insert(schema.schedulePreferences).values({
          userId: ctx.user.id,
          weeklyGrid: input.weeklyGrid,
          templateApplied: input.templateApplied ?? null,
        } as any);
      }
      return { success: true };
    }),

  // ── APPLY TEMPLATE ──
  applyTemplate: protectedProcedure
    .input(z.object({ templateName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const conn = await requireDb();
      const grid = getTemplate(input.templateName);
      const existing = await conn.select().from(schema.schedulePreferences)
        .where(eq(schema.schedulePreferences.userId, ctx.user.id)).limit(1);

      if (existing[0]) {
        await conn.update(schema.schedulePreferences)
          .set({ weeklyGrid: grid, templateApplied: input.templateName, updatedAt: new Date() })
          .where(eq(schema.schedulePreferences.userId, ctx.user.id));
      } else {
        await conn.insert(schema.schedulePreferences).values({
          userId: ctx.user.id,
          weeklyGrid: grid,
          templateApplied: input.templateName,
        } as any);
      }
      return { success: true, grid };
    }),

  // ── GET BUCKET METADATA ──
  getBuckets: protectedProcedure.query(async ({ ctx }) => {
    const conn = await requireDb();
    const customizations = await conn.select().from(schema.scheduleBucketCustomizations)
      .where(eq(schema.scheduleBucketCustomizations.userId, ctx.user.id));
    const customMap = new Map(customizations.map(c => [c.bucketKey, c]));

    return BUCKET_KEYS_ORDERED.map(key => {
      const meta = BUCKET_METADATA[key];
      const custom = customMap.get(key);
      return {
        key,
        label: custom?.label ?? meta.label,
        color: custom?.color ?? meta.color,
        shortcut: meta.shortcut,
        description: meta.description,
      };
    });
  }),

  // ── CUSTOMIZE BUCKET ──
  customizeBucket: protectedProcedure
    .input(z.object({
      bucketKey: z.string(),
      label: z.string().optional(),
      color: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const conn = await requireDb();
      const existing = await conn.select().from(schema.scheduleBucketCustomizations)
        .where(eq(schema.scheduleBucketCustomizations.userId, ctx.user.id))
        .limit(1);

      if (existing[0]) {
        await conn.update(schema.scheduleBucketCustomizations)
          .set({ label: input.label ?? null, color: input.color ?? null, updatedAt: new Date() })
          .where(eq(schema.scheduleBucketCustomizations.userId, ctx.user.id));
      } else {
        await conn.insert(schema.scheduleBucketCustomizations).values({
          userId: ctx.user.id,
          bucketKey: input.bucketKey,
          label: input.label ?? null,
          color: input.color ?? null,
        } as any);
      }
      return { success: true };
    }),

  // ── GET WINDOW RULES (derived from grid) ──
  getWindowRules: protectedProcedure.query(async ({ ctx }) => {
    const conn = await requireDb();
    const rows = await conn.select().from(schema.schedulePreferences)
      .where(eq(schema.schedulePreferences.userId, ctx.user.id)).limit(1);
    if (!rows[0]?.weeklyGrid) return [];
    return extractWindowRules(rows[0].weeklyGrid as string[][]);
  }),
});
