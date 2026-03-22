import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { ENV } from "./_core/env";
import * as db from "./db";
import { nanoid } from "nanoid";
import * as schema from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getAuthUrl, exchangeCodeForTokens } from "./drive/googleDrive";
import { provisionAgentFolder, syncEconomicModel, syncWeeklyPulse } from "./drive/driveSync";
import { buildMCRollup } from "./drive/mcRollup";
import { wealthRouter } from "./routers/wealth";
import { calendarRouter } from "./routers/calendar";
import { scheduleRouter } from "./routers/schedule";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================================
  // AGENT PROFILE
  // ============================================================
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getAgentProfile(ctx.user.id);
      return profile ?? null;
    }),
    upsert: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        brokerage: z.string().optional(),
        marketCenter: z.string().optional(),
        state: z.string().optional(),
        yearsExperience: z.number().optional(),
        gciLastYear: z.number().optional(),
        teamSize: z.number().optional(),
        currentLevel: z.number().optional(),
        operationalScore: z.number().optional(),
        incomeGoal: z.number().optional(),
        diagnosticAnswers: z.any().optional(),
        topProblems: z.any().optional(),
        isOnboarded: z.boolean().optional(),
        coachMode: z.boolean().optional(),
        googleBusinessUrl: z.string().optional(),
        reviewRequestTemplate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertAgentProfile({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
  }),

  // ============================================================
  // DELIVERABLES
  // ============================================================
  deliverables: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserDeliverables(ctx.user.id);
    }),
    upsert: protectedProcedure
      .input(z.object({
        deliverableId: z.string(),
        level: z.number(),
        title: z.string(),
        isComplete: z.boolean().optional(),
        completedAt: z.date().optional(),
        builderData: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertDeliverable({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
    bulkInit: protectedProcedure
      .input(z.array(z.object({
        deliverableId: z.string(),
        level: z.number(),
        title: z.string(),
      })))
      .mutation(async ({ ctx, input }) => {
        const items = input.map(d => ({ ...d, userId: ctx.user.id, isComplete: false }));
        await db.bulkInsertDeliverables(items);
        return { success: true };
      }),
  }),

  // ============================================================
  // LEADS / PIPELINE
  // ============================================================
  leads: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserLeads(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        leadId: z.string(),
        firstName: z.string(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        type: z.enum(["buyer", "seller", "both", "investor", "renter"]).optional(),
        source: z.string().optional(),
        stage: z.string().optional(),
        budget: z.number().optional(),
        timeline: z.string().optional(),
        tags: z.any().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.insertLead({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        leadId: z.string(),
        updates: z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          type: z.enum(["buyer", "seller", "both", "investor", "renter"]).optional(),
          source: z.string().optional(),
          stage: z.string().optional(),
          budget: z.number().optional(),
          timeline: z.string().optional(),
          tags: z.any().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateLead(ctx.user.id, input.leadId, input.updates);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ leadId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteLead(ctx.user.id, input.leadId);
        return { success: true };
      }),
  }),

  // ============================================================
  // TRANSACTIONS
  // ============================================================
  transactions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserTransactions(ctx.user.id);
    }),
    get: protectedProcedure
      .input(z.object({ transactionId: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getTransaction(ctx.user.id, input.transactionId);
      }),
    create: protectedProcedure
      .input(z.object({
        transactionId: z.string(),
        propertyAddress: z.string(),
        clientName: z.string().optional(),
        clientEmail: z.string().optional(),
        clientPhone: z.string().optional(),
        type: z.enum(["buyer", "seller", "dual"]).optional(),
        status: z.enum(["pre-contract", "under-contract", "clear-to-close", "closed", "cancelled"]).optional(),
        salePrice: z.number().optional(),
        commission: z.number().optional(),
        closeDate: z.string().optional(),
        checklist: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.insertTransaction({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        transactionId: z.string(),
        updates: z.object({
          propertyAddress: z.string().optional(),
          clientName: z.string().optional(),
          clientEmail: z.string().optional(),
          clientPhone: z.string().optional(),
          status: z.enum(["pre-contract", "under-contract", "clear-to-close", "closed", "cancelled"]).optional(),
          salePrice: z.number().optional(),
          commission: z.number().optional(),
          closeDate: z.string().optional(),
          checklist: z.any().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateTransaction(ctx.user.id, input.transactionId, input.updates);
        return { success: true };
      }),
  }),

  // ============================================================
  // FINANCIALS
  // ============================================================
  financials: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserFinancials(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["income", "expense"]),
        category: z.string(),
        description: z.string().optional(),
        amount: z.number(),
        date: z.string(),
        receiptUrl: z.string().optional(),
        receiptText: z.string().optional(),
        autoCategory: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.insertFinancialEntry({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
    categorizeReceipt: protectedProcedure
      .input(z.object({ receiptText: z.string() }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a real estate business expense categorizer. Given receipt text, extract the vendor, amount, date, and assign an IRS Schedule C category for a real estate agent. Categories: Advertising, Car/Truck Expenses, Commission/Fees, Insurance, Legal/Professional, Office Expense, Supplies, Travel, Meals, Education, MLS Dues, Lockbox Fees, Photography, Staging, Signs, Technology, Other.

Return JSON: { "vendor": string, "amount": number, "date": string, "category": string, "description": string }`,
            },
            { role: "user", content: input.receiptText },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "receipt_categorization",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  vendor: { type: "string" },
                  amount: { type: "number" },
                  date: { type: "string" },
                  category: { type: "string" },
                  description: { type: "string" },
                },
                required: ["vendor", "amount", "date", "category", "description"],
                additionalProperties: false,
              },
            },
          },
        });
        const content = response.choices[0]?.message?.content;
        try {
          return JSON.parse(typeof content === "string" ? content : "{}");
        } catch {
          return { vendor: "", amount: 0, date: "", category: "Other", description: content || "" };
        }
      }),
    taxExport: protectedProcedure
      .input(z.object({ year: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getFinancialEntriesByYear(ctx.user.id, input.year);
      }),
  }),

  // ============================================================
  // SOPs / KNOWLEDGE LIBRARY
  // ============================================================
  sops: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserSOPs(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        sopId: z.string(),
        title: z.string(),
        category: z.string().optional(),
        content: z.string().optional(),
        status: z.enum(["draft", "active", "archived"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.insertSOP({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        sopId: z.string(),
        updates: z.object({
          title: z.string().optional(),
          category: z.string().optional(),
          content: z.string().optional(),
          status: z.enum(["draft", "active", "archived"]).optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateSOP(ctx.user.id, input.sopId, input.updates);
        return { success: true };
      }),
  }),

  // ============================================================
  // CULTURE DOCS
  // ============================================================
  culture: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserCultureDoc(ctx.user.id);
    }),
    upsert: protectedProcedure
      .input(z.object({
        missionStatement: z.string().optional(),
        visionStatement: z.string().optional(),
        coreValues: z.any().optional(),
        teamCommitments: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertCultureDoc({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
  }),

  // ============================================================
  // AI COACHING
  // ============================================================
  coaching: router({
    ask: protectedProcedure
      .input(z.object({
        context: z.string(),
        prompt: z.string(),
        agentLevel: z.number().optional(),
        agentData: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const systemPrompt = `You are an expert real estate business coach trained in the MREA (Millionaire Real Estate Agent) framework by Gary Keller. You help agents build their business systematically through the 7 levels: Solo Agent, First Admin Hire, First Buyer's Agent, Multiple Buyer's Agents, Listings Specialist, Full Team, and Business Owner.

The agent is currently at Level ${input.agentLevel || 1}. Context: ${input.context}.

${input.agentData ? `Agent data: ${JSON.stringify(input.agentData)}` : ''}

Provide actionable, specific advice. Reference MREA models where applicable (Personal Economic Model, Lead Generation Model, Budget Model, Organizational Model). Be direct, structured, and metrics-focused. Use real estate industry terminology naturally.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.prompt },
          ],
        });

        const content = response.choices[0]?.message?.content;
        const responseText = typeof content === "string" ? content : "";

        await db.insertCoachingLog({
          userId: ctx.user.id,
          context: input.context,
          prompt: input.prompt,
          response: responseText,
        });

        return { response: responseText };
      }),

    history: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getUserCoachingLogs(ctx.user.id, input.limit || 20);
      }),
  }),

  // ============================================================
  // COACH PORTAL (Phase 4)
  // ============================================================
  coachPortal: router({
    invite: protectedProcedure
      .input(z.object({ inviteEmail: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const token = nanoid(32);
        await db.createCoachRelationship({
          agentId: ctx.user.id,
          inviteToken: token,
          inviteEmail: input.inviteEmail,
          status: "pending",
        });
        return { token, inviteUrl: `/coach-accept?token=${token}` };
      }),
    acceptInvite: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const rel = await db.getCoachRelationshipByToken(input.token);
        if (!rel) return { success: false, error: "Invalid invite token" };
        if (rel.status !== "pending") return { success: false, error: "Invite already used" };
        if (!ctx.user) return { success: false, error: "Must be logged in" };
        await db.updateCoachRelationship(rel.id, { coachId: ctx.user.id, status: "active" });
        // Enable coach mode on the agent's profile
        await db.upsertAgentProfile({ userId: rel.agentId, coachMode: true });
        return { success: true };
      }),
    myAgents: protectedProcedure.query(async ({ ctx }) => {
      const rels = await db.getCoachRelationships(ctx.user.id);
      const agents = [];
      for (const rel of rels) {
        if (rel.status !== "active") continue;
        const profile = await db.getAgentProfile(rel.agentId);
        const delivs = await db.getUserDeliverables(rel.agentId);
        agents.push({
          relationshipId: rel.id,
          agentId: rel.agentId,
          profile,
          deliverables: delivs,
          status: rel.status,
        });
      }
      return agents;
    }),
    agentDetail: protectedProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify coach relationship
        const rel = await db.getCoachRelationshipForPair(ctx.user.id, input.agentId);
        if (!rel || rel.status !== "active") return null;
        const profile = await db.getAgentProfile(input.agentId);
        const delivs = await db.getUserDeliverables(input.agentId);
        const comments = await db.getAgentCoachComments(input.agentId);
        return { profile, deliverables: delivs, comments };
      }),
    addComment: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        deliverableId: z.string(),
        comment: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createCoachComment({
          coachId: ctx.user.id,
          agentId: input.agentId,
          deliverableId: input.deliverableId,
          comment: input.comment,
        });
        return { success: true };
      }),
    myCoachComments: protectedProcedure.query(async ({ ctx }) => {
      return db.getAgentCoachComments(ctx.user.id);
    }),

    // ── Cohort management (Phase 6) ──────────────────────────────
    createCohort: protectedProcedure
      .input(z.object({
        name: z.string(),
        type: z.enum(['foundation', 'growth', 'scale']),
        targetLevelMin: z.number(),
        targetLevelMax: z.number(),
        maxSize: z.number().default(20),
        zoomLink: z.string().optional(),
        slackChannelUrl: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertAgentProfile({ userId: ctx.user.id, coachMode: true });
        await db.createCohort({
          ...input,
          coachId: ctx.user.id,
          cohortId: nanoid(12),
          status: 'forming',
        });
        return { success: true };
      }),

    myCohorts: protectedProcedure.query(async ({ ctx }) => {
      const cohorts = await db.getCoachCohorts(ctx.user.id);
      return Promise.all(cohorts.map(async (c) => {
        const members = await db.getCohortMembers(c.cohortId);
        const memberData = await Promise.all(
          members
            .filter(m => m.status === 'active')
            .map(async (m) => {
              const profile = await db.getAgentProfile(m.agentId);
              const deliverables = await db.getUserDeliverables(m.agentId);
              const leads = await db.getUserLeads(m.agentId);
              const commitments = await db.getAgentCommitments(m.agentId, 10);
              const completedCommitments = commitments.filter(c => c.isComplete).length;
              const recentLeads = leads.filter(
                l => new Date(l.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
              ).length;
              const healthScore = Math.min(100,
                Math.min(30, recentLeads * 3) +
                Math.min(40, deliverables.filter(d => d.isComplete).length * 3) +
                30
              );
              return {
                agentId: m.agentId,
                profile,
                healthScore,
                currentLevel: profile?.currentLevel ?? 1,
                deliverablesComplete: deliverables.filter(d => d.isComplete).length,
                deliverablesTotal: deliverables.length,
                commitmentRate: commitments.length > 0
                  ? Math.round((completedCommitments / commitments.length) * 100)
                  : null,
                pipelineCount: leads.filter(
                  l => !['Closed', 'Dead', 'Nurture'].includes(l.stage ?? '')
                ).length,
              };
            })
        );
        return { ...c, members: memberData };
      }));
    }),

    inviteToCohort: protectedProcedure
      .input(z.object({
        cohortId: z.string(),
        agentEmail: z.string().email(),
      }))
      .mutation(async ({ ctx, input }) => {
        const agent = await db.getUserByEmail(input.agentEmail);
        if (!agent) throw new Error('No AgentOS user found with that email');
        await db.addCohortMember({
          cohortId: input.cohortId,
          agentId: agent.id,
          status: 'active',
        });
        return { success: true };
      }),

    removeCohortMember: protectedProcedure
      .input(z.object({ cohortId: z.string(), agentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateCohortMemberStatus(
          input.cohortId, input.agentId, 'removed'
        );
        return { success: true };
      }),

    // ── Sessions (Phase 6) ───────────────────────────────────────
    scheduleSession: protectedProcedure
      .input(z.object({
        agentId: z.number().optional(),
        cohortId: z.string().optional(),
        type: z.enum(['one_on_one', 'group_monthly', 'group_checkin']),
        scheduledAt: z.string(),
        zoomLink: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createSession({
          sessionId: nanoid(12),
          coachId: ctx.user.id,
          agentId: input.agentId,
          cohortId: input.cohortId,
          type: input.type,
          scheduledAt: new Date(input.scheduledAt),
          zoomLink: input.zoomLink,
        });
        return { success: true };
      }),

    upcomingSessions: protectedProcedure.query(async ({ ctx }) => {
      return db.getCoachUpcomingSessions(ctx.user.id);
    }),

    allSessions: protectedProcedure.query(async ({ ctx }) => {
      return db.getCoachAllSessions(ctx.user.id);
    }),

    saveSessionNotes: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        coachNotes: z.string().optional(),
        clientSummary: z.string().optional(),
        commitments: z.array(z.object({
          agentId: z.number(),
          text: z.string(),
          linkedDeliverableId: z.string().optional(),
          dueDate: z.string().optional(),
        })).default([]),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateSession(input.sessionId, {
          coachNotes: input.coachNotes,
          clientSummary: input.clientSummary,
          completedAt: new Date(),
        });
        for (const c of input.commitments) {
          await db.createCommitment({
            commitmentId: nanoid(12),
            sessionId: input.sessionId,
            agentId: c.agentId,
            coachId: ctx.user.id,
            text: c.text,
            linkedDeliverableId: c.linkedDeliverableId,
            dueDate: c.dueDate ? new Date(c.dueDate) : undefined,
          });
        }
        return { success: true };
      }),

    // ── Pre-session brief (Phase 6) ─────────────────────────────
    generatePreBrief: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        sendEmail: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await db.getSession(input.sessionId);
        if (!session?.agentId) throw new Error('Session not found or is a group session');
        const agentId = session.agentId;

        const [profile, deliverables, leads, commitments] = await Promise.all([
          db.getAgentProfile(agentId),
          db.getUserDeliverables(agentId),
          db.getUserLeads(agentId),
          db.getAgentCommitments(agentId, 5),
        ]);

        const completedCommits = commitments.filter(c => c.isComplete).length;
        const healthScore = Math.min(100,
          Math.min(30, leads.filter(
            l => new Date(l.createdAt).getTime() > Date.now() - 30*24*60*60*1000
          ).length * 3) +
          Math.min(40, deliverables.filter(d => d.isComplete).length * 3) +
          30
        );

        const aiResponse = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'You are an expert real estate business coach. Generate ONE powerful coaching question for an agent based on their data. Under 30 words. Make it thought-provoking, not surface-level.',
            },
            {
              role: 'user',
              content: `Agent at MREA Level ${profile?.currentLevel}. Health score: ${healthScore}/100. Completed ${completedCommits}/${commitments.length} last commitments. Incomplete deliverable: ${deliverables.find(d => !d.isComplete)?.title || 'none'}. Pipeline: ${leads.filter(l => !['Closed','Dead','Nurture'].includes(l.stage ?? '')).length} active leads.`,
            },
          ],
        });

        const coachingQuestion = aiResponse.choices[0]?.message?.content || '';

        const brief = {
          agentName: profile?.name || 'Agent',
          currentLevel: profile?.currentLevel ?? 1,
          healthScore,
          deliverablesComplete: deliverables.filter(d => d.isComplete).length,
          deliverablesTotal: deliverables.length,
          activePipeline: leads.filter(l => !['Closed','Dead','Nurture'].includes(l.stage ?? '')).length,
          lastCommitments: commitments.map(c => ({ text: c.text, isComplete: c.isComplete })),
          coachingQuestion,
          sessionDate: session.scheduledAt,
        };

        return brief;
      }),

    // ── Agent-side commitment endpoints (Phase 6) ────────────────
    myCommitments: protectedProcedure.query(async ({ ctx }) => {
      return db.getAgentCommitments(ctx.user.id, 20);
    }),

    completeCommitment: protectedProcedure
      .input(z.object({ commitmentId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.markCommitmentComplete(input.commitmentId, ctx.user.id);
        return { success: true };
      }),

    mySessions: protectedProcedure.query(async ({ ctx }) => {
      return db.getAgentSessions(ctx.user.id, 20);
    }),

    rateSession: protectedProcedure
      .input(z.object({ sessionId: z.string(), rating: z.number().min(1).max(10) }))
      .mutation(async ({ ctx, input }) => {
        await db.updateSession(input.sessionId, { rating: input.rating });
        return { success: true };
      }),

     myCohort: protectedProcedure.query(async ({ ctx }) => {
      const cohort = await db.getAgentActiveCohort(ctx.user.id);
      return cohort ?? null;
    }),

    // Wealth view — coach sees all clients' wealth health scores and alert flags
    getClientsWithWealth: protectedProcedure.query(async ({ ctx }) => {
      const relationships = await db.getCoachRelationships(ctx.user.id);
      const agentIds = relationships.map(r => r.agentId);
      if (agentIds.length === 0) return [];

      const results = await Promise.all(
        agentIds.map(async (agentId) => {
          const profile = await db.getAgentProfile(agentId);
          const milestones = await db.getWealthMilestones(agentId);
          const properties = await db.getInvestmentProperties(agentId);

          const doneCount = milestones.filter(m => m.status === 'done').length;
          const totalCount = 33;
          const healthScore = Math.round((doneCount / totalCount) * 100);

          // Alert flags for coaching conversations
          const alerts: string[] = [];
          const hasSepIra = milestones.find(m => m.milestoneKey === 't3_sep_ira' && m.status === 'done');
          const hasLLC = milestones.find(m => m.milestoneKey === 't2_llc_formed' && m.status === 'done');
          const hasEmergencyFund = milestones.find(m => m.milestoneKey === 't1_emergency_fund_3mo' && m.status === 'done');
          const hasFiNumber = milestones.find(m => m.milestoneKey === 't4_fi_number_defined' && m.status === 'done');

          if (!hasEmergencyFund) alerts.push('No emergency fund');
          if (!hasLLC) alerts.push('No LLC');
          if (!hasSepIra) alerts.push('No SEP-IRA');
          if (!hasFiNumber) alerts.push('FI number not defined');

          return {
            agentId,
            agentName: profile?.name ?? 'Unknown Agent',
            healthScore,
            doneCount,
            propertyCount: properties.length,
            alerts,
            incomeGoal: profile?.incomeGoal ?? null,
          };
        })
      );

      return results.sort((a, b) => a.healthScore - b.healthScore);
    }),
  }),
  // ============================================================
  // RECRUITS (Phase 4)
  // ============================================================
  recruits: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserRecruits(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        recruitId: z.string(),
        name: z.string(),
        phone: z.string().optional(),
        email: z.string().optional(),
        currentBrokerage: z.string().optional(),
        yearsLicensed: z.number().optional(),
        annualVolume: z.number().optional(),
        stage: z.enum(["identified", "contacted", "interviewing", "offered", "accepted", "onboarded"]).optional(),
        gwcGet: z.enum(["yes", "maybe", "no"]).optional(),
        gwcWant: z.enum(["yes", "maybe", "no"]).optional(),
        gwcCapacity: z.enum(["yes", "maybe", "no"]).optional(),
        cultureFitScore: z.number().optional(),
        cultureFitNotes: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.insertRecruit({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        recruitId: z.string(),
        updates: z.object({
          name: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          currentBrokerage: z.string().optional(),
          yearsLicensed: z.number().optional(),
          annualVolume: z.number().optional(),
          stage: z.enum(["identified", "contacted", "interviewing", "offered", "accepted", "onboarded"]).optional(),
          gwcGet: z.enum(["yes", "maybe", "no"]).optional(),
          gwcWant: z.enum(["yes", "maybe", "no"]).optional(),
          gwcCapacity: z.enum(["yes", "maybe", "no"]).optional(),
          cultureFitScore: z.number().optional(),
          cultureFitNotes: z.string().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateRecruit(ctx.user.id, input.recruitId, input.updates);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ recruitId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteRecruit(ctx.user.id, input.recruitId);
        return { success: true };
      }),
  }),

  // ============================================================
  // TRANSACTION COMMS (Phase 4)
  // ============================================================
  transactionComms: router({
    list: protectedProcedure
      .input(z.object({ transactionId: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getTransactionComms(ctx.user.id, input.transactionId);
      }),
    send: protectedProcedure
      .input(z.object({
        transactionId: z.string(),
        milestone: z.string(),
        channel: z.enum(["sms", "email"]),
        messageBody: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createTransactionComm({ ...input, userId: ctx.user.id, status: "sent" });
        return { success: true };
      }),
    generateMessage: protectedProcedure
      .input(z.object({
        milestone: z.string(),
        clientName: z.string(),
        propertyAddress: z.string(),
        channel: z.enum(["sms", "email"]),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a real estate transaction coordinator. Generate a professional ${input.channel === "sms" ? "SMS (under 160 chars)" : "email"} message for a client at the "${input.milestone}" milestone of their transaction.

Client: ${input.clientName}
Property: ${input.propertyAddress}

Be warm, professional, and informative. Include next steps when applicable.`,
            },
            { role: "user", content: `Generate a ${input.channel} message for the "${input.milestone}" milestone.` },
          ],
        });
        const content = response.choices[0]?.message?.content;
        return { message: typeof content === "string" ? content : "" };
      }),
    createPortalLink: protectedProcedure
      .input(z.object({
        transactionId: z.string(),
        clientEmail: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const token = nanoid(32);
        await db.createPortalToken({
          token,
          transactionId: input.transactionId,
          userId: ctx.user.id,
          clientEmail: input.clientEmail,
        });
        return { token, portalUrl: `/client-portal?token=${token}` };
      }),
  }),

  // ============================================================
  // CLIENT PORTAL (Phase 4) — public access
  // ============================================================
  clientPortal: router({
    view: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const portalToken = await db.getPortalToken(input.token);
        if (!portalToken) return null;
        const transaction = await db.getTransactionPublic(portalToken.transactionId);
        const comms = await db.getTransactionCommsPublic(portalToken.transactionId);
        return { transaction, communications: comms };
      }),
  }),

  // ============================================================
  // REFERRAL PARTNERS (Phase 4)
  // ============================================================
  referrals: router({
    partners: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return db.getReferralPartners(ctx.user.id);
      }),
      create: protectedProcedure
        .input(z.object({
          partnerId: z.string(),
          name: z.string(),
          company: z.string().optional(),
          role: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          tier: z.enum(["A", "B", "C"]).optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          await db.createReferralPartner({ ...input, userId: ctx.user.id });
          return { success: true };
        }),
      update: protectedProcedure
        .input(z.object({
          partnerId: z.string(),
          updates: z.object({
            name: z.string().optional(),
            company: z.string().optional(),
            role: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            tier: z.enum(["A", "B", "C"]).optional(),
            notes: z.string().optional(),
          }),
        }))
        .mutation(async ({ ctx, input }) => {
          await db.updateReferralPartner(ctx.user.id, input.partnerId, input.updates);
          return { success: true };
        }),
    }),
    exchanges: router({
      list: protectedProcedure
        .input(z.object({ partnerId: z.string().optional() }))
        .query(async ({ ctx, input }) => {
          return db.getReferralExchanges(ctx.user.id, input.partnerId);
        }),
      create: protectedProcedure
        .input(z.object({
          partnerId: z.string(),
          direction: z.enum(["sent", "received"]),
          contactName: z.string().optional(),
          estimatedGCI: z.number().optional(),
          status: z.enum(["referred", "active", "closed", "lost"]).optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          await db.createReferralExchange({ ...input, userId: ctx.user.id });
          const field = input.direction === "sent" ? "referralsSentCount" : "referralsReceivedCount";
          await db.incrementPartnerCount(ctx.user.id, input.partnerId, field);
          return { success: true };
        }),
    }),
  }),

  // ============================================================
  // REVIEWS (Phase 4)
  // ============================================================
  reviews: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserReviews(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        reviewId: z.string(),
        platform: z.enum(["google", "zillow", "realtor", "facebook", "other"]).optional(),
        reviewerName: z.string().optional(),
        rating: z.number().optional(),
        reviewText: z.string().optional(),
        reviewDate: z.string().optional(),
        transactionId: z.string().optional(),
        sourceUrl: z.string().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createReview({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        reviewId: z.string(),
        updates: z.object({
          responseText: z.string().optional(),
          respondedAt: z.date().optional(),
          isPublic: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateReview(ctx.user.id, input.reviewId, input.updates);
        return { success: true };
      }),
    generateResponse: protectedProcedure
      .input(z.object({
        reviewerName: z.string(),
        rating: z.number(),
        reviewText: z.string(),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a real estate agent responding to a client review. Write a professional, warm, and authentic response. For positive reviews, express genuine gratitude. For negative reviews, acknowledge concerns, take responsibility where appropriate, and offer to make things right. Keep it under 150 words.`,
            },
            {
              role: "user",
              content: `${input.reviewerName} left a ${input.rating}-star review: "${input.reviewText}"`,
            },
          ],
        });
        const content = response.choices[0]?.message?.content;
        return { response: typeof content === "string" ? content : "" };
      }),
    requestReview: protectedProcedure
      .input(z.object({
        reviewId: z.string(),
        channel: z.enum(["sms", "email"]),
        clientName: z.string(),
        propertyAddress: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateReview(ctx.user.id, input.reviewId, { requestSentAt: new Date(), requestChannel: input.channel });
        return { success: true };
      }),
  }),

  // ============================================================
  // BROKERAGE CONFIG (Phase 4)
  // ============================================================
  brokerageConfig: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getBrokerageConfig(ctx.user.id);
    }),
    upsert: protectedProcedure
      .input(z.object({
        brokerageName: z.string().optional(),
        brandColor: z.string().optional(),
        frameworkName: z.string().optional(),
        level1Name: z.string().optional(),
        level2Name: z.string().optional(),
        level3Name: z.string().optional(),
        level4Name: z.string().optional(),
        level5Name: z.string().optional(),
        level6Name: z.string().optional(),
        level7Name: z.string().optional(),
        valuesFramework: z.string().optional(),
        showKWContent: z.boolean().optional(),
        coachingProgramName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertBrokerageConfig({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
  }),

   // ============================================================
  // SUBSCRIPTIONS (Phase 6)
  // ============================================================
  subscriptions: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      let sub = await db.getSubscription(ctx.user.id);
      if (!sub) {
        await db.createSubscription({
          userId: ctx.user.id,
          tier: 'self_guided',
          status: 'trialing',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          monthlyPriceCents: 9700,
        });
        sub = await db.getSubscription(ctx.user.id);
      }
      return sub;
    }),

    createCheckout: protectedProcedure
      .input(z.object({
        tier: z.enum(['self_guided', 'group', 'one_on_one']),
      }))
      .mutation(async ({ ctx, input }) => {
        // Stripe checkout - gracefully handle missing Stripe config
        try {
          const Stripe = (await import('stripe')).default;
          const stripe = new Stripe(ENV.stripeSecretKey);

          const PRICE_IDS: Record<string, string> = {
            self_guided: ENV.stripePriceSelfGuided,
            group: ENV.stripePriceGroup,
            one_on_one: ENV.stripePriceOneOnOne,
          };

          const sub = await db.getSubscription(ctx.user.id);
          let customerId = sub?.stripeCustomerId;

          if (!customerId) {
            const profile = await db.getAgentProfile(ctx.user.id);
            const user = await db.getUserById(ctx.user.id);
            const customer = await stripe.customers.create({
              email: user?.email || undefined,
              name: profile?.name || undefined,
              metadata: { userId: String(ctx.user.id) },
            });
            customerId = customer.id;
            await db.updateSubscription(ctx.user.id, {
              stripeCustomerId: customerId,
            });
          }

          const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            line_items: [{ price: PRICE_IDS[input.tier], quantity: 1 }],
            success_url: `${ENV.appUrl}/settings?tab=subscription&upgraded=true`,
            cancel_url: `${ENV.appUrl}/settings?tab=subscription`,
            metadata: { userId: String(ctx.user.id), tier: input.tier },
          });

          return { checkoutUrl: session.url };
        } catch (err: any) {
          throw new Error('Stripe not configured yet. Contact admin to set up payment processing.');
        }
      }),

    cancel: protectedProcedure.mutation(async ({ ctx }) => {
      const sub = await db.getSubscription(ctx.user.id);
      if (!sub?.stripeSubscriptionId) throw new Error('No active subscription');
      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(ENV.stripeSecretKey);
        await stripe.subscriptions.update(sub.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
        await db.updateSubscription(ctx.user.id, { cancelAtPeriodEnd: true });
        return { success: true };
      } catch (err: any) {
        throw new Error('Could not cancel subscription. Contact support.');
      }
    }),
  }),

  // ============================================================
  // CERTIFICATIONS (Phase 6)
  // ============================================================
  certifications: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const cert = await db.getCoachCertification(ctx.user.id);
      return cert ?? null;
    }),

    start: protectedProcedure.mutation(async ({ ctx }) => {
      await db.upsertCoachCertification(ctx.user.id, {
        status: 'in_progress',
        moduleProgress: { m1: false, m2: false, m3: false, m4: false, m5: false },
      });
      return { success: true };
    }),

    completeModule: protectedProcedure
      .input(z.object({ module: z.enum(['m1','m2','m3','m4','m5']) }))
      .mutation(async ({ ctx, input }) => {
        const cert = await db.getCoachCertification(ctx.user.id);
        const progress: any = (cert?.moduleProgress as any) ?? {};
        progress[input.module] = true;
        const allDone = ['m1','m2','m3','m4','m5'].every(m => progress[m]);
        await db.upsertCoachCertification(ctx.user.id, {
          moduleProgress: progress,
          status: allDone ? 'assessment_pending' : 'in_progress',
        });
        return { success: true };
      }),

    scheduleAssessment: protectedProcedure
      .input(z.object({ proposedDate: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertCoachCertification(ctx.user.id, {
          assessmentScheduledAt: new Date(input.proposedDate),
        });
        return { success: true };
      }),

    certify: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertCoachCertification(input.userId, {
          status: 'certified',
          certifiedAt: new Date(),
          certifiedBy: ctx.user.id,
          renewalDueAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });
        await db.upsertAgentProfile({
          userId: input.userId,
          coachMode: true,
          isAssociateCoach: true,
        });
        return { success: true };
      }),

    listCandidates: protectedProcedure.query(async () => {
      return db.getCertificationCandidates();
    }),
  }),

  // ════════════════════════════════════════════════════════════════
  // Phase 9 — Business Journey Feed
  // ════════════════════════════════════════════════════════════════
  journey: router({
    getFeed: protectedProcedure
      .input(z.object({
        limit: z.number().default(30),
        offset: z.number().default(0),
      }))
      .query(async ({ ctx, input }) => {
        const posts = await db.getFeedForUser(
          ctx.user.id, input.limit, input.offset
        );
        return Promise.all(posts.map(async (post) => {
          const [profile, reactions, comments] = await Promise.all([
            db.getAgentProfile(post.userId),
            db.getPostReactions(post.postId),
            db.getPostComments(post.postId).then(c => c.slice(0, 2)),
          ]);
          const userReaction = reactions.find(r => r.userId === ctx.user.id);
          const reactionCounts = reactions.reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return {
            ...post,
            author: {
              name: profile?.name || 'Agent',
              brokerage: profile?.brokerage || '',
              marketCenter: profile?.marketCenter || '',
              currentLevel: profile?.currentLevel || 1,
              isCoach: profile?.coachMode || false,
            },
            reactionCounts,
            userReaction: userReaction?.type || null,
            commentPreview: comments,
          };
        }));
      }),

    getDrafts: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserDraftPosts(ctx.user.id);
    }),

    publishPost: protectedProcedure
      .input(z.object({
        postId: z.string(),
        caption: z.string().optional(),
        visibility: z.enum(['private', 'cohort', 'community', 'network']),
      }))
      .mutation(async ({ ctx, input }) => {
        if (input.caption) {
          const scan = await invokeLLM({
            messages: [{
              role: 'system',
              content: 'Screen this real estate social post for Fair Housing violations, discriminatory language, or inappropriate content. Return JSON: {"result": "pass"|"flag", "reason": "string or null"}',
            }, {
              role: 'user',
              content: input.caption,
            }],
          });
          const rawContent = scan.choices[0]?.message?.content || '{"result":"pass"}';
          const text = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
          try {
            const result = JSON.parse(text.replace(/```json?|```/g, '').trim());
            if (result.result === 'flag') {
              throw new Error(`Caption flagged: ${result.reason}`);
            }
          } catch (e: any) {
            if (e.message.includes('Caption flagged')) throw e;
          }
        }
        await db.publishPost(input.postId, ctx.user.id, {
          caption: input.caption,
          visibility: input.visibility,
        });
        return { success: true };
      }),

    discardDraft: protectedProcedure
      .input(z.object({ postId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.deletePost(input.postId, ctx.user.id);
        return { success: true };
      }),

    deletePost: protectedProcedure
      .input(z.object({ postId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.deletePost(input.postId, ctx.user.id);
        return { success: true };
      }),

    react: protectedProcedure
      .input(z.object({
        postId: z.string(),
        type: z.enum(['fire', 'leveling_up', 'lets_go', 'been_there', 'coach_feature']),
      }))
      .mutation(async ({ ctx, input }) => {
        if (input.type === 'coach_feature') {
          const profile = await db.getAgentProfile(ctx.user.id);
          if (!profile?.coachMode) throw new Error('Only coaches can feature posts');
          await db.featurePost(input.postId, ctx.user.id);
        }
        await db.addReaction(input.postId, ctx.user.id, input.type);
        return { success: true };
      }),

    getPostDetail: protectedProcedure
      .input(z.object({ postId: z.string() }))
      .query(async ({ ctx, input }) => {
        const [post, reactions, comments] = await Promise.all([
          db.getJourneyPost(input.postId),
          db.getPostReactions(input.postId),
          db.getPostComments(input.postId),
        ]);
        if (!post) throw new Error('Post not found');
        const enrichedComments = await Promise.all(
          comments.map(async (c) => {
            const profile = await db.getAgentProfile(c.userId);
            return {
              ...c,
              author: {
                name: profile?.name || 'Agent',
                currentLevel: profile?.currentLevel || 1,
                isCoach: profile?.coachMode || false,
              },
            };
          })
        );
        return { post, reactions, comments: enrichedComments };
      }),

    addComment: protectedProcedure
      .input(z.object({
        postId: z.string(),
        body: z.string().min(1).max(500),
        myExperience: z.string().optional(),
        whatHelped: z.string().optional(),
        parentCommentId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const textToScreen = [input.body, input.myExperience, input.whatHelped]
          .filter(Boolean).join(' ');
        const scan = await invokeLLM({
          messages: [{
            role: 'system',
            content: 'Screen this comment for Fair Housing violations or inappropriate content. Return JSON: {"result": "pass"|"flag", "reason": "string or null"}',
          }, {
            role: 'user',
            content: textToScreen,
          }],
        });
        const rawComment = scan.choices[0]?.message?.content || '{"result":"pass"}';
        const text = typeof rawComment === 'string' ? rawComment : JSON.stringify(rawComment);
        let flagged = false;
        try {
          const result = JSON.parse(text.replace(/```json?|```/g, '').trim());
          flagged = result.result === 'flag';
        } catch {}
        await db.createComment({
          commentId: nanoid(12),
          postId: input.postId,
          userId: ctx.user.id,
          body: input.body,
          myExperience: input.myExperience,
          whatHelped: input.whatHelped,
          parentCommentId: input.parentCommentId,
          isApproved: !flagged,
          flaggedForReview: flagged,
        });
        if (flagged) {
          throw new Error('Your comment was flagged for review and will be visible after approval.');
        }
        return { success: true };
      }),

    follow: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.followUser(ctx.user.id, input.userId);
        return { success: true };
      }),

    unfollow: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.unfollowUser(ctx.user.id, input.userId);
        return { success: true };
      }),

    myTimeline: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserJourneyPosts(ctx.user.id)
        .then(posts => posts.filter(p => p.isPublished));
    }),
  }),

  // ════════════════════════════════════════════════════════════════
  // Phase 10 — AI Tools Directory
  // ════════════════════════════════════════════════════════════════
  tools: router({
    list: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        savedOnly: z.boolean().optional(),
        integrationStatus: z.string().optional(),
        relevantToMyLevel: z.boolean().optional(),
      }))
      .query(async ({ ctx, input }) => {
        let tools = await db.getAllTools({
          category: input.category,
          integrationStatus: input.integrationStatus,
        });
        if (input.relevantToMyLevel) {
          const profile = await db.getAgentProfile(ctx.user.id);
          const level = profile?.currentLevel ?? 1;
          tools = tools.filter(t => {
            const levels = t.relevantLevels as number[] | null;
            return !levels || levels.includes(level);
          });
        }
        if (input.search) {
          const q = input.search.toLowerCase();
          tools = tools.filter(t =>
            t.name.toLowerCase().includes(q) ||
            t.tagline.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            ((t.tags as string[]) || []).some(tag => tag.includes(q))
          );
        }
        const dbInstance = await db.getDb();
        const [saves, upvotes] = await Promise.all([
          db.getUserSavedTools(ctx.user.id).then(s => s.map(t => t.toolId)),
          dbInstance ? dbInstance.select().from(schema.toolUpvotes)
            .where(eq(schema.toolUpvotes.userId, ctx.user.id))
            .then(rows => rows.map(r => r.toolId)) : Promise.resolve([]),
        ]);
        const enriched = tools.map(t => ({
          ...t,
          isSaved: saves.includes(t.toolId),
          hasUpvoted: upvotes.includes(t.toolId),
        }));
        if (input.savedOnly) {
          return enriched.filter(t => t.isSaved);
        }
        return enriched;
      }),

    get: protectedProcedure
      .input(z.object({ toolId: z.string() }))
      .query(async ({ ctx, input }) => {
        const tool = await db.getTool(input.toolId);
        if (!tool || !tool.isApproved) throw new Error('Tool not found');
        const dbInstance = await db.getDb();
        const [saves, upvotes] = await Promise.all([
          db.getUserSavedTools(ctx.user.id).then(s => s.map(t => t.toolId)),
          dbInstance ? dbInstance.select().from(schema.toolUpvotes)
            .where(and(
              eq(schema.toolUpvotes.userId, ctx.user.id),
              eq(schema.toolUpvotes.toolId, input.toolId)
            )) : Promise.resolve([]),
        ]);
        return {
          ...tool,
          isSaved: saves.includes(tool.toolId),
          hasUpvoted: upvotes.length > 0,
        };
      }),

    toggleSave: protectedProcedure
      .input(z.object({ toolId: z.string(), notes: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const saves = await db.getUserSavedTools(ctx.user.id);
        const isSaved = saves.some(t => t.toolId === input.toolId);
        if (isSaved) {
          await db.unsaveTool(ctx.user.id, input.toolId);
          return { saved: false };
        } else {
          await db.saveTool(ctx.user.id, input.toolId, input.notes);
          return { saved: true };
        }
      }),

    toggleUpvote: protectedProcedure
      .input(z.object({ toolId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return db.upvoteTool(ctx.user.id, input.toolId);
      }),

    submit: protectedProcedure
      .input(z.object({
        toolName: z.string().min(2).max(100),
        toolUrl: z.string().url(),
        category: z.string().optional(),
        description: z.string().optional(),
        whyRecommend: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.submitTool({
          submissionId: nanoid(12),
          submittedBy: ctx.user.id,
          ...input,
          status: 'pending',
        });
        return { success: true };
      }),

    myRecommendations: protectedProcedure.query(async ({ ctx }) => {
      return db.getAgentToolRecommendations(ctx.user.id);
    }),

    recommendToClient: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        toolId: z.string(),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const rel = await db.getCoachRelationshipForPair(ctx.user.id, input.agentId);
        if (!rel || rel.status !== 'active') throw new Error('Not authorized');
        await db.addCoachRecommendation({
          coachId: ctx.user.id,
          agentId: input.agentId,
          toolId: input.toolId,
          note: input.note,
        });
        return { success: true };
      }),

    getClickStats: protectedProcedure
      .input(z.object({ toolId: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getToolClickStats(input.toolId);
      }),
  }),
  models: router({
    list: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        relevantToMyLevel: z.boolean().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const models = await db.getModelLibrary(input.category);
        if (!input.relevantToMyLevel) return models;
        const profile = await db.getAgentProfile(ctx.user.id);
        const level = profile?.currentLevel ?? 1;
        return models.filter(m => {
          const levels = m.relevantLevels as number[] | null;
          return !levels || levels.includes(level);
        });
      }),

    get: protectedProcedure
      .input(z.object({ modelId: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getModel(input.modelId);
      }),

    setOneThing: protectedProcedure
      .input(z.object({
        period: z.enum(['daily', 'weekly', 'monthly', 'annual']),
        focusingQuestion: z.string(),
        statement: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.deactivateOneThing(ctx.user.id, input.period);
        await db.createOneThing({ userId: ctx.user.id, ...input, isActive: true });
        return { success: true };
      }),

    getOneThings: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserOneThings(ctx.user.id);
    }),

    completeOneThing: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.completeOneThing(input.id, ctx.user.id);
        return { success: true };
      }),

    saveGPS: protectedProcedure
      .input(z.object({
        planId: z.string().optional(),
        quarter: z.string(),
        goal: z.string(),
        priority1: z.string().optional(),
        priority1Strategies: z.array(z.string()).optional(),
        priority2: z.string().optional(),
        priority2Strategies: z.array(z.string()).optional(),
        priority3: z.string().optional(),
        priority3Strategies: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const planId = input.planId || nanoid(16);
        await db.upsertGPSPlan({ ...input, planId, userId: ctx.user.id, isComplete: false });
        return { planId };
      }),

    getGPS: protectedProcedure
      .input(z.object({ quarter: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getUserGPSPlans(ctx.user.id, input.quarter);
      }),

    saveBoldGoal: protectedProcedure
      .input(z.object({
        year: z.number(),
        goal: z.string(),
        whyItMatters: z.string().optional(),
        measurableOutcome: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertBoldGoal({ userId: ctx.user.id, ...input, isAchieved: false });
        return { success: true };
      }),

    getBoldGoal: protectedProcedure
      .input(z.object({ year: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getUserBoldGoal(ctx.user.id, input.year);
      }),

    enroll8x8: protectedProcedure
      .input(z.object({ leadId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const enrollmentId = nanoid(16);
        await db.createEightByEight({
          enrollmentId, userId: ctx.user.id,
          leadId: input.leadId, completedTouches: [],
          currentTouch: 1, status: 'active',
        });
        return { enrollmentId };
      }),

    completeTouch: protectedProcedure
      .input(z.object({
        enrollmentId: z.string(),
        touchNumber: z.number(),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.completeEightByEightTouch(
          input.enrollmentId, ctx.user.id,
          input.touchNumber, input.note
        );
        return { success: true };
      }),

    getActive8x8: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserActive8x8(ctx.user.id);
    }),

    enroll33Touch: protectedProcedure
      .input(z.object({ leadId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const year = new Date().getFullYear();
        await db.createThirtyThreeTouch({
          userId: ctx.user.id, leadId: input.leadId, year,
          touchLog: [], touchesCompleted: 0, isActive: true,
          nextTouchDue: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        });
        return { success: true };
      }),

    logTouch: protectedProcedure
      .input(z.object({
        leadId: z.string(),
        touchType: z.string(),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.logThirtyThreeTouch(ctx.user.id, input.leadId, {
          type: input.touchType, date: new Date(), note: input.note,
        });
        return { success: true };
      }),

    get33TouchStatus: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserThirtyThreeTouchStatus(ctx.user.id);
    }),

    calculate36123: protectedProcedure
      .input(z.object({
        metDatabaseSize: z.number(),
        currentAnnualContacts: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const { metDatabaseSize, currentAnnualContacts } = input;
        const targetContacts = metDatabaseSize * 36;
        const expectedTransactions = Math.floor(metDatabaseSize / 100 * 3);
        const currentExpected = Math.floor(
          (currentAnnualContacts / Math.max(targetContacts, 1)) * expectedTransactions
        );
        const weeklyContactsNeeded = Math.ceil(targetContacts / 52);
        const currentWeekly = Math.ceil(currentAnnualContacts / 52);
        return {
          targetContacts, currentAnnualContacts,
          gap: targetContacts - currentAnnualContacts,
          expectedTransactions, currentExpectedTransactions: currentExpected,
          transactionGap: expectedTransactions - currentExpected,
          weeklyContactsNeeded, currentWeekly,
          weeklyGap: weeklyContactsNeeded - currentWeekly,
        };
      }),

    saveTTSA: protectedProcedure
      .input(z.object({
        id: z.number().optional(),
        teamMemberName: z.string(),
        role: z.string().optional(),
        talentScore: z.number().min(1).max(5).optional(),
        talentNotes: z.string().optional(),
        trainingStatus: z.enum(['not_started', 'in_progress', 'complete', 'needs_refresh']).optional(),
        currentTraining: z.string().optional(),
        systemsOwned: z.array(z.string()).optional(),
        accountabilityMethod: z.string().optional(),
        gwcGetsIt: z.boolean().optional(),
        gwcWantsIt: z.boolean().optional(),
        gwcCapacity: z.boolean().optional(),
        discProfile: z.string().optional(),
        careerVision: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertTTSA({ userId: ctx.user.id, ...input } as Parameters<typeof db.upsertTTSA>[0]);
        return { success: true };
      }),

    getTTSAProfiles: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserTTSAProfiles(ctx.user.id);
    }),

    deleteTTSA: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteTTSAProfile(input.id, ctx.user.id);
        return { success: true };
      }),

    saveTeamEconomicModel: protectedProcedure
      .input(z.object({
        teamGciGoal: z.number(),
        avgSalePrice: z.number(),
        teamCommissionRate: z.number(),
        teamSplitToAgents: z.number(),
        leaderGciTarget: z.number(),
        staffingCosts: z.number(),
        marketingBudget: z.number(),
        techBudget: z.number(),
        otherExpenses: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const targetNetProfit =
          input.teamGciGoal * (1 - input.teamSplitToAgents) -
          input.staffingCosts - input.marketingBudget -
          input.techBudget - input.otherExpenses;
        await db.upsertTeamEconomicModel({
          userId: ctx.user.id,
          teamGciGoal: String(input.teamGciGoal),
          avgSalePrice: String(input.avgSalePrice),
          teamCommissionRate: String(input.teamCommissionRate),
          teamSplitToAgents: String(input.teamSplitToAgents),
          leaderGciTarget: String(input.leaderGciTarget),
          staffingCosts: String(input.staffingCosts),
          marketingBudget: String(input.marketingBudget),
          techBudget: String(input.techBudget),
          otherExpenses: String(input.otherExpenses),
          targetNetProfit: String(targetNetProfit),
        });
        return { success: true };
      }),

    getTeamEconomicModel: protectedProcedure.query(async ({ ctx }) => {
      return db.getTeamEconomicModel(ctx.user.id);
    }),

    saveAccountabilityAssessment: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        sessionId: z.string().optional(),
        commitmentDescription: z.string(),
        ladderLevel: z.enum([
          'blame', 'justification', 'shame',
          'obligation', 'responsibility', 'accountability', 'ownership',
        ]),
        coachNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createAccountabilityAssessment({
          assessmentId: nanoid(12), coachId: ctx.user.id, ...input,
        });
        return { success: true };
      }),

    getAgentAccountabilityHistory: protectedProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getAgentAccountabilityHistory(input.agentId, ctx.user.id);
      }),

    startSessionRunner: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.initSessionRunner({
          sessionId: input.sessionId,
          currentSegment: 0,
          segmentStartedAt: new Date(),
          notes: {},
          isComplete: false,
        });
        return { success: true };
      }),

    advanceSessionSegment: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.advanceSessionSegment(input.sessionId, input.notes);
      }),

    getSessionRunnerState: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getSessionRunnerState(input.sessionId);
      }),

    getDatabaseHealthScore: protectedProcedure.query(async ({ ctx }) => {
      return db.getDatabaseHealthScore(ctx.user.id);
    }),
  }),

  // ============================================================
  // WEALTH JOURNEY (Phase 8)
  // ============================================================
  wealth: wealthRouter,
  calendar: calendarRouter,
  schedule: scheduleRouter,

  // ============================================================
  // WEEKLY PULSE (Phase 7b)
  // ============================================================
  weeklyPulse: router({
    save: protectedProcedure
      .input(z.object({
        contactsMade: z.number().default(0),
        appointmentsSet: z.number().default(0),
        appointmentsHeld: z.number().default(0),
        buyerAgreements: z.number().default(0),
        listingAppointments: z.number().default(0),
        listingAgreements: z.number().default(0),
        contractsWritten: z.number().default(0),
        closings: z.number().default(0),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const weekEnding = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        await db.saveWeeklyPulse({
          userId: ctx.user.id,
          weekEnding,
          contactsMade: input.contactsMade,
          appointmentsSet: input.appointmentsSet,
          appointmentsHeld: input.appointmentsHeld,
          buyerAgreements: input.buyerAgreements,
          listingAppointments: input.listingAppointments,
          listingAgreements: input.listingAgreements,
          contractsWritten: input.contractsWritten,
          closings: input.closings,
          notes: input.notes,
        });
        // Fire-and-forget Drive sync — don't let Drive failure break the save
        syncWeeklyPulse(ctx.user.id, {
          weekEnding,
          contactsMade: input.contactsMade ?? 0,
          appointmentsSet: input.appointmentsSet ?? 0,
          appointmentsHeld: input.appointmentsHeld ?? 0,
          buyerAgreements: input.buyerAgreements ?? 0,
          listingAppointments: input.listingAppointments ?? 0,
          listingAgreements: input.listingAgreements ?? 0,
          contractsWritten: input.contractsWritten ?? 0,
          closings: input.closings ?? 0,
          notes: input.notes ?? '',
        }).catch(err => console.error('[Drive] Weekly pulse sync failed:', err));
        return { success: true, weekEnding };
      }),
    history: protectedProcedure
      .input(z.object({ limit: z.number().default(12) }))
      .query(async ({ ctx, input }) => {
        return db.getWeeklyPulses(ctx.user.id, input.limit);
      }),
  }),

  // ============================================================
  // GOOGLE DRIVE INTEGRATION (Phase 7)
  // ============================================================
  drive: router({
    getAuthUrl: protectedProcedure.query(() => {
      return { url: getAuthUrl() };
    }),
    callback: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const tokens = await exchangeCodeForTokens(input.code);
        await db.saveDriveTokens(
          ctx.user.id,
          tokens.access_token!,
          tokens.refresh_token!,
          tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
        );
        const profile = await db.getAgentProfile(ctx.user.id);
        await provisionAgentFolder(
          ctx.user.id,
          (profile as any)?.name ?? 'Agent',
          (profile as any)?.email ?? ''
        );
        return { success: true };
      }),
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const tokens = await db.getDriveTokens(ctx.user.id);
      return { connected: !!tokens, hasFolders: !!tokens?.rootFolderId };
    }),
    syncNow: protectedProcedure.mutation(async ({ ctx }) => {
      const [profile, deliverables, leads] = await Promise.all([
        db.getAgentProfile(ctx.user.id),
        db.getUserDeliverables(ctx.user.id),
        db.getUserLeads(ctx.user.id),
      ]);
      if (profile) {
        await syncEconomicModel(ctx.user.id, {
          'Income Goal': (profile as any).incomeGoal ?? 0,
          'Current Level': (profile as any).currentLevel ?? 1,
          'Deliverables Complete': deliverables.filter((d: any) => d.isComplete).length,
          'Active Leads': leads.filter((l: any) => l.stage !== 'closed').length,
        });
      }
      return { success: true };
    }),
     buildMCDashboard: protectedProcedure
      .input(z.object({ agentUserIds: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getAgentProfile(ctx.user.id);
        const result = await buildMCRollup(
          ctx.user.id,
          (profile as any)?.marketCenter ?? 'Market Center',
          input.agentUserIds
        );
        return result;
      }),
  }),
  // ============================================================
  // MARKET CENTER OPERATOR ROUTER (HIGH-09)
  // ============================================================
  mc: router({
    // Gate: only mc_op or admin can list agents in their market center
    getAgents: protectedProcedure.query(async ({ ctx }) => {
      const conn = await db.getDb();
      if (!conn) return [];
      const [profile] = await conn.select().from(schema.agentProfiles)
        .where(eq(schema.agentProfiles.userId, ctx.user.id)).limit(1);
      if (!['mc_op', 'admin'].includes((profile as any)?.agentRole ?? '')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'MC Operator access required' });
      }
      if (!(profile as any)?.marketCenterId) return [];
      return conn.select().from(schema.agentProfiles)
        .where(eq(schema.agentProfiles.marketCenterId, (profile as any).marketCenterId));
    }),
    updateMarketCenter: protectedProcedure
      .input(z.object({
        marketCenterId: z.string().optional(),
        marketCenterName: z.string().optional(),
        agentRole: z.enum(['agent', 'coach', 'mc_op', 'team_leader', 'admin']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const conn = await db.getDb();
        if (!conn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await conn.update(schema.agentProfiles)
          .set({ ...input, updatedAt: new Date() } as any)
          .where(eq(schema.agentProfiles.userId, ctx.user.id));
        return { success: true };
      }),
  }),
});
export type AppRouter = typeof appRouter;
