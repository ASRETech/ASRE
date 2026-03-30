/**
 * PCx Data Adapter — Port-Ready Integration Layer
 *
 * Shapes ASRE agent data into the format PCx Business Dashboard expects.
 * Today: Powers ASRE's own Coach Roster view.
 * Future: Drives POST to PCx API when integration is live.
 *
 * DO NOT add live PCx API calls here until an official API key is obtained.
 * DO NOT auto-populate pcxAgentId — it is always manually entered by the coach.
 */

import * as db from '../db';
import { getStreakData } from '../domains/execution/executionService';
import { computeWealthHealthScore } from '../wealth/wealthUtils';

// ── Helper ────────────────────────────────────────────────────────────────────

function isThisYear(dateStr: string): boolean {
  const year = new Date().getFullYear();
  return dateStr.startsWith(String(year));
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

  // Sync metadata
  snapshotGeneratedAt: string; // ISO timestamp
  pcxSyncEnabled: boolean;
}

// ── Snapshot builder ──────────────────────────────────────────────────────────

export async function buildPCxAgentSnapshot(
  userId: number
): Promise<PCxAgentSnapshot> {
  // Fetch all data in parallel — no sequential waterfalls
  const [
    profile,
    deliverables,
    weeklyPulses,
    financials,
    streakData,
    wealthMilestones,
    agentSessions,
  ] = await Promise.all([
    db.getAgentProfile(userId),
    db.getUserDeliverables(userId),
    db.getWeeklyPulses(userId, 1),       // latest pulse only
    db.getUserFinancials(userId),
    getStreakData(userId),
    db.getWealthMilestones(userId),
    db.getAgentSessions(userId, 1),      // latest session only
  ]);

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

    snapshotGeneratedAt: new Date().toISOString(),
    pcxSyncEnabled: (profile as any)?.pcxSyncEnabled ?? false,
  };
}
