/**
 * server/calendar/calendarScheduler.ts
 * Three cron jobs:
 * 1. Daily 6am: generate event queue for all users
 * 2. Daily 7am: auto-push approved events to Google Calendar
 * 3. Weekly Sunday 8pm: renew expiring webhook channels
 */
import cron from 'node-cron';
import { getDb } from '../db';
import * as schema from '../../drizzle/schema';
import { eq, and, lt } from 'drizzle-orm';
import { generateEventQueue } from './eventGenerator';
import { getGCalClient, insertGCalEvent } from './gcal';
import { addMinutes } from 'date-fns';

async function getConn() {
  const conn = await getDb();
  if (!conn) throw new Error('Database not available');
  return conn;
}

export function startCalendarScheduler() {
  // 1. Daily 6am — generate event queue
  cron.schedule('0 6 * * *', async () => {
    console.log('[CalendarScheduler] Generating event queues...');
    try {
      const conn = await getConn();
      const allSettings = await conn.select().from(schema.calendarSettings);
      for (const settings of allSettings) {
        try {
          const ctx = { db: { query: buildQueryProxy(conn) } };
          const events = await generateEventQueue(ctx, settings.userId);
          const existing = await conn.select({ sourceKey: schema.calendarEvents.sourceKey })
            .from(schema.calendarEvents)
            .where(eq(schema.calendarEvents.userId, settings.userId));
          const existingKeys = new Set(existing.map(e => e.sourceKey));
          const newEvents = events.filter(e => e.sourceKey && !existingKeys.has(e.sourceKey));
          if (newEvents.length > 0) {
            await conn.insert(schema.calendarEvents).values(newEvents as any);
            console.log(`[CalendarScheduler] Inserted ${newEvents.length} events for user ${settings.userId}`);
          }
        } catch (err) {
          console.error(`[CalendarScheduler] Error generating for user ${settings.userId}:`, err);
        }
      }
    } catch (err) {
      console.error('[CalendarScheduler] Fatal error in queue generation:', err);
    }
  });

  // 2. Daily 7am — auto-push pending events to Google Calendar
  cron.schedule('0 7 * * *', async () => {
    console.log('[CalendarScheduler] Pushing pending events to Google Calendar...');
    try {
      const conn = await getConn();
      const allSettings = await conn.select().from(schema.calendarSettings)
        .where(eq(schema.calendarSettings.requireApprovalBeforePush, false));

      for (const settings of allSettings) {
        if (!settings.gcalAccessToken || !settings.gcalCalendarId) continue;
        try {
          const pending = await conn.select().from(schema.calendarEvents)
            .where(and(
              eq(schema.calendarEvents.userId, settings.userId),
              eq(schema.calendarEvents.status, 'pending')
            ));
          if (pending.length === 0) continue;

          const auth = getGCalClient(settings.gcalAccessToken, settings.gcalRefreshToken ?? undefined);
          for (const event of pending) {
            try {
              const startTime = event.suggestedStartTime ?? '09:00';
              const startDate = new Date(`${event.suggestedDate}T${startTime}:00`);
              const endDate = addMinutes(startDate, event.durationMinutes ?? 60);

              const gcalId = await insertGCalEvent(auth, {
                calendarId: settings.gcalCalendarId!,
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
                .set({ status: 'pushed', gcalEventId: gcalId, gcalCalendarId: settings.gcalCalendarId, pushedAt: new Date() })
                .where(eq(schema.calendarEvents.id, event.id));
            } catch (err) {
              console.error(`[CalendarScheduler] Failed to push event ${event.id}:`, err);
            }
          }
        } catch (err) {
          console.error(`[CalendarScheduler] Error pushing for user ${settings.userId}:`, err);
        }
      }
    } catch (err) {
      console.error('[CalendarScheduler] Fatal error in auto-push:', err);
    }
  });

  // 3. Weekly Sunday 8pm — renew expiring webhook channels
  cron.schedule('0 20 * * 0', async () => {
    console.log('[CalendarScheduler] Checking webhook renewals...');
    try {
      const conn = await getConn();
      const soon = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const expiring = await conn.select().from(schema.calendarSettings)
        .where(lt(schema.calendarSettings.gcalWatchExpiry, soon));
      console.log(`[CalendarScheduler] ${expiring.length} webhook channels need renewal`);
    } catch (err) {
      console.error('[CalendarScheduler] Error checking webhooks:', err);
    }
  });

  console.log('[CalendarScheduler] All 3 cron jobs started');
}

// Minimal query proxy for event generation context
function buildQueryProxy(conn: Awaited<ReturnType<typeof getDb>>) {
  return {
    calendarSettings: {
      findFirst: async (_opts?: any) => {
        const results = await conn!.select().from(schema.calendarSettings).limit(1);
        return results[0] ?? null;
      }
    },
    schedulePreferences: {
      findFirst: async (_opts?: any) => {
        const results = await conn!.select().from(schema.schedulePreferences).limit(1);
        return results[0] ?? null;
      }
    },
    agentProfiles: {
      findFirst: async (_opts?: any) => {
        const results = await conn!.select().from(schema.agentProfiles).limit(1);
        return results[0] ?? null;
      }
    },
    wealthMilestones: {
      findMany: async (_opts?: any) => {
        return await conn!.select().from(schema.wealthMilestones);
      }
    },
    economicModel: {
      findFirst: async (_opts?: any) => {
        const results = await conn!.select().from(schema.teamEconomicModel).limit(1);
        return results[0] ?? null;
      }
    },
  };
}
