/**
 * server/domains/execution/executionService.ts
 *
 * Core execution service: scoring, action recommendations, streak logic.
 * This is the behavior layer — NOT a CRM. Source of truth is the DB.
 */

import { getDb } from '../../db';
import * as schema from '../../../drizzle/schema';
import { eq, and, desc, sql, gte, lt, inArray } from 'drizzle-orm';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface ExecutionAction {
  id: string;
  type: 'call' | 'follow_up' | 'appointment' | 'lead_gen' | 'contract' | 'review_request' | 'custom';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  points: number;
  completed?: boolean;
  completedAt?: Date | null;
}

export interface ExecutionSummary {
  score: number;
  actions: ExecutionAction[];
  currentStreak: number;
  longestStreak: number;
  completedActionsToday: number;
  qualifiesForStreakToday: boolean;
  leaderboard: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  userId: number;
  name: string;
  score: number;
  currentStreak: number;
  rank: number;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

// DATE STRATEGY: All date logic uses UTC to ensure consistency
// regardless of Railway server timezone. todayDateString() returns
// the UTC date (YYYY-MM-DD). todayRange() returns UTC midnight
// boundaries that exactly match the stored completionDate strings.
function todayDateString(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD UTC
}

function yesterdayDateString(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1); // UTC-safe: avoids DST/timezone drift
  return d.toISOString().split('T')[0];
}

function todayRange(): { start: Date; end: Date } {
  const today = todayDateString(); // UTC date string
  return {
    start: new Date(today + 'T00:00:00.000Z'), // UTC midnight
    end: new Date(today + 'T23:59:59.999Z'),   // UTC end of day
  };
}

async function requireDb() {
  const conn = await getDb();
  if (!conn) throw new Error('Database not available');
  return conn;
}

// ─────────────────────────────────────────────────────────────
// SCORING
// ─────────────────────────────────────────────────────────────

export async function computeExecutionScore(userId: number): Promise<number> {
  const conn = await requireDb();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const completions = await conn
    .select({ points: schema.executionActionCompletions.points })
    .from(schema.executionActionCompletions)
    .where(
      and(
        eq(schema.executionActionCompletions.userId, userId),
        gte(schema.executionActionCompletions.completedAt, thirtyDaysAgo)
      )
    );

  const baseScore = completions.reduce((sum, c) => sum + (c.points ?? 10), 0);

  // Apply streak multiplier (up to 1.5x at 30-day streak)
  const streak = await getStreakData(userId);
  const multiplier = Math.min(1 + streak.currentStreak * 0.017, 1.5);

  return Math.round(baseScore * multiplier);
}

// ─────────────────────────────────────────────────────────────
// ACTION ENGINE
// ─────────────────────────────────────────────────────────────

export async function getRecommendedActions(userId: number): Promise<ExecutionAction[]> {
  const conn = await requireDb();
  const { start: todayStart, end: todayEnd } = todayRange();

  // Get today's completions to mark which actions are done
  const todayCompletions = await conn
    .select({ actionId: schema.executionActionCompletions.actionId })
    .from(schema.executionActionCompletions)
    .where(
      and(
        eq(schema.executionActionCompletions.userId, userId),
        gte(schema.executionActionCompletions.completedAt, todayStart),
        lt(schema.executionActionCompletions.completedAt, todayEnd)
      )
    );

  const completedIds = new Set(todayCompletions.map((c) => c.actionId));

  // Get pipeline context for contextual actions
  let activeLeads = 0;
  let followUpsDue = 0;
  let appointmentsThisWeek = 0;

  try {
    const leads = await conn
      .select({
        stage: schema.leads.stage,
        updatedAt: schema.leads.updatedAt,
      })
      .from(schema.leads)
      .where(eq(schema.leads.userId, userId));

    activeLeads = leads.filter(
      (l) => l.stage !== 'Closed' && l.stage !== 'Dead'
    ).length;

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    followUpsDue = leads.filter(
      (l) =>
        l.stage !== 'Closed' &&
        l.stage !== 'Dead' &&
        new Date(l.updatedAt) < threeDaysAgo
    ).length;
  } catch {
    // Pipeline data unavailable — use defaults
  }

  // Build prioritized action list based on context
  const actions: ExecutionAction[] = [];

  // ── HIGH PRIORITY ──

  // Lead gen is always #1 — the core revenue activity
  actions.push({
    id: 'daily_lead_gen',
    type: 'lead_gen',
    title: 'Complete Daily Lead Gen Block',
    description:
      'Make 5+ contacts — calls, texts, or door knocks. This is your #1 revenue-producing activity. No excuses.',
    priority: 'high',
    points: 30,
    completed: completedIds.has('daily_lead_gen'),
  });

  // Follow-ups are high priority if there are overdue leads
  if (followUpsDue > 0) {
    actions.push({
      id: 'follow_up_overdue',
      type: 'follow_up',
      title: `Follow Up with ${followUpsDue} Overdue Lead${followUpsDue > 1 ? 's' : ''}`,
      description: `${followUpsDue} lead${followUpsDue > 1 ? 's haven\'t' : ' hasn\'t'} been touched in 3+ days. Speed-to-contact wins deals. Do this now.`,
      priority: 'high',
      points: 25,
      completed: completedIds.has('follow_up_overdue'),
    });
  }

  // Appointment setting is always high value
  actions.push({
    id: 'set_appointment',
    type: 'appointment',
    title: 'Set or Confirm an Appointment',
    description:
      'Buyer consultation, listing presentation, or strategy call. Appointments convert to contracts. One per day compounds.',
    priority: 'high',
    points: 20,
    completed: completedIds.has('set_appointment'),
  });

  // ── MEDIUM PRIORITY ──

  // Pipeline review if there are active leads
  if (activeLeads > 0) {
    actions.push({
      id: 'pipeline_review',
      type: 'follow_up',
      title: `Review Active Pipeline (${activeLeads} lead${activeLeads > 1 ? 's' : ''})`,
      description:
        'Audit each active lead — update stage, add notes, schedule next touch. A clean pipeline is a productive pipeline.',
      priority: 'medium',
      points: 15,
      completed: completedIds.has('pipeline_review'),
    });
  }

  // Review request — social proof compounds
  actions.push({
    id: 'review_request',
    type: 'review_request',
    title: 'Send a Google Review Request',
    description:
      'Ask a past client for a review. One review per week = 52 reviews per year. Social proof is your #1 free marketing asset.',
    priority: 'medium',
    points: 15,
    completed: completedIds.has('review_request'),
  });

  // ── LOW PRIORITY ──

  // Content / brand building
  actions.push({
    id: 'content_post',
    type: 'custom',
    title: 'Post Market Update or Value Content',
    description:
      'Share a market stat, tip, or listing on social. Consistent visibility builds brand equity. 15 minutes max.',
    priority: 'low',
    points: 10,
    completed: completedIds.has('content_post'),
  });

  // Schedule planning
  actions.push({
    id: 'schedule_tomorrow',
    type: 'custom',
    title: "Plan Tomorrow's Schedule",
    description:
      "Time-block tomorrow before EOD. Agents who plan execute 40% more consistently. 10 minutes tonight = 2 hours saved tomorrow.",
    priority: 'low',
    points: 10,
    completed: completedIds.has('schedule_tomorrow'),
  });

  // Sort: incomplete high → incomplete medium → incomplete low → completed
  return actions.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// ─────────────────────────────────────────────────────────────
// STREAK LOGIC
// ─────────────────────────────────────────────────────────────

export async function getStreakData(userId: number): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastQualifiedDate: string | null;
}> {
  const conn = await requireDb();

  const rows = await conn
    .select()
    .from(schema.executionStreaks)
    .where(eq(schema.executionStreaks.userId, userId))
    .limit(1);

  if (rows.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastQualifiedDate: null };
  }

  const row = rows[0];
  return {
    currentStreak: row.currentStreak,
    longestStreak: row.longestStreak,
    lastQualifiedDate: row.lastQualifiedDate ?? null,
  };
}

/**
 * Update streak after a qualifying day.
 * Rules:
 *   - First qualified day → streak = 1
 *   - Consecutive qualified day (yesterday was last) → +1
 *   - Missed day → reset to 1
 *   - Same day → no change (idempotent)
 */
export async function updateStreak(userId: number, qualifiedDate: string): Promise<void> {
  const conn = await requireDb();

  const rows = await conn
    .select()
    .from(schema.executionStreaks)
    .where(eq(schema.executionStreaks.userId, userId))
    .limit(1);

  if (rows.length === 0) {
    // First ever streak record
    await conn.insert(schema.executionStreaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastQualifiedDate: qualifiedDate,
      updatedAt: new Date(),
    });
    return;
  }

  const existing = rows[0];

  // Idempotent: same day already recorded
  if (existing.lastQualifiedDate === qualifiedDate) return;

  const yesterday = yesterdayDateString();
  const isConsecutive = existing.lastQualifiedDate === yesterday;

  const newStreak = isConsecutive ? existing.currentStreak + 1 : 1;
  const newLongest = Math.max(existing.longestStreak, newStreak);

  await conn
    .update(schema.executionStreaks)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastQualifiedDate: qualifiedDate,
      updatedAt: new Date(),
    })
    .where(eq(schema.executionStreaks.userId, userId));
}

// ─────────────────────────────────────────────────────────────
// COMPLETION LOGIC
// ─────────────────────────────────────────────────────────────

const QUALIFICATION_THRESHOLD = 3; // complete 3+ actions to qualify for streak

export async function completeAction(
  userId: number,
  actionId: string,
  actionType: string,
  points: number,
  metadata?: Record<string, unknown>
): Promise<{
  completedActionsToday: number;
  qualifiesForStreak: boolean;
  streakUpdated: boolean;
  alreadyCompleted?: boolean;
}> {
  const conn = await requireDb();
  const today = todayDateString();
  const now = new Date();
  const { start: todayStart, end: todayEnd } = todayRange();

  // ── IDEMPOTENCY GUARD ──
  // Check if this action was already completed today (prevents exploit)
  const existing = await conn
    .select({ id: schema.executionActionCompletions.id })
    .from(schema.executionActionCompletions)
    .where(
      and(
        eq(schema.executionActionCompletions.userId, userId),
        eq(schema.executionActionCompletions.actionId, actionId),
        eq(schema.executionActionCompletions.completionDate, today)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Already completed — return current state without double-counting
    const todayRowsCheck = await conn
      .select({ count: sql<number>`count(*)` })
      .from(schema.executionActionCompletions)
      .where(
        and(
          eq(schema.executionActionCompletions.userId, userId),
          gte(schema.executionActionCompletions.completedAt, todayStart),
          lt(schema.executionActionCompletions.completedAt, todayEnd)
        )
      );
    const completedActionsToday = Number(todayRowsCheck[0]?.count ?? 0);
    return {
      completedActionsToday,
      qualifiesForStreak: completedActionsToday >= QUALIFICATION_THRESHOLD,
      streakUpdated: false,
      alreadyCompleted: true,
    };
  }

  // Save completion record (completionDate stored for idempotency index)
  await conn.insert(schema.executionActionCompletions).values({
    userId,
    actionId,
    actionType,
    points,
    completionDate: today,
    completedAt: now,
    metadata: metadata ?? null,
  });

  // Count today's completions
  const todayRows = await conn
    .select({ count: sql<number>`count(*)` })
    .from(schema.executionActionCompletions)
    .where(
      and(
        eq(schema.executionActionCompletions.userId, userId),
        gte(schema.executionActionCompletions.completedAt, todayStart),
        lt(schema.executionActionCompletions.completedAt, todayEnd)
      )
    );

  const completedActionsToday = Number(todayRows[0]?.count ?? 0);
  const qualifiesForStreak = completedActionsToday >= QUALIFICATION_THRESHOLD;

  // Upsert daily stats
  const existingStats = await conn
    .select({ id: schema.executionDailyStats.id })
    .from(schema.executionDailyStats)
    .where(
      and(
        eq(schema.executionDailyStats.userId, userId),
        eq(schema.executionDailyStats.date, today)
      )
    )
    .limit(1);

  if (existingStats.length === 0) {
    await conn.insert(schema.executionDailyStats).values({
      userId,
      date: today,
      actionsCompleted: completedActionsToday,
      qualifiedDay: qualifiesForStreak,
      scoreAtClose: null,
    });
  } else {
    await conn
      .update(schema.executionDailyStats)
      .set({
        actionsCompleted: completedActionsToday,
        qualifiedDay: qualifiesForStreak,
      })
      .where(
        and(
          eq(schema.executionDailyStats.userId, userId),
          eq(schema.executionDailyStats.date, today)
        )
      );
  }

  // Update streak if day qualifies
  let streakUpdated = false;
  if (qualifiesForStreak) {
    await updateStreak(userId, today);
    streakUpdated = true;
  }

  return { completedActionsToday, qualifiesForStreak, streakUpdated };
}

// ─────────────────────────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────────────────────────

/**
 * Leaderboard scope options:
 *   "global"        — all users (Phase 1, default)
 *   "cohort"        — users in same coaching cohort (Phase 2)
 *   "team"          — users on same team (Phase 2)
 *   "market_center" — users in same market center (Phase 2)
 *
 * Phase 2 scopes are structurally supported but fall back to global
 * until the corresponding user-grouping tables are implemented.
 */
export type LeaderboardScope = 'global' | 'cohort' | 'team' | 'market_center';

export async function getLeaderboard(
  currentUserId: number,
  scope: LeaderboardScope = 'global'
): Promise<LeaderboardEntry[]> {
  const conn = await requireDb();

  // Phase 2: scope-based user filtering (placeholder — falls back to global)
  // When cohort/team/market_center tables exist, filter userIds here.
  // For now, all scopes use global leaderboard.
  const _ = { currentUserId, scope }; // suppress unused warning

  // Get top users by streak
  const streakRows = await conn
    .select({
      userId: schema.executionStreaks.userId,
      currentStreak: schema.executionStreaks.currentStreak,
    })
    .from(schema.executionStreaks)
    .orderBy(desc(schema.executionStreaks.currentStreak))
    .limit(20);

  if (streakRows.length === 0) return [];

  const userIds = streakRows.map((r) => r.userId);

  // Get names from agent profiles
  const profiles = await conn
    .select({
      userId: schema.agentProfiles.userId,
      name: schema.agentProfiles.name,
    })
    .from(schema.agentProfiles)
    .where(inArray(schema.agentProfiles.userId, userIds));

  // Compute 30-day scores for each user
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const scoreRows = await conn
    .select({
      userId: schema.executionActionCompletions.userId,
      totalPoints: sql<number>`COALESCE(SUM(${schema.executionActionCompletions.points}), 0)`,
    })
    .from(schema.executionActionCompletions)
    .where(
      and(
        inArray(schema.executionActionCompletions.userId, userIds),
        gte(schema.executionActionCompletions.completedAt, thirtyDaysAgo)
      )
    )
    .groupBy(schema.executionActionCompletions.userId);

  const profileMap = new Map(profiles.map((p) => [p.userId, p.name ?? 'Agent']));
  const scoreMap = new Map(scoreRows.map((s) => [s.userId, Number(s.totalPoints)]));

  const entries: LeaderboardEntry[] = streakRows.map((row) => ({
    userId: row.userId,
    name: profileMap.get(row.userId) ?? 'Agent',
    score: scoreMap.get(row.userId) ?? 0,
    currentStreak: row.currentStreak,
    rank: 0, // assigned below
  }));

  // Sort by score desc, streak as tiebreaker
  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.currentStreak - a.currentStreak;
  });

  // Assign ranks
  entries.forEach((e, i) => {
    e.rank = i + 1;
  });

  return entries;
}

// ─────────────────────────────────────────────────────────────
// FULL SUMMARY
// ─────────────────────────────────────────────────────────────

export async function getExecutionSummary(userId: number): Promise<ExecutionSummary> {
  const { start: todayStart, end: todayEnd } = todayRange();
  const conn = await requireDb();

  const [score, actions, streakData, todayRows, leaderboard] = await Promise.all([
    computeExecutionScore(userId),
    getRecommendedActions(userId),
    getStreakData(userId),
    conn
      .select({ count: sql<number>`count(*)` })
      .from(schema.executionActionCompletions)
      .where(
        and(
          eq(schema.executionActionCompletions.userId, userId),
          gte(schema.executionActionCompletions.completedAt, todayStart),
          lt(schema.executionActionCompletions.completedAt, todayEnd)
        )
      ),
    getLeaderboard(userId),
  ]);

  const completedActionsToday = Number(todayRows[0]?.count ?? 0);

  return {
    score,
    actions,
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    completedActionsToday,
    qualifiesForStreakToday: completedActionsToday >= QUALIFICATION_THRESHOLD,
    leaderboard,
  };
}
