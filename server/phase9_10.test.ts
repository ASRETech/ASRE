import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-p9",
    email: "agent@test.com",
    name: "Test Agent",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { headers: {} } as any,
    res: { clearCookie: () => {} } as any,
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: { headers: {} } as any,
    res: { clearCookie: () => {} } as any,
  };
}

const caller = appRouter.createCaller(createAuthContext());
const anonCaller = appRouter.createCaller(createUnauthContext());

// ── Phase 9: Journey Feed ──────────────────────────────────────────

describe("Phase 9 — Journey Feed", () => {
  it("journey.getFeed returns an array", async () => {
    const feed = await caller.journey.getFeed({ limit: 10, offset: 0 });
    expect(Array.isArray(feed)).toBe(true);
  });

  it("journey.getDrafts returns an array", async () => {
    const drafts = await caller.journey.getDrafts();
    expect(Array.isArray(drafts)).toBe(true);
  });

  it("journey.myTimeline returns an array", async () => {
    const timeline = await caller.journey.myTimeline();
    expect(Array.isArray(timeline)).toBe(true);
  });

  it("journey.publishPost handles non-existent post gracefully", async () => {
    const result = await caller.journey.publishPost({
      postId: "nonexistent-post-id",
      visibility: "community",
    });
    expect(result).toBeDefined();
  });

  it("journey.react handles non-existent post gracefully", async () => {
    const result = await caller.journey.react({
      postId: "nonexistent-post-id",
      type: "fire",
    });
    expect(result).toBeDefined();
  });
});

// ── Phase 10: AI Tools Directory ───────────────────────────────────

describe("Phase 10 — AI Tools Directory", () => {
  it("tools.list returns seeded tools", async () => {
    const tools = await caller.tools.list({});
    expect(Array.isArray(tools)).toBe(true);
    // Seed should have populated at least 20 tools
    expect(tools.length).toBeGreaterThanOrEqual(20);
  });

  it("tools.list filters by category", async () => {
    const tools = await caller.tools.list({ category: "lead_generation" });
    expect(Array.isArray(tools)).toBe(true);
    for (const t of tools) {
      expect(t.category).toBe("lead_generation");
    }
  });

  it("tools.list filters by search term", async () => {
    const tools = await caller.tools.list({ search: "Claude" });
    expect(Array.isArray(tools)).toBe(true);
    // Should find Claude in the results
    const hasMatch = tools.some(
      (t: any) =>
        t.name.toLowerCase().includes("claude") ||
        t.tagline?.toLowerCase().includes("claude") ||
        t.description?.toLowerCase().includes("claude")
    );
    expect(hasMatch).toBe(true);
  });

  it("tools.myRecommendations returns an array", async () => {
    const recs = await caller.tools.myRecommendations();
    expect(Array.isArray(recs)).toBe(true);
  });

  it("tools.submit creates a submission", async () => {
    const result = await caller.tools.submit({
      toolName: "TestTool",
      toolUrl: "https://testtool.com",
      category: "ai_writing",
      description: "A test tool",
      whyRecommend: "It's great for testing",
    });
    expect(result.success).toBe(true);
  });

  it("tools.toggleSave works for a seeded tool", async () => {
    const tools = await caller.tools.list({});
    if (tools.length === 0) return; // skip if no tools
    const firstTool = tools[0];
    const result = await caller.tools.toggleSave({ toolId: firstTool.toolId });
    expect(typeof result.saved).toBe("boolean");
  });

  it("tools.toggleUpvote works for a seeded tool", async () => {
    const tools = await caller.tools.list({});
    if (tools.length === 0) return;
    const firstTool = tools[0];
    const result = await caller.tools.toggleUpvote({ toolId: firstTool.toolId });
    expect(typeof result.voted).toBe("boolean");
  });

  it("tools.getClickStats returns stats for a seeded tool", async () => {
    const tools = await caller.tools.list({});
    if (tools.length === 0) return;
    const firstTool = tools[0];
    const stats = await caller.tools.getClickStats({ toolId: firstTool.toolId });
    expect(stats).toBeDefined();
  });
});
