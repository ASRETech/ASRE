/**
 * server/routers/calendar.ts
 * Action Engine — Google Calendar tRPC router
 * Phase 11 fixes: CRIT-01, CRIT-02, CRIT-06, HIGH-08
 */
import { protectedProcedure, router } from '../_core/trpc';
import { encryptToken, decryptToken } from '../_core/crypto';
import { z } from 'zod';
import { ENV } from '../_core/env';
import { google } from 'googleapis';
import { getDb } from '../db';
import * as schema from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getGCalClient, createAsreCalendar, insertGCalEvent } from '../calendar/gcal';
import { generateEventQueue } from '../calendar/eventGenerator';
import { addMinutes } from 'date-fns';

function getOAuth2Client() {
  return new google.auth.OAuth2(
    ENV.googleClientId,
    ENV.googleClientSecret,
    ENV.googleRedirectUri
  );
}

async function requireDb() {
  const conn = await getDb();
  if (!conn) throw new Error('Database not available');
  return conn;
}

// CRIT-06: Refresh access token if expired
async function refreshTokenIfNeeded(
  conn: Awaited<ReturnType<typeof requireDb>>,
  settings: typeof schema.calendarSettings.$inferSelect
): Promise<string> {
  // If no refresh token, just return the current access token (decrypted)
  if (!settings.gcalRefreshToken) return settings.gcalAccessToken ? decryptToken(settings.gcalAccessToken) : '';

  try {
    const auth = getOAuth2Client();
    auth.setCredentials({
      access_token: settings.gcalAccessToken ? decryptToken(settings.gcalAccessToken) : null,
      refresh_token: settings.gcalRefreshToken ? decryptToken(settings.gcalRefreshToken) : null,
    });
    const { credentials } = await auth.refreshAccessToken();
    if (credentials.access_token) {
      const encryptedNew = encryptToken(credentials.access_token);
      if (encryptedNew !== settings.gcalAccessToken) {
        await conn.update(schema.calendarSettings)
          .set({ gcalAccessToken: encryptedNew })
          .where(eq(schema.calendarSettings.userId, settings.userId));
      }
      return credentials.access_token;
    }
  } catch {
    // If refresh fails, proceed with existing token
  }
  return settings.gcalAccessToken ? decryptToken(settings.gcalAccessToken) : ''
}

// CRIT-01: Shared helper to push a single event to GCal
async function pushSingleEvent(
  conn: Awaited<ReturnType<typeof requireDb>>,
  event: typeof schema.calendarEvents.$inferSelect,
  settings: typeof schema.calendarSettings.$inferSelect,
  calendarId: string
): Promise<string> {
  const accessToken = await refreshTokenIfNeeded(conn, settings);
  const auth = getGCalClient(accessToken, settings.gcalRefreshToken ? decryptToken(settings.gcalRefreshToken) : undefined);

  const startTime = event.suggestedStartTime ?? '09:00';
  const startDate = new Date(`${event.suggestedDate}T${startTime}:00`);
  const endDate = addMinutes(startDate, event.durationMinutes ?? 60);

  return insertGCalEvent(auth, {
    calendarId,
    title: event.title,
    description: event.description ?? '',
    colorId: event.gcalColorId ?? '1',
    remindMinutesBefore: event.remindMinutesBefore ?? 30,
    isAllDay: !event.suggestedStartTime,
    date: !event.suggestedStartTime ? event.suggestedDate ?? undefined : undefined,
    startDateTime: event.suggestedStartTime ? startDate.toISOString() : undefined,
    endDateTime: event.suggestedStartTime ? endDate.toISOString() : undefined,
    recurrenceRule: event.recurrenceRule ?? undefined,
    timezone: settings.timezone ?? 'America/New_York', // LOW-04: user's configured timezone
    extendedProperties: { private: { asreEventId: String(event.id), sourceKey: event.sourceKey ?? '' } },
  });
}

export const calendarRouter = router({
  // ── GET AUTH URL ──
  getAuthUrl: protectedProcedure.query(({ ctx }) => {
    const auth = getOAuth2Client();
    const url = auth.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      state: `cal:${ctx.user.id}`,
    });
    return { url };
  }),

  // ── GET STATUS ──
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const conn = await requireDb();
    const settings = await conn.select().from(schema.calendarSettings)
      .where(eq(schema.calendarSettings.userId, ctx.user.id))
      .limit(1);
    if (!settings[0]?.gcalAccessToken) {
      return { connected: false, settings: null };
    }
    return { connected: true, settings: settings[0] };
  }),

  // ── GET SETTINGS (HIGH-08: strip tokens from response) ──
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const conn = await requireDb();
    const rows = await conn.select().from(schema.calendarSettings)
      .where(eq(schema.calendarSettings.userId, ctx.user.id)).limit(1);
    if (!rows[0]) return null;
    // Strip sensitive tokens before returning to client
    const { gcalAccessToken: _a, gcalRefreshToken: _r, ...safe } = rows[0];
    const isCalendarConnected = rows[0].hasScopeCalendar ?? false;
    const calendarScopeNeedsUpgrade = (rows[0].gcalAccessToken != null) && !rows[0].hasScopeCalendar;
    return { ...safe, isCalendarConnected, calendarScopeNeedsUpgrade };
  }),

  // ── UPDATE SETTINGS ──
  updateSettings: protectedProcedure
    .input(z.object({
      leadGenEnabled: z.boolean().optional(),
      leadGenStartTime: z.string().optional(),
      leadGenDays: z.string().optional(),
      contactsPerHour: z.number().optional(),
      requireApprovalBeforePush: z.boolean().optional(),
      notifyFinancialDeadlines: z.boolean().optional(),
      notifyMilestones: z.boolean().optional(),
      notifyDeliverables: z.boolean().optional(),
      notifyPulseReminder: z.boolean().optional(),
      pulseReminderTime: z.string().optional(),
      timezone: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const conn = await requireDb();
      const existing = await conn.select().from(schema.calendarSettings)
        .where(eq(schema.calendarSettings.userId, ctx.user.id)).limit(1);

      const updateData: Record<string, unknown> = { ...input };
      if (input.contactsPerHour !== undefined) {
        updateData.contactsPerHour = String(input.contactsPerHour);
      }

      if (existing[0]) {
        await conn.update(schema.calendarSettings)
          .set({ ...updateData, updatedAt: new Date() } as any)
          .where(eq(schema.calendarSettings.userId, ctx.user.id));
      } else {
        await conn.insert(schema.calendarSettings).values({
          userId: ctx.user.id,
          ...updateData,
        } as any);
      }
      return { success: true };
    }),

  // ── GET EVENT QUEUE ──
  getEventQueue: protectedProcedure
    .input(z.object({
      status: z.enum(['pending', 'pushed', 'skipped', 'completed', 'cancelled']).optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const conn = await requireDb();
      const conditions = [eq(schema.calendarEvents.userId, ctx.user.id)];
      if (input.status) {
        conditions.push(eq(schema.calendarEvents.status, input.status));
      }
      return conn.select().from(schema.calendarEvents)
        .where(and(...conditions))
        .orderBy(desc(schema.calendarEvents.createdAt))
        .limit(input.limit);
    }),

  // ── GENERATE QUEUE (HIGH-01: deduplication by sourceKey) ──
  generateQueue: protectedProcedure.mutation(async ({ ctx }) => {
    const conn = await requireDb();

    const queryProxy = {
      calendarSettings: {
        findFirst: async () => {
          const rows = await conn.select().from(schema.calendarSettings)
            .where(eq(schema.calendarSettings.userId, ctx.user.id)).limit(1);
          return rows[0] ?? null;
        }
      },
      schedulePreferences: {
        findFirst: async () => {
          const rows = await conn.select().from(schema.schedulePreferences)
            .where(eq(schema.schedulePreferences.userId, ctx.user.id)).limit(1);
          return rows[0] ?? null;
        }
      },
      agentProfiles: {
        findFirst: async () => {
          const rows = await conn.select().from(schema.agentProfiles)
            .where(eq(schema.agentProfiles.userId, ctx.user.id)).limit(1);
          return rows[0] ?? null;
        }
      },
      wealthMilestones: {
        findMany: async () => {
          return conn.select().from(schema.wealthMilestones)
            .where(eq(schema.wealthMilestones.userId, ctx.user.id));
        }
      },
      economicModel: {
        findFirst: async () => {
          const rows = await conn.select().from(schema.teamEconomicModel)
            .where(eq(schema.teamEconomicModel.userId, ctx.user.id)).limit(1);
          return rows[0] ?? null;
        }
      },
    };

    const events = await generateEventQueue({ db: { query: queryProxy } }, ctx.user.id);

    // HIGH-01: Only insert events that don't already exist (by sourceKey) — prevents duplicates on re-generate
    const existing = await conn.select({ sourceKey: schema.calendarEvents.sourceKey })
      .from(schema.calendarEvents)
      .where(eq(schema.calendarEvents.userId, ctx.user.id));
    const existingKeys = new Set(existing.map(e => e.sourceKey).filter(Boolean));
    const newEvents = events.filter(e => e.sourceKey && !existingKeys.has(e.sourceKey));

    if (newEvents.length > 0) {
      await conn.insert(schema.calendarEvents).values(newEvents as any);
    }

    return { generated: newEvents.length, total: events.length };
  }),

  // ── PUSH EVENT TO GOOGLE CALENDAR (CRIT-01: uses shared helper) ──
  pushEvent: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const conn = await requireDb();
      const [event] = await conn.select().from(schema.calendarEvents)
        .where(and(eq(schema.calendarEvents.id, input.eventId), eq(schema.calendarEvents.userId, ctx.user.id)));
      if (!event) throw new Error('Event not found');

      const [settings] = await conn.select().from(schema.calendarSettings)
        .where(eq(schema.calendarSettings.userId, ctx.user.id)).limit(1);
      if (!settings?.gcalAccessToken) throw new Error('Google Calendar not connected');

      let calendarId = settings.gcalCalendarId;
      if (!calendarId) {
        // CRIT-01: Create ASRE calendar on first push
        const accessToken = await refreshTokenIfNeeded(conn, settings);
        const auth = getGCalClient(accessToken, settings.gcalRefreshToken ? decryptToken(settings.gcalRefreshToken) : undefined);
        calendarId = await createAsreCalendar(auth);
        await conn.update(schema.calendarSettings)
          .set({ gcalCalendarId: calendarId })
          .where(eq(schema.calendarSettings.userId, ctx.user.id));
      }

      const gcalId = await pushSingleEvent(conn, event, settings, calendarId);

      await conn.update(schema.calendarEvents)
        .set({ status: 'pushed', gcalEventId: gcalId, gcalCalendarId: calendarId, pushedAt: new Date() })
        .where(eq(schema.calendarEvents.id, input.eventId));

      return { success: true, gcalEventId: gcalId };
    }),

  // ── SKIP EVENT ──
  skipEvent: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const conn = await requireDb();
      await conn.update(schema.calendarEvents)
        .set({ status: 'skipped' })
        .where(and(eq(schema.calendarEvents.id, input.eventId), eq(schema.calendarEvents.userId, ctx.user.id)));
      return { success: true };
    }),

  // ── PUSH ALL PENDING (CRIT-01: uses shared helper) ──
  pushAll: protectedProcedure.mutation(async ({ ctx }) => {
    const conn = await requireDb();
    const [settings] = await conn.select().from(schema.calendarSettings)
      .where(eq(schema.calendarSettings.userId, ctx.user.id)).limit(1);
    if (!settings?.gcalAccessToken) throw new Error('Google Calendar not connected');

    const pending = await conn.select().from(schema.calendarEvents)
      .where(and(eq(schema.calendarEvents.userId, ctx.user.id), eq(schema.calendarEvents.status, 'pending')));

    let calendarId = settings.gcalCalendarId;
    if (!calendarId) {
      const accessToken = await refreshTokenIfNeeded(conn, settings);
      const auth = getGCalClient(accessToken, settings.gcalRefreshToken ? decryptToken(settings.gcalRefreshToken) : undefined);
      calendarId = await createAsreCalendar(auth);
      await conn.update(schema.calendarSettings)
        .set({ gcalCalendarId: calendarId })
        .where(eq(schema.calendarSettings.userId, ctx.user.id));
    }

    let pushed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const event of pending) {
      try {
        const gcalId = await pushSingleEvent(conn, event, settings, calendarId);
        await conn.update(schema.calendarEvents)
          .set({ status: 'pushed', gcalEventId: gcalId, gcalCalendarId: calendarId, pushedAt: new Date() })
          .where(eq(schema.calendarEvents.id, event.id));
        pushed++;
      } catch (err) {
        failed++;
        errors.push(err instanceof Error ? err.message : String(err));
      }
    }

    return { pushed, failed, errors };
  }),

  // Legacy compatibility: Settings.tsx uses trpc.calendar.upsertToken
  upsertToken: protectedProcedure
    .input(z.object({
      provider: z.string().optional(),
      calendarId: z.string().optional(),
      syncEnabled: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const conn = await requireDb();
      const existing = await conn.select().from(schema.calendarTokens)
        .where(eq(schema.calendarTokens.userId, ctx.user.id)).limit(1);
      if (existing[0]) {
        await conn.update(schema.calendarTokens)
          .set({ ...input, updatedAt: new Date() } as any)
          .where(eq(schema.calendarTokens.userId, ctx.user.id));
      } else {
        await conn.insert(schema.calendarTokens).values({
          userId: ctx.user.id,
          provider: input.provider ?? 'google',
          calendarId: input.calendarId ?? null,
          syncEnabled: input.syncEnabled ?? true,
        } as any);
      }
      return { success: true };
    }),
});
