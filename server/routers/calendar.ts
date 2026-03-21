/**
 * server/routers/calendar.ts
 * Action Engine — Google Calendar tRPC router
 */
import { protectedProcedure, router } from '../_core/trpc';
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

  // ── GET SETTINGS ──
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const conn = await requireDb();
    const rows = await conn.select().from(schema.calendarSettings)
      .where(eq(schema.calendarSettings.userId, ctx.user.id)).limit(1);
    return rows[0] ?? null;
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

  // ── GENERATE QUEUE ──
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
          const rows = await conn.select().from(schema.economicModel)
            .where(eq(schema.economicModel.userId, ctx.user.id)).limit(1);
          return rows[0] ?? null;
        }
      },
    };

    const events = await generateEventQueue({ db: { query: queryProxy } }, ctx.user.id);

    // Only insert events that don't already exist (by sourceKey)
    const existing = await conn.select({ sourceKey: schema.calendarEvents.sourceKey })
      .from(schema.calendarEvents)
      .where(eq(schema.calendarEvents.userId, ctx.user.id));
    const existingKeys = new Set(existing.map(e => e.sourceKey));
    const newEvents = events.filter(e => e.sourceKey && !existingKeys.has(e.sourceKey));

    if (newEvents.length > 0) {
      await conn.insert(schema.calendarEvents).values(newEvents as any);
    }

    return { generated: newEvents.length, total: events.length };
  }),

  // ── PUSH EVENT TO GOOGLE CALENDAR ──
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

      const auth = getGCalClient(settings.gcalAccessToken, settings.gcalRefreshToken ?? undefined);
      let calendarId = settings.gcalCalendarId;
      if (!calendarId) {
        calendarId = await createAsreCalendar(auth);
        await conn.update(schema.calendarSettings)
          .set({ gcalCalendarId: calendarId })
          .where(eq(schema.calendarSettings.userId, ctx.user.id));
      }

      const startTime = event.suggestedStartTime ?? '09:00';
      const startDate = new Date(`${event.suggestedDate}T${startTime}:00`);
      const endDate = addMinutes(startDate, event.durationMinutes ?? 60);

      const gcalId = await insertGCalEvent(auth, {
        calendarId: calendarId!,
        title: event.title,
        description: event.description ?? '',
        colorId: event.gcalColorId ?? '1',
        remindMinutesBefore: event.remindMinutesBefore ?? 30,
        isAllDay: !event.suggestedStartTime,
        date: !event.suggestedStartTime ? event.suggestedDate ?? undefined : undefined,
        startDateTime: event.suggestedStartTime ? startDate.toISOString() : undefined,
        endDateTime: event.suggestedStartTime ? endDate.toISOString() : undefined,
        recurrenceRule: event.recurrenceRule ?? undefined,
        extendedProperties: { private: { asreEventId: String(event.id), sourceKey: event.sourceKey ?? '' } },
      });

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

  // ── PUSH ALL PENDING ──
  pushAll: protectedProcedure.mutation(async ({ ctx }) => {
    const conn = await requireDb();
    const [settings] = await conn.select().from(schema.calendarSettings)
      .where(eq(schema.calendarSettings.userId, ctx.user.id)).limit(1);
    if (!settings?.gcalAccessToken) throw new Error('Google Calendar not connected');

    const pending = await conn.select().from(schema.calendarEvents)
      .where(and(eq(schema.calendarEvents.userId, ctx.user.id), eq(schema.calendarEvents.status, 'pending')));

    let pushed = 0;
    let failed = 0;
    const auth = getGCalClient(settings.gcalAccessToken, settings.gcalRefreshToken ?? undefined);
    let calendarId = settings.gcalCalendarId;
    if (!calendarId) {
      calendarId = await createAsreCalendar(auth);
      await conn.update(schema.calendarSettings)
        .set({ gcalCalendarId: calendarId })
        .where(eq(schema.calendarSettings.userId, ctx.user.id));
    }

    for (const event of pending) {
      try {
        const startTime = event.suggestedStartTime ?? '09:00';
        const startDate = new Date(`${event.suggestedDate}T${startTime}:00`);
        const endDate = addMinutes(startDate, event.durationMinutes ?? 60);

        const gcalId = await insertGCalEvent(auth, {
          calendarId: calendarId!,
          title: event.title,
          description: event.description ?? '',
          colorId: event.gcalColorId ?? '1',
          remindMinutesBefore: event.remindMinutesBefore ?? 30,
          isAllDay: !event.suggestedStartTime,
          date: !event.suggestedStartTime ? event.suggestedDate ?? undefined : undefined,
          startDateTime: event.suggestedStartTime ? startDate.toISOString() : undefined,
          endDateTime: event.suggestedStartTime ? endDate.toISOString() : undefined,
          recurrenceRule: event.recurrenceRule ?? undefined,
        });

        await conn.update(schema.calendarEvents)
          .set({ status: 'pushed', gcalEventId: gcalId, gcalCalendarId: calendarId, pushedAt: new Date() })
          .where(eq(schema.calendarEvents.id, event.id));
        pushed++;
      } catch {
        failed++;
      }
    }

    return { pushed, failed };
  }),
});
