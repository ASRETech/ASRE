import { describe, expect, it, vi, beforeEach } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createAuthContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: 'test-user-1',
    email: 'test@example.com',
    name: 'Test Agent',
    loginMethod: 'manus',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: 'https', headers: {} } as TrpcContext['req'],
    res: {
      clearCookie: () => {},
    } as TrpcContext['res'],
  };
}

// Mock the db module so tests don't hit the real database
vi.mock('./db', () => {
  const mockSubscription = {
    subscriptionId: 'sub-1',
    userId: 1,
    tier: 'self_guided',
    status: 'trialing',
    monthlyPriceCents: 9700,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    trialEndsAt: new Date(Date.now() + 14 * 86400000),
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
    cancelAtPeriodEnd: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCertification = {
    certificationId: 'cert-1',
    userId: 1,
    status: 'not_started',
    moduleProgress: { m1: false, m2: false, m3: false, m4: false, m5: false },
    startedAt: null,
    certifiedAt: null,
    renewalDueAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession = {
    sessionId: 'sess-1',
    coachId: 1,
    agentId: 2,
    type: 'one_on_one',
    scheduledAt: new Date(Date.now() + 86400000),
    completedAt: null,
    coachNotes: null,
    clientSummary: null,
    rating: null,
    zoomLink: 'https://zoom.us/j/test',
    preBriefSentAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCommitment = {
    commitmentId: 'commit-1',
    sessionId: 'sess-1',
    agentId: 2,
    coachId: 1,
    text: 'Write EA scorecard by Friday',
    dueDate: new Date(Date.now() + 5 * 86400000),
    isComplete: false,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    getSubscription: vi.fn().mockResolvedValue(mockSubscription),
    createSubscription: vi.fn().mockResolvedValue(undefined),
    updateSubscription: vi.fn().mockResolvedValue(undefined),
    getCoachCertification: vi.fn().mockResolvedValue(mockCertification),
    upsertCoachCertification: vi.fn().mockResolvedValue(undefined),
    getAgentProfile: vi.fn().mockResolvedValue({
      userId: 1, name: 'Test Agent', currentLevel: 2, brokerage: 'KW',
      incomeGoal: 250000, gciLastYear: 100000, teamSize: 1, yearsExperience: 3,
    }),
    getCoachAgents: vi.fn().mockResolvedValue([]),
    getCoachCohorts: vi.fn().mockResolvedValue([]),
    getCoachUpcomingSessions: vi.fn().mockResolvedValue([mockSession]),
    getCoachAllSessions: vi.fn().mockResolvedValue([mockSession]),
    getAgentCommitments: vi.fn().mockResolvedValue([mockCommitment]),
    getAgentSessions: vi.fn().mockResolvedValue([mockSession]),
    getAgentActiveCohort: vi.fn().mockResolvedValue(null),
    markCommitmentComplete: vi.fn().mockResolvedValue(undefined),
    updateSession: vi.fn().mockResolvedValue(undefined),
    createSession: vi.fn().mockResolvedValue(undefined),
    createCommitment: vi.fn().mockResolvedValue(undefined),
    getAgentCoachComments: vi.fn().mockResolvedValue([]),
    getUserDeliverables: vi.fn().mockResolvedValue([]),
    upsertAgentProfile: vi.fn().mockResolvedValue(undefined),
    addCoachComment: vi.fn().mockResolvedValue(undefined),
    createCoachInvite: vi.fn().mockResolvedValue(undefined),
    getCoachAgentDetail: vi.fn().mockResolvedValue(null),
  };
});

describe('subscriptions router', () => {
  it('subscriptions.get returns current subscription', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.subscriptions.get();
    expect(result).toBeDefined();
    expect(result.tier).toBe('self_guided');
    expect(result.status).toBe('trialing');
  });
});

describe('certifications router', () => {
  it('certifications.get returns certification state', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.certifications.get();
    expect(result).toBeDefined();
    expect(result!.status).toBe('not_started');
    expect(result!.moduleProgress).toHaveProperty('m1');
  });

  it('certifications.start initializes certification', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.certifications.start();
    expect(result).toEqual({ success: true });
  });

  it('certifications.completeModule marks a module done', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.certifications.completeModule({ module: 'm1' });
    expect(result).toEqual({ success: true });
  });
});

describe('coachPortal agent-side endpoints', () => {
  it('coachPortal.myCommitments returns commitments', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.coachPortal.myCommitments();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it('coachPortal.mySessions returns sessions', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.coachPortal.mySessions();
    expect(Array.isArray(result)).toBe(true);
  });

  it('coachPortal.myCohort returns cohort or null', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.coachPortal.myCohort();
    // Could be null if no cohort assigned
    expect(result === null || typeof result === 'object').toBe(true);
  });

  it('coachPortal.completeCommitment marks commitment done', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.coachPortal.completeCommitment({ commitmentId: 'commit-1' });
    expect(result).toEqual({ success: true });
  });
});
