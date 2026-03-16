import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { nanoid } from "nanoid";

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
  // COMPLIANCE
  // ============================================================
  compliance: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserComplianceLogs(ctx.user.id);
    }),
    scan: protectedProcedure
      .input(z.object({ inputText: z.string() }))
      .mutation(async ({ ctx, input }) => {
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
            { role: "user", content: input.inputText },
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
        let parsed: any = null;
        try {
          parsed = JSON.parse(typeof content === "string" ? content : "{}");
        } catch {
          parsed = { result: "pass", flaggedItems: [], summary: content || "Unable to parse response" };
        }

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
  // CALENDAR (Phase 4) — settings only, no actual Google sync
  // ============================================================
  calendar: router({
    getToken: protectedProcedure.query(async ({ ctx }) => {
      return db.getCalendarToken(ctx.user.id);
    }),
    upsertToken: protectedProcedure
      .input(z.object({
        provider: z.string().optional(),
        calendarId: z.string().optional(),
        syncEnabled: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertCalendarToken({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
