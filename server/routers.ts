import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";

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
      return db.getAgentProfile(ctx.user.id);
    }),
    upsert: protectedProcedure
      .input(z.object({
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
        nextAction: z.string().optional(),
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
          nextAction: z.string().optional(),
          notes: z.string().optional(),
          lastContactedAt: z.date().optional(),
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
    create: protectedProcedure
      .input(z.object({
        transactionId: z.string(),
        propertyAddress: z.string(),
        clientName: z.string().optional(),
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
      }))
      .mutation(async ({ ctx, input }) => {
        await db.insertFinancialEntry({ ...input, userId: ctx.user.id });
        return { success: true };
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
  // COMPLIANCE
  // ============================================================
  compliance: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserComplianceLogs(ctx.user.id);
    }),
    scan: protectedProcedure
      .input(z.object({
        inputText: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // AI-powered Fair Housing compliance scan
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a Fair Housing compliance expert. Analyze the following real estate marketing text for potential Fair Housing Act violations. Check for discriminatory language related to race, color, religion, national origin, sex, familial status, or disability. Also check for steering language, exclusionary terms, or preferential treatment indicators.

Return a JSON object with:
- result: "pass" | "warning" | "fail"
- flaggedItems: array of objects with { text: string, reason: string, severity: "low" | "medium" | "high" }
- summary: brief overall assessment`,
            },
            {
              role: "user",
              content: input.inputText,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "compliance_scan",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  result: { type: "string", enum: ["pass", "warning", "fail"] },
                  flaggedItems: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string" },
                        reason: { type: "string" },
                        severity: { type: "string", enum: ["low", "medium", "high"] },
                      },
                      required: ["text", "reason", "severity"],
                      additionalProperties: false,
                    },
                  },
                  summary: { type: "string" },
                },
                required: ["result", "flaggedItems", "summary"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        const parsed = typeof content === "string" ? JSON.parse(content) : null;

        if (parsed) {
          await db.insertComplianceLog({
            userId: ctx.user.id,
            inputText: input.inputText,
            result: parsed.result,
            flaggedItems: parsed.flaggedItems,
          });
        }

        return parsed;
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
});

export type AppRouter = typeof appRouter;
