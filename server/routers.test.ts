import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test Agent",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Mock the db module
vi.mock("./db", () => ({
  getDb: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getAgentProfile: vi.fn().mockResolvedValue(undefined),
  upsertAgentProfile: vi.fn().mockResolvedValue(undefined),
  getUserDeliverables: vi.fn().mockResolvedValue([]),
  upsertDeliverable: vi.fn().mockResolvedValue(undefined),
  bulkInsertDeliverables: vi.fn().mockResolvedValue(undefined),
  getUserLeads: vi.fn().mockResolvedValue([]),
  insertLead: vi.fn().mockResolvedValue(undefined),
  updateLead: vi.fn().mockResolvedValue(undefined),
  deleteLead: vi.fn().mockResolvedValue(undefined),
  getUserTransactions: vi.fn().mockResolvedValue([]),
  insertTransaction: vi.fn().mockResolvedValue(undefined),
  updateTransaction: vi.fn().mockResolvedValue(undefined),
  getUserFinancials: vi.fn().mockResolvedValue([]),
  insertFinancialEntry: vi.fn().mockResolvedValue(undefined),
  getUserSOPs: vi.fn().mockResolvedValue([]),
  insertSOP: vi.fn().mockResolvedValue(undefined),
  updateSOP: vi.fn().mockResolvedValue(undefined),
  getUserCultureDoc: vi.fn().mockResolvedValue(undefined),
  upsertCultureDoc: vi.fn().mockResolvedValue(undefined),
  insertCoachingLog: vi.fn().mockResolvedValue(undefined),
  getUserCoachingLogs: vi.fn().mockResolvedValue([]),
  // Phase 4 mocks
  getCalendarToken: vi.fn().mockResolvedValue(undefined),
  upsertCalendarToken: vi.fn().mockResolvedValue(undefined),
  getCoachRelationships: vi.fn().mockResolvedValue([]),
  getCoachRelationshipByToken: vi.fn().mockResolvedValue(undefined),
  getCoachRelationshipForPair: vi.fn().mockResolvedValue(undefined),
  updateCoachRelationship: vi.fn().mockResolvedValue(undefined),
  getAgentCoachComments: vi.fn().mockResolvedValue([]),
  getUserRecruits: vi.fn().mockResolvedValue([]),
  insertRecruit: vi.fn().mockResolvedValue(undefined),
  updateRecruit: vi.fn().mockResolvedValue(undefined),
  deleteRecruit: vi.fn().mockResolvedValue(undefined),
  getTransactionComms: vi.fn().mockResolvedValue([]),
  getTransactionCommsPublic: vi.fn().mockResolvedValue([]),
  getTransaction: vi.fn().mockResolvedValue(undefined),
  getTransactionPublic: vi.fn().mockResolvedValue(undefined),
  getPortalToken: vi.fn().mockResolvedValue(undefined),
  getReferralPartners: vi.fn().mockResolvedValue([]),
  updateReferralPartner: vi.fn().mockResolvedValue(undefined),
  getReferralExchanges: vi.fn().mockResolvedValue([]),
  getUserReviews: vi.fn().mockResolvedValue([]),
  updateReview: vi.fn().mockResolvedValue(undefined),
  getFinancialEntriesByYear: vi.fn().mockResolvedValue([]),
  getBrokerageConfig: vi.fn().mockResolvedValue(undefined),
  upsertBrokerageConfig: vi.fn().mockResolvedValue(undefined),
  createCoachComment: vi.fn().mockResolvedValue(undefined),
  createCoachRelationship: vi.fn().mockResolvedValue("test-token-123"),
  createPortalLink: vi.fn().mockResolvedValue(undefined),
  createPortalToken: vi.fn().mockResolvedValue("portal-token-123"),
  createReferralExchange: vi.fn().mockResolvedValue(undefined),
  createReferralPartner: vi.fn().mockResolvedValue(undefined),
  createReview: vi.fn().mockResolvedValue(undefined),
  createTransactionComm: vi.fn().mockResolvedValue(undefined),
  incrementPartnerCount: vi.fn().mockResolvedValue(undefined),
  // Sprint A — coachProcedure tier check
  getSubscription: vi.fn().mockResolvedValue({ tier: 'one_on_one', status: 'active' }),
  // Sprint D — Vision layer + Wealth Wins helpers
  createBigWhySnapshot: vi.fn().mockResolvedValue(undefined),
  getBigWhySnapshots: vi.fn().mockResolvedValue([]),
  createWhyMoment: vi.fn().mockResolvedValue(undefined),
  getWhyMoments: vi.fn().mockResolvedValue([]),
  createWealthWin: vi.fn().mockResolvedValue(undefined),
  getWealthWins: vi.fn().mockResolvedValue([]),
  setMilestoneBlocker: vi.fn().mockResolvedValue(undefined),
}));

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    id: "test",
    created: Date.now(),
    model: "test-model",
    choices: [{
      index: 0,
      message: {
        role: "assistant",
        content: "Test coaching response about MREA framework.",
      },
      finish_reason: "stop",
    }],
  }),
}));

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
  });
});

describe("auth.me", () => {
  it("returns user when authenticated", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.openId).toBe("test-user-123");
    expect(result?.name).toBe("Test Agent");
  });

  it("returns null when unauthenticated", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("profile", () => {
  it("requires authentication for profile.get", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.profile.get()).rejects.toThrow();
  });

  it("returns profile for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.get();
    // Returns null since profile.get returns null for missing profiles
    expect(result).toBeNull();
  });

  it("upserts profile successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.upsert({
      brokerage: "Keller Williams",
      currentLevel: 1,
      incomeGoal: 250000,
      isOnboarded: true,
    });

    expect(result).toEqual({ success: true });
  });
});

describe("deliverables", () => {
  it("requires authentication", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.deliverables.list()).rejects.toThrow();
  });

  it("lists deliverables for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.deliverables.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("upserts a deliverable", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.deliverables.upsert({
      deliverableId: "l1-d1",
      level: 1,
      title: "Personal Economic Model",
      isComplete: true,
      builderData: { annualGCI: 250000 },
    });

    expect(result).toEqual({ success: true });
  });

  it("bulk initializes deliverables", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.deliverables.bulkInit([
      { deliverableId: "l1-d1", level: 1, title: "Personal Economic Model" },
      { deliverableId: "l1-d2", level: 1, title: "Database Setup" },
      { deliverableId: "l1-d3", level: 1, title: "Lead Gen Plan" },
    ]);

    expect(result).toEqual({ success: true });
  });
});

describe("leads", () => {
  it("creates a lead", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.create({
      leadId: "lead-001",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      type: "buyer",
      source: "Sphere",
      stage: "New Lead",
      budget: 350000,
    });

    expect(result).toEqual({ success: true });
  });

  it("updates a lead", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.update({
      leadId: "lead-001",
      updates: { stage: "Contacted", notes: "Called and left voicemail" },
    });

    expect(result).toEqual({ success: true });
  });

  it("deletes a lead", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.delete({ leadId: "lead-001" });
    expect(result).toEqual({ success: true });
  });
});

describe("transactions", () => {
  it("creates a transaction", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.transactions.create({
      transactionId: "txn-001",
      propertyAddress: "123 Main St, Cincinnati OH",
      clientName: "Jane Smith",
      type: "buyer",
      status: "under-contract",
      salePrice: 350000,
    });

    expect(result).toEqual({ success: true });
  });
});

describe("financials", () => {
  it("creates a financial entry", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.financials.create({
      type: "income",
      category: "Commission",
      description: "Closing on 123 Main St",
      amount: 10500,
      date: "2026-03-15",
    });

    expect(result).toEqual({ success: true });
  });
});

describe("sops", () => {
  it("creates an SOP", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sops.create({
      sopId: "sop-001",
      title: "New Listing Checklist",
      category: "Listings",
      content: "Step 1: Schedule listing appointment...",
      status: "active",
    });

    expect(result).toEqual({ success: true });
  });
});

describe("culture", () => {
  it("upserts culture doc", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.culture.upsert({
      missionStatement: "To serve families with integrity",
      visionStatement: "Top team in Cincinnati by 2028",
      coreValues: ["Integrity", "Service", "Excellence"],
    });

    expect(result).toEqual({ success: true });
  });
});

describe("coaching", () => {
  it("returns AI coaching response", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.coaching.ask({
      context: "dashboard",
      prompt: "How should I structure my morning routine for lead gen?",
      agentLevel: 1,
    });

    expect(result).toHaveProperty("response");
    expect(typeof result.response).toBe("string");
    expect(result.response.length).toBeGreaterThan(0);
  });

  it("lists coaching history", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.coaching.history({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });
});

// Phase 4 Tests

describe("coachPortal", () => {
  it("requires auth for listing agents", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.coachPortal.myAgents()).rejects.toThrow();
  });

  it("lists agents for authenticated coach", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.coachPortal.myAgents();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("recruits", () => {
  it("requires auth for listing recruits", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.recruits.list()).rejects.toThrow();
  });

  it("lists recruits for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.recruits.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates a recruit", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.recruits.create({
      recruitId: "rec-001",
      name: "Sarah Johnson",
      stage: "identified",
    });
    expect(result).toEqual({ success: true });
  });

  it("updates a recruit", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.recruits.update({
      recruitId: "rec-001",
      updates: { stage: "contacted", notes: "Had coffee meeting" },
    });
    expect(result).toEqual({ success: true });
  });

  it("deletes a recruit", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.recruits.delete({ recruitId: "rec-001" });
    expect(result).toEqual({ success: true });
  });
});

describe("referrals", () => {
  it("lists partners", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.referrals.partners.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("lists exchanges", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.referrals.exchanges.list({});
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("reviews", () => {
  it("requires auth for listing reviews", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.reviews.list()).rejects.toThrow();
  });

  it("lists reviews for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.reviews.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("brokerageConfig", () => {
  it("requires auth for getting config", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.brokerageConfig.get()).rejects.toThrow();
  });

  it("gets brokerage config", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.brokerageConfig.get();
    expect(result).toBeUndefined();
  });

  it("upserts brokerage config", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.brokerageConfig.upsert({
      brokerageName: "Keller Williams",
      framework: "MREA",
      brandColor: "#B5121B",
    });
    expect(result).toEqual({ success: true });
  });
});
