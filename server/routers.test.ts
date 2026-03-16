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
  getUserComplianceLogs: vi.fn().mockResolvedValue([]),
  insertComplianceLog: vi.fn().mockResolvedValue(undefined),
  getUserCultureDoc: vi.fn().mockResolvedValue(undefined),
  upsertCultureDoc: vi.fn().mockResolvedValue(undefined),
  insertCoachingLog: vi.fn().mockResolvedValue(undefined),
  getUserCoachingLogs: vi.fn().mockResolvedValue([]),
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
    // Returns undefined since mock returns undefined (no profile yet)
    expect(result).toBeUndefined();
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

describe("compliance", () => {
  it("scans text for fair housing issues via AI", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.compliance.scan({
      inputText: "Beautiful home in a family-friendly neighborhood",
    });

    expect(result).toHaveProperty("result");
    expect(typeof result.result).toBe("string");
  });

  it("lists compliance logs", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.compliance.list();
    expect(Array.isArray(result)).toBe(true);
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
