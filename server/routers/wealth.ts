// server/routers/wealth.ts
import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { invokeLLM } from '../_core/llm';
import * as db from '../db';
import { computeWealthHealthScore, computeUnlockedTrackNumbers, computeFiProjection } from '../wealth/wealthUtils';
import { MILESTONE_PROFILE_FLAGS } from '../wealth/milestoneKeys';
import { nanoid } from 'nanoid';

// MED-03: In-memory cache for AI insights (7-day TTL per user)
const aiInsightsCache = new Map<number, { insights: string[]; cachedAt: number }>();
const AI_INSIGHTS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const wealthRouter = router({

  // ── GET FULL JOURNEY ──
  getJourney: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const [milestones, profile, agentProfile] = await Promise.all([
      db.getWealthMilestones(userId),
      db.getWealthProfile(userId),
      db.getAgentProfile(userId),
    ]);
    const incomeGoal = (agentProfile as any)?.incomeGoal ?? null;
    // MED-02: Pass milestones so prerequisite completion is enforced
    const unlockedTracks = computeUnlockedTrackNumbers(incomeGoal, milestones);
    const healthScore = computeWealthHealthScore(milestones);
    return { milestones, profile, unlockedTracks, healthScore };
  }),

  // ── UPDATE MILESTONE ──
  updateMilestone: protectedProcedure
    .input(z.object({
      milestoneKey: z.string(),
      status: z.enum(['not_started', 'in_progress', 'done']),
      notes: z.string().optional(),
      completedDate: z.string().optional(),
      // Sprint D: Blocker note for in_progress milestones
      blockerNote: z.string().max(500).optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      await db.upsertWealthMilestone(userId, input);

      // Sprint D: Persist blocker note if provided
      if (input.blockerNote !== undefined) {
        await db.setMilestoneBlocker(userId, input.milestoneKey, input.blockerNote ?? null);
      }

      // Sync profile flags for quick-access queries
      const flagKey = MILESTONE_PROFILE_FLAGS[input.milestoneKey];
      if (flagKey && input.status === 'done') {
        await db.setWealthProfileFlag(userId, flagKey, true);
      } else if (flagKey && input.status === 'not_started') {
        await db.setWealthProfileFlag(userId, flagKey, false);
      }

      // MED-03: Invalidate AI insights cache when milestones change
      aiInsightsCache.delete(userId);

      // Drive sync (non-blocking)
      db.getDriveTokens(userId).then(async (tokens) => {
        if (!tokens) return;
        const { syncWealthMilestone } = await import('../drive/driveSync');
        syncWealthMilestone(userId, {
          milestoneKey: input.milestoneKey,
          status: input.status,
          completedDate: input.completedDate,
          notes: input.notes,
        }).catch((err: unknown) => console.error('[Drive] Wealth milestone sync failed:', err));
      }).catch(() => {});

      return { success: true };
    }),

  // ── GET / UPDATE PROFILE ──
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return db.getWealthProfile(ctx.user.id);
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      annualExpenses: z.number().optional(),
      savingsRatePct: z.number().optional(),
      tithePct: z.number().optional(),
      expectedReturnPct: z.number().optional(),
      llcName: z.string().optional(),
      llcFormDate: z.string().optional(),
      scorp2553FiledDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // MED-05: Use nullish check (not falsy) so annualExpenses = 0 still computes fiNumber
      const fiNumber = input.annualExpenses != null ? String(input.annualExpenses * 25) : undefined;
      const payload: any = {
        ...input,
        fiNumber,
        annualExpenses: input.annualExpenses != null ? String(input.annualExpenses) : undefined,
        savingsRatePct: input.savingsRatePct != null ? String(input.savingsRatePct) : undefined,
        tithePct: input.tithePct != null ? String(input.tithePct) : undefined,
        expectedReturnPct: input.expectedReturnPct != null ? String(input.expectedReturnPct) : undefined,
      };
      await db.upsertWealthProfile(ctx.user.id, payload);
      return { success: true };
    }),

  // ── FI CALCULATOR ──
  getFiCalculation: protectedProcedure
    .input(z.object({
      gci: z.number(),
      expenses: z.number(),
      bizPct: z.number().default(29.2),
      splitsPct: z.number().default(10),
      taxRate: z.number().default(28),
      tithePct: z.number().default(10),
      savingsRate: z.number().default(15),
      investReturn: z.number().default(8),
      currentSavings: z.number().default(0),
    }))
    .query(({ input }) => {
      return computeFiProjection(input);
    }),

  // ── INVESTMENT PROPERTIES ──
  getProperties: protectedProcedure.query(async ({ ctx }) => {
    return db.getInvestmentProperties(ctx.user.id);
  }),

  addProperty: protectedProcedure
    .input(z.object({
      address: z.string().optional(),
      purchaseDate: z.string().optional(),
      purchasePrice: z.number().optional(),
      currentValue: z.number().optional(),
      monthlyRent: z.number().optional(),
      monthlyExpenses: z.number().optional(),
      strategy: z.enum(['brrrr', 'buy_hold', 'flip', 'other']).default('buy_hold'),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const payload = {
        ...input,
        purchasePrice: input.purchasePrice != null ? String(input.purchasePrice) : undefined,
        currentValue: input.currentValue != null ? String(input.currentValue) : undefined,
        monthlyRent: input.monthlyRent != null ? String(input.monthlyRent) : undefined,
        monthlyExpenses: input.monthlyExpenses != null ? String(input.monthlyExpenses) : undefined,
      } as any;
      const id = await db.addInvestmentProperty(ctx.user.id, payload);
      await db.setWealthProfileFlag(ctx.user.id, 'hasInvestmentProperty', true);
      return { id };
    }),

  updateProperty: protectedProcedure
    .input(z.object({
      id: z.number(),
      address: z.string().optional(),
      purchaseDate: z.string().optional(),
      purchasePrice: z.number().optional(),
      currentValue: z.number().optional(),
      monthlyRent: z.number().optional(),
      monthlyExpenses: z.number().optional(),
      strategy: z.enum(['brrrr', 'buy_hold', 'flip', 'other']).optional(),
      status: z.enum(['active', 'sold', 'under_contract']).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const payload = {
        ...rest,
        purchasePrice: rest.purchasePrice != null ? String(rest.purchasePrice) : undefined,
        currentValue: rest.currentValue != null ? String(rest.currentValue) : undefined,
        monthlyRent: rest.monthlyRent != null ? String(rest.monthlyRent) : undefined,
        monthlyExpenses: rest.monthlyExpenses != null ? String(rest.monthlyExpenses) : undefined,
      } as any;
      await db.updateInvestmentProperty(ctx.user.id, id, payload);
      return { success: true };
    }),

  deleteProperty: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteInvestmentProperty(ctx.user.id, input.id);
      // Check if any properties remain; if not, clear the flag
      const remaining = await db.getInvestmentProperties(ctx.user.id);
      if (remaining.length === 0) {
        await db.setWealthProfileFlag(ctx.user.id, 'hasInvestmentProperty', false);
      }
      return { success: true };
    }),

  // ── AI INSIGHTS (MED-03: 7-day server-side cache) ──
  getAIInsights: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // MED-03: Return cached insights if still fresh
    const cached = aiInsightsCache.get(userId);
    if (cached && Date.now() - cached.cachedAt < AI_INSIGHTS_TTL_MS) {
      return { insights: cached.insights, fromCache: true };
    }

    const [milestones, profile, agentProfile] = await Promise.all([
      db.getWealthMilestones(userId),
      db.getWealthProfile(userId),
      db.getAgentProfile(userId),
    ]);

    const done = milestones.filter(m => m.status === 'done').map(m => m.milestoneKey);
    const inProgress = milestones.filter(m => m.status === 'in_progress').map(m => m.milestoneKey);
    const healthScore = computeWealthHealthScore(milestones);
    const incomeGoal = (agentProfile as any)?.incomeGoal ?? 0;

    const prompt = `You are a KW Productivity Coach helping a real estate agent with their Wealth Journey.
The agent has the following wealth profile:
- Income Goal: $${incomeGoal.toLocaleString()}/year
- Wealth Health Score: ${healthScore}/100
- Milestones completed: ${done.join(', ') || 'none'}
- Milestones in progress: ${inProgress.join(', ') || 'none'}
- Has LLC: ${profile?.hasLLC ? 'Yes' : 'No'}
- Has S-Corp: ${profile?.hasSCorp ? 'Yes' : 'No'}
- Has SEP-IRA: ${profile?.hasSepIra ? 'Yes' : 'No'}
- Annual Expenses: ${profile?.annualExpenses ? '$' + Number(profile.annualExpenses).toLocaleString() : 'Not set'}
- FI Number: ${profile?.fiNumber ? '$' + Number(profile.fiNumber).toLocaleString() : 'Not calculated'}

IMPORTANT: You are NOT a financial advisor. Do not give specific investment, tax, or legal advice.
Your role is to ask coaching questions and point agents toward their CPA, estate attorney, or fee-only advisor.

Generate exactly 2-3 short, actionable coaching insights (1-2 sentences each) based on the agent's current wealth journey status.
Focus on the most impactful next step they should discuss with their professional advisor.
Format as a JSON array of strings.`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: 'system', content: 'You are a KW Productivity Coach. Return only a JSON array of 2-3 insight strings.' },
          { role: 'user', content: prompt },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'wealth_insights',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                insights: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['insights'],
              additionalProperties: false,
            },
          },
        },
      });
      const content = response.choices?.[0]?.message?.content;
      const parsed = JSON.parse(typeof content === 'string' ? content : '{}');
      const insights = parsed.insights ?? [];
      // MED-03: Store in cache
      aiInsightsCache.set(userId, { insights, cachedAt: Date.now() });
      return { insights, fromCache: false };
    } catch {
      return { insights: ['Connect with your CPA to review your current tax strategy and identify your highest-impact next step.'], fromCache: false };
    }
  }),

  // ── SPRINT D: NEXT BEST MOVE ENGINE ──
  // Replaces the static getAIInsights for the WealthInsights panel.
  // Returns a prioritized single next action with context, plus 2 supporting insights.
  getNextBestMove: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [milestones, profile, agentProfile, wealthWins] = await Promise.all([
      db.getWealthMilestones(userId),
      db.getWealthProfile(userId),
      db.getAgentProfile(userId),
      db.getWealthWins(userId),
    ]);

    const done = milestones.filter(m => m.status === 'done').map(m => m.milestoneKey);
    const inProgress = milestones
      .filter(m => m.status === 'in_progress')
      .map(m => `${m.milestoneKey}${(m as any).blockerNote ? ` [BLOCKER: ${(m as any).blockerNote}]` : ''}`);
    const healthScore = computeWealthHealthScore(milestones);
    const incomeGoal = (agentProfile as any)?.incomeGoal ?? 0;
    const recentWins = wealthWins.slice(0, 3).map(w => w.title);

    const prompt = `You are a KW Productivity Coach helping a real estate agent prioritize their next wealth action.

Agent context:
- Income Goal: $${incomeGoal.toLocaleString()}/year
- Wealth Health Score: ${healthScore}/100
- Milestones done: ${done.join(', ') || 'none'}
- Milestones in progress: ${inProgress.join(', ') || 'none'}
- Has LLC: ${profile?.hasLLC ? 'Yes' : 'No'} | Has S-Corp: ${profile?.hasSCorp ? 'Yes' : 'No'} | Has SEP-IRA: ${profile?.hasSepIra ? 'Yes' : 'No'}
- Annual Expenses: ${profile?.annualExpenses ? '$' + Number(profile.annualExpenses).toLocaleString() : 'Not set'}
- Recent wins: ${recentWins.join(', ') || 'none yet'}

RULES:
1. Do NOT give specific investment, tax, or legal advice. Point to CPA/attorney/fee-only advisor.
2. Identify the single highest-leverage next action (the "Next Best Move").
3. Explain WHY it matters in 1-2 sentences.
4. Provide 2 supporting coaching insights.
5. If there are blockers listed, acknowledge them and suggest how to unblock.

Return JSON: { nextMove: string, why: string, insights: string[] }`;

    try {
      const response = await invokeLLM({
        messages: [{ role: 'user', content: prompt }],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'next_best_move',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                nextMove: { type: 'string' },
                why: { type: 'string' },
                insights: { type: 'array', items: { type: 'string' } },
              },
              required: ['nextMove', 'why', 'insights'],
              additionalProperties: false,
            },
          },
        },
      });
      const content = response.choices?.[0]?.message?.content;
      const cleaned = (typeof content === 'string' ? content : '{}')
        .replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        nextMove: parsed.nextMove as string,
        why: parsed.why as string,
        insights: parsed.insights as string[],
      };
    } catch {
      return {
        nextMove: 'Schedule a 30-minute strategy call with your CPA',
        why: 'Tax strategy is the highest-leverage wealth action for most real estate agents at your income level.',
        insights: [
          'Your current milestone progress shows strong momentum — now is the time to protect what you\'re building.',
          'Connect with a fee-only financial advisor to map your path from your current position to your FI number.',
        ],
      };
    }
  }),

  // ── SPRINT D: TRACK NARRATIVE GENERATION ──
  // Generates a personalized 2-3 sentence coaching narrative for a specific track
  // based on the agent's completed/in-progress milestones in that track.
  generateTrackNarrative: protectedProcedure
    .input(z.object({
      trackNumber: z.number().min(1).max(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const [milestones, agentProfile] = await Promise.all([
        db.getWealthMilestones(userId),
        db.getAgentProfile(userId),
      ]);

      const trackMilestones = milestones.filter(m =>
        m.milestoneKey.startsWith(`t${input.trackNumber}_`)
      );
      const done = trackMilestones.filter(m => m.status === 'done').map(m => m.milestoneKey);
      const inProgress = trackMilestones
        .filter(m => m.status === 'in_progress')
        .map(m => `${m.milestoneKey}${(m as any).blockerNote ? ` [BLOCKER: ${(m as any).blockerNote}]` : ''}`);
      const total = trackMilestones.length;
      const agentName = (agentProfile as any)?.name ?? 'Agent';

      const TRACK_NAMES: Record<number, string> = {
        1: 'Foundation', 2: 'Business Structure', 3: 'Tax Optimization',
        4: 'Wealth Building', 5: 'Legacy & FI',
      };
      const trackName = TRACK_NAMES[input.trackNumber] ?? `Track ${input.trackNumber}`;

      const prompt = `You are a KW Productivity Coach writing a brief, encouraging narrative for a real estate agent's wealth journey progress.

Agent: ${agentName}
Track: ${input.trackNumber} — ${trackName}
Total milestones in track: ${total}
Completed: ${done.length} (${done.join(', ') || 'none'})
In progress: ${inProgress.length} (${inProgress.join(', ') || 'none'})

Write a 2-3 sentence coaching narrative that:
1. Acknowledges what they've accomplished in this track
2. Names their current momentum or next priority
3. Ends with an encouraging, forward-looking statement

Tone: warm, direct, coach-to-agent. No generic platitudes. Reference the specific milestones.
IMPORTANT: Do NOT give specific financial, tax, or legal advice. Point to advisors.

Return JSON: { narrative: string }`;

      try {
        const response = await invokeLLM({
          messages: [{ role: 'user', content: prompt }],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'track_narrative',
              strict: true,
              schema: {
                type: 'object',
                properties: { narrative: { type: 'string' } },
                required: ['narrative'],
                additionalProperties: false,
              },
            },
          },
        });
        const content = response.choices?.[0]?.message?.content;
        const cleaned = (typeof content === 'string' ? content : '{}')
          .replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        // Cache the narrative on the wealthProfile
        await db.upsertWealthProfile(userId, {
          [`trackNarrative${input.trackNumber}`]: parsed.narrative,
          trackNarrativeUpdatedAt: new Date().toISOString(),
        } as any);
        return { narrative: String(parsed.narrative ?? '') };
      } catch {
        const fallback = `You're making real progress on Track ${input.trackNumber} — ${trackName}. Keep building on the foundation you've established and connect with your advisor to unlock the next level.`;
        return { narrative: fallback };
      }
    }),

  // ── SPRINT D: WEALTH WINS ──
  listWealthWins: protectedProcedure.query(async ({ ctx }) => {
    return db.getWealthWins(ctx.user.id);
  }),

  addWealthWin: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      description: z.string().max(500).optional(),
      category: z.enum(['milestone', 'income', 'debt', 'investment', 'protection', 'mindset']),
      milestoneKey: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.createWealthWin({
        winId: nanoid(16),
        userId: ctx.user.id,
        title: input.title,
        description: input.description ?? undefined,
        category: input.category,
        milestoneKey: input.milestoneKey ?? undefined,
      });
      return { success: true };
    }),
});
