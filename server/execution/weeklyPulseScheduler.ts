/**
 * server/execution/weeklyPulseScheduler.ts — Sprint D Group 2
 *
 * Sends a weekly pulse reminder email every Sunday at 8:00 PM (server time)
 * to all active users who have NOT yet submitted their Weekly Pulse for the
 * current week.
 *
 * Design decisions:
 *   - "Active" = signed in within the last 30 days (users.lastSignedIn)
 *   - "Submitted" = has a row in executionWeeklyStats with weekStart = current Monday
 *   - Sends via Resend (ENV.resendApiKey)
 *   - Graceful: if Resend key is missing, logs a warning and skips
 *   - Per-user errors are caught individually so one failure doesn't block others
 *   - Runs weekly (Sunday 20:00) — low volume, no rate-limit concern
 */

import cron from 'node-cron';
import { Resend } from 'resend';
import { getDb } from '../db';
import * as schema from '../../drizzle/schema';
import { eq, and, gte, notInArray } from 'drizzle-orm';
import { ENV } from '../_core/env';

// Get the Monday of the current UTC week (YYYY-MM-DD)
function currentWeekStart(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  return monday.toISOString().split('T')[0];
}

// 30 days ago as a Date
function thirtyDaysAgo(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d;
}

async function sendWeeklyPulseReminders(): Promise<void> {
  console.log('[WeeklyPulse] Running reminder job...');

  if (!ENV.resendApiKey) {
    console.warn('[WeeklyPulse] RESEND_API_KEY not set — skipping email send');
    return;
  }

  const conn = await getDb();
  if (!conn) {
    console.warn('[WeeklyPulse] Database not available — skipping');
    return;
  }

  const weekStart = currentWeekStart();
  const cutoff = thirtyDaysAgo();

  // 1. Get all active users (signed in within 30 days) who have an email
  const activeUsers = await conn
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
    })
    .from(schema.users)
    .where(
      and(
        gte(schema.users.lastSignedIn, cutoff),
      )
    );

  if (activeUsers.length === 0) {
    console.log('[WeeklyPulse] No active users found — skipping');
    return;
  }

  // 2. Get user IDs who have already submitted this week's pulse
  const submittedUserIds = await conn
    .select({ userId: schema.executionWeeklyStats.userId })
    .from(schema.executionWeeklyStats)
    .where(eq(schema.executionWeeklyStats.weekStart, weekStart));

  const submittedSet = new Set(submittedUserIds.map((r) => r.userId));

  // 3. Filter to users who have NOT submitted and have an email
  const toNotify = activeUsers.filter(
    (u) => u.email && !submittedSet.has(u.id)
  );

  if (toNotify.length === 0) {
    console.log('[WeeklyPulse] All active users have submitted — no emails to send');
    return;
  }

  console.log(`[WeeklyPulse] Sending reminders to ${toNotify.length} users...`);

  const resend = new Resend(ENV.resendApiKey);
  const appUrl = ENV.appUrl || 'https://asre-production.up.railway.app';

  let sent = 0;
  let failed = 0;

  for (const user of toNotify) {
    if (!user.email) continue;
    const firstName = user.name?.split(' ')[0] ?? 'Agent';
    try {
      await resend.emails.send({
        from: 'ASRE <noreply@asre.ai>',
        to: user.email,
        subject: `Log your Weekly Pulse — ${weekStart}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Weekly Pulse Reminder</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#1a1d27;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#DC143C;padding:20px 32px;">
              <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:0.05em;">ASRE</span>
              <span style="color:rgba(255,255,255,0.6);font-size:11px;font-weight:400;letter-spacing:0.12em;margin-left:8px;text-transform:uppercase;">Execution OS</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="color:#e2e8f0;font-size:16px;margin:0 0 8px;">Hi ${firstName},</p>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
                You haven't logged your Weekly Pulse yet for the week of <strong style="color:#e2e8f0;">${weekStart}</strong>.
                Logging your numbers takes less than 60 seconds and keeps your GCI pace and coaching data accurate.
              </p>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#DC143C;border-radius:8px;">
                    <a href="${appUrl}/execution"
                       style="display:inline-block;padding:12px 28px;color:#fff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.02em;">
                      Log Weekly Pulse →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#475569;font-size:12px;line-height:1.5;margin:0;">
                This reminder is sent every Sunday evening to agents who haven't yet submitted their weekly numbers.
                You can disable this in Settings → Notifications.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="color:#334155;font-size:11px;margin:0;">
                Applied Strategy Real Estate &bull; Cincinnati–Dayton, OH
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `.trim(),
      });
      sent++;
    } catch (err) {
      console.error(`[WeeklyPulse] Failed to send to userId=${user.id} (${user.email}):`, err);
      failed++;
    }
  }

  console.log(`[WeeklyPulse] Done — sent: ${sent}, failed: ${failed}`);
}

export function startWeeklyPulseScheduler(): void {
  // Every Sunday at 8:00 PM server time
  cron.schedule('0 20 * * 0', () => {
    sendWeeklyPulseReminders().catch((err) =>
      console.error('[WeeklyPulse] Unhandled scheduler error:', err)
    );
  });
  console.log('[WeeklyPulse] Scheduler registered — fires every Sunday at 20:00');
}
