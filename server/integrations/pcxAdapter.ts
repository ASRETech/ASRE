/**
 * PCx Data Adapter — Port-Ready Integration Layer
 *
 * Shapes ASRE agent data into the format PCx Business Dashboard expects.
 * Today: Powers ASRE's own Coach Roster view.
 * Future: Drives POST to PCx API when integration is live.
 *
 * DO NOT add live PCx API calls here until an official API key is obtained.
 * DO NOT auto-populate pcxAgentId — it is always manually entered by the coach.
 *
 * Sprint D Group 3: Added heartbeatStatus, actionsThisWeek, pulseSubmittedThisWeek
 */

import * as db from '../db';
import { getStreakData } from '../domains/execution/executionService';
import { computeWealthHealthScore } from '../wealth/wealthUtils';
import { getDb } from '../db';
import * as schema from '../../drizzle/schema';
import { eq, and, gte, count } from 'drizzle-orm';

// ── Helper ────────────────────────────────────────────────────────────────────

function isThisYear(dateStr: string): boolean {
  const year = new Date().getFullYear();
  return dateStr.startsWith(String(year));
}

// ── Heartbeat helpers ─────────────────────────────────────────────────────────

function currentWeekStartStr(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  return monday.toISOString().split('T')[0];
}

type HeartbeatStatus = 'active' | 'light' | 'inactive' | 'dark';

function computeHeartbeat(
  actionsThisWeek: number,
  pulseSubmittedThisWeek: boolean,
  lastLoginAt: Date | null
): HeartbeatStatus {
  const daysSinceLogin = lastLoginAt
    ? (Date.now() - new Date(lastLoginAt).getTime()) / (1000 * 60 * 60 * 24)
    : 999;
  if (actionsThisWeek >= 3 && pulseSubmittedThisWeek) return 'active';
  if (actionsThisWeek >= 1 || pulseSubmittedThisWeek) return 'light';
  if (daysSinceLogin <= 7) return 'inactive';
  return 'dark';
}

// ── PCx-compatible snapshot interface ─────────────────────────────────────────

export interface PCxAgentSnapshot {
  // Identity
  asreUserId: number;
  pcxAgentId: string | null;
  agentName: string;
  marketCenter: string;
  enrollmentDate: string | null;
  programPhase: string | null;

  // Activity metrics (maps to PCx "Weekly Activities" section)
  weeklyContacts: number;
  weeklyAppointments: number;
  weeklyListings: number;
  weeklyClosings: number;

  // Production (maps to PCx "Production Results" section)
  gciYTD: number;
  closingsYTD: number;
  incomeGoal: number;
  goalPacePercent: number; // gciYTD / incomeGoal * 100

  // Business plan progress (maps to PCx "Goals & Business Plan")
  mrealLevel: number;
  deliverablesPct: number;   // % of current-level deliverables complete
  hasBusinessPlan: boolean;  // l4_annual_business_plan deliverable done
  hasFourOneOne: boolean;    // l3_411_plan deliverable done
  has90DaySprint: boolean;   // l3_90day_sprint deliverable done

  // Execution score (ASRE-native, enriches PCx view)
  executionScore: number;
  currentStreak: number;
  longestStreak: number;

  // Session readiness (ASRE data for pre-brief)
  lastWeeklyPulseDate: string | null;
  wealthHealthScore: number | null;
  lastSessionDate: string | null;

  // Activity heartbeat (Sprint D Group 3)
  actionsThisWeek: number;
  pulseSubmittedThisWeek: boolean;
  heartbeatStatus: HeartbeatStatus;

  // Sync metadata
  snapshotGeneratedAt: string; // ISO timestamp
  pcxSyncEnabled: boolean;
}

// ── Snapshot builder ──────────────────────────────────────────────────────────

export async function buildPCxAgentSnapshot(
  userId: number
): Promise<PCxAgentSnapshot> {
  const weekStart = currentWeekStartStr();

  // Fetch all data in parallel — no sequential waterfalls
  const [
    profile,
    deliverables,
    weeklyPulses,
    financials,
    streakData,
    wealthMilestones,
    agentSessions,
    userRow,
  ] = await Promise.all([
    db.getAgentProfile(userId),
    db.getUserDeliverables(userId),
    db.getWeeklyPulses(userId, 1),       // latest pulse only
    db.getUserFinancials(userId),
    getStreakData(userId),
    db.getWealthMilestones(userId),
    db.getAgentSessions(userId, 1),      // latest session only
    // Fetch lastSignedIn from users table for heartbeat
    (async () => {
      const conn = await getDb();
      if (!conn) return null;
      const rows = await conn
        .select({ lastSignedIn: schema.users.lastSignedIn })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);
      return rows[0] ?? null;
    })(),
  ]);

  // ── Heartbeat: actionsThisWeek ─────────────────────────────────────────────
  let actionsThisWeek = 0;
  let pulseSubmittedThisWeek = false;
  try {
    const conn = await getDb();
    if (conn) {
      // Count action completions since Monday of current week
      const mondayDate = new Date(weekStart + 'T00:00:00.000Z');
      const [actionCountRow, pulseRow] = await Promise.all([
        conn
          .select({ cnt: count() })
          .from(schema.executionActionCompletions)
          .where(
            and(
              eq(schema.executionActionCompletions.userId, userId),
              gte(schema.executionActionCompletions.completedAt, mondayDate)
            )
          ),
        conn
          .select({ id: schema.executionWeeklyStats.id })
          .from(schema.executionWeeklyStats)
          .where(
            and(
              eq(schema.executionWeeklyStats.userId, userId),
              eq(schema.executionWeeklyStats.weekStart, weekStart)
            )
          )
          .limit(1),
      ]);
      actionsThisWeek = actionCountRow[0]?.cnt ?? 0;
      pulseSubmittedThisWeek = pulseRow.length > 0;
    }
  } catch (err) {
    console.error(`[pcxAdapter] Heartbeat query failed for userId=${userId}:`, err);
  }

  const lastLoginAt = userRow?.lastSignedIn ? new Date(userRow.lastSignedIn) : null;
  const heartbeatStatus = computeHeartbeat(actionsThisWeek, pulseSubmittedThisWeek, lastLoginAt);

  // ── Deliverables progress ──────────────────────────────────────────────────
  const currentLevel = profile?.currentLevel ?? 1;
  const levelDeliverables = deliverables.filter(d => d.level === currentLevel);
  const completedLevelDels = levelDeliverables.filter(d => d.isComplete);
  const deliverablesPct = levelDeliverables.length > 0
    ? Math.round((completedLevelDels.length / levelDeliverables.length) * 100)
    : 0;

  // ── GCI YTD from financial entries ────────────────────────────────────────
  const gciYTD = financials
    .filter(f => f.type === 'income' && isThisYear(f.date))
    .reduce((sum, f) => sum + (f.amount ?? 0), 0);

  // closingsYTD: deferred until transactions module matures
  const closingsYTD = 0;

  const incomeGoal = profile?.incomeGoal ?? 0;
  const goalPacePercent = incomeGoal > 0
    ? Math.round((gciYTD / incomeGoal) * 100)
    : 0;

  // ── Wealth health score ────────────────────────────────────────────────────
  const wealthScore = wealthMilestones.length > 0
    ? computeWealthHealthScore(wealthMilestones)
    : null;

  // ── Latest weekly pulse ────────────────────────────────────────────────────
  const latestPulse = weeklyPulses[0] ?? null;

  // ── Latest session ─────────────────────────────────────────────────────────
  const lastSession = agentSessions[0] ?? null;

  return {
    asreUserId: userId,
    pcxAgentId: (profile as any)?.pcxAgentId ?? null,
    agentName: profile?.name ?? 'Unknown Agent',
    marketCenter: profile?.marketCenter ?? '',
    enrollmentDate: (profile as any)?.pcxEnrollmentDate
      ? new Date((profile as any).pcxEnrollmentDate).toISOString().slice(0, 10)
      : null,
    programPhase: (profile as any)?.pcxProgramPhase ?? null,

    weeklyContacts: latestPulse?.contactsMade ?? 0,
    weeklyAppointments: latestPulse?.appointmentsSet ?? 0,
    weeklyListings: latestPulse?.listingAgreements ?? 0,
    weeklyClosings: latestPulse?.closings ?? 0,

    gciYTD,
    closingsYTD,
    incomeGoal,
    goalPacePercent,

    mrealLevel: currentLevel,
    deliverablesPct,
    hasBusinessPlan: deliverables.some(
      d => d.deliverableId === 'l4_annual_business_plan' && d.isComplete
    ),
    hasFourOneOne: deliverables.some(
      d => d.deliverableId === 'l3_411_plan' && d.isComplete
    ),
    has90DaySprint: deliverables.some(
      d => d.deliverableId === 'l3_90day_sprint' && d.isComplete
    ),

    executionScore: streakData.currentStreak, // proxy until execution score model matures
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,

    lastWeeklyPulseDate: latestPulse?.createdAt
      ? new Date(latestPulse.createdAt).toISOString().slice(0, 10)
      : null,
    wealthHealthScore: wealthScore,
    lastSessionDate: lastSession?.scheduledAt
      ? new Date(lastSession.scheduledAt).toISOString().slice(0, 10)
      : null,

    actionsThisWeek,
    pulseSubmittedThisWeek,
    heartbeatStatus,

    snapshotGeneratedAt: new Date().toISOString(),
    pcxSyncEnabled: (profile as any)?.pcxSyncEnabled ?? false,
  };
}
