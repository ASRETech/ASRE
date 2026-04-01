/**
 * server/calendar/gcal.ts
 * Google Calendar API wrapper for ASRE Action Engine
 */
import { google, Auth } from 'googleapis';
import { ENV } from '../_core/env';

export function getGCalClient(accessToken: string, refreshToken?: string): Auth.OAuth2Client {
  const auth = new google.auth.OAuth2(
    ENV.googleClientId,
    ENV.googleClientSecret,
    ENV.googleRedirectUri
  );
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return auth;
}

export async function createAsreCalendar(auth: Auth.OAuth2Client): Promise<string> {
  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.calendars.insert({
    requestBody: {
      summary: '📅 ASRE — Action Engine',
      description: 'Auto-managed calendar by Applied Strategy Real Estate (ASRE). Contains lead gen blocks, financial deadlines, wealth milestones, and MREA deliverables.',
      timeZone: 'America/New_York',
    },
  });
  return res.data.id!;
}

export interface GCalEventInput {
  calendarId: string;
  title: string;
  description?: string;
  colorId?: string;
  remindMinutesBefore?: number;
  isAllDay?: boolean;
  date?: string; // yyyy-MM-dd for all-day
  startDateTime?: string; // ISO for timed events
  endDateTime?: string;
  recurrenceRule?: string;
  timezone?: string; // LOW-04: User's timezone (e.g. 'America/New_York')
  extendedProperties?: {
    private?: Record<string, string>;
  };
}

export async function insertGCalEvent(auth: Auth.OAuth2Client, input: GCalEventInput): Promise<string> {
  const calendar = google.calendar({ version: 'v3', auth });

  const event: any = {
    summary: input.title,
    description: input.description ?? '',
    colorId: input.colorId ?? '1',
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup', minutes: input.remindMinutesBefore ?? 30 }],
    },
    extendedProperties: input.extendedProperties,
  };

  if (input.isAllDay && input.date) {
    event.start = { date: input.date };
    event.end = { date: input.date };
  } else {
    // LOW-04: Use user's configured timezone, fallback to America/New_York
    const tz = input.timezone ?? 'America/New_York';
    event.start = { dateTime: input.startDateTime, timeZone: tz };
    event.end = { dateTime: input.endDateTime, timeZone: tz };
  }

  if (input.recurrenceRule) {
    event.recurrence = [input.recurrenceRule];
  }

  const res = await calendar.events.insert({
    calendarId: input.calendarId,
    requestBody: event,
  });

  return res.data.id!;
}

export async function markGCalEventComplete(auth: Auth.OAuth2Client, calendarId: string, gcalEventId: string): Promise<void> {
  const calendar = google.calendar({ version: 'v3', auth });
  await calendar.events.patch({
    calendarId,
    eventId: gcalEventId,
    requestBody: {
      colorId: '8', // graphite = done
      summary: `✅ ${(await calendar.events.get({ calendarId, eventId: gcalEventId })).data.summary}`,
    },
  });
}

export async function deleteGCalEvent(auth: Auth.OAuth2Client, calendarId: string, gcalEventId: string): Promise<void> {
  const calendar = google.calendar({ version: 'v3', auth });
  await calendar.events.delete({ calendarId, eventId: gcalEventId });
}

export async function checkCalendarScope(accessToken: string, refreshToken?: string): Promise<boolean> {
  try {
    const auth = getGCalClient(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.calendarList.list({ maxResults: 1 });
    return true;
  } catch {
    return false;
  }
}

export async function registerCalendarWebhook(
  auth: Auth.OAuth2Client,
  calendarId: string,
  channelId: string,
  webhookUrl: string
): Promise<{ expiry: Date }> {
  const calendar = google.calendar({ version: 'v3', auth });
  const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await calendar.events.watch({
    calendarId,
    requestBody: {
      id: channelId,
      type: 'web_hook',
      address: webhookUrl,
      expiration: String(expiry.getTime()),
    },
  });
  return { expiry };
}
