import { eq, and, desc, asc, gt, sql, or, inArray, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  agentProfiles, InsertAgentProfile,
  deliverables, InsertDeliverable,
  leads, InsertLead,
  transactions, InsertTransaction,
  financialEntries, InsertFinancialEntry,
  sops, InsertSOP,
  cultureDocs, InsertCultureDoc,
  aiCoachingLogs, InsertAICoachingLog,
  // Phase 4
  calendarTokens, InsertCalendarToken,
  coachRelationships, InsertCoachRelationship,
  coachComments, InsertCoachComment,
  recruits, InsertRecruit,
  transactionComms, InsertTransactionComm,
  clientPortalTokens, InsertClientPortalToken,
  referralPartners, InsertReferralPartner,
  referralExchanges, InsertReferralExchange,
  reviews, InsertReview,
  brokerageConfig, InsertBrokerageConfig,
  // Phase 9
  journeyPosts, InsertJourneyPost,
  journeyReactions, InsertJourneyReaction,
  journeyComments, InsertJourneyComment,
  commentLikes,
  feedConnections,
  // Phase 10
  aiTools, InsertAITool,
  toolClicks, InsertToolClick,
  toolSaves, InsertToolSave,
  toolUpvotes,
  toolSubmissions, InsertToolSubmission,
  coachToolRecommendations, InsertCoachToolRecommendation,
  // Phase 11
  oneThing, InsertOneThing,
  gpsPlans, InsertGpsPlan,
  eightByEight, InsertEightByEight,
  thirtyThreeTouch, InsertThirtyThreeTouch,
  boldGoal, InsertBoldGoal,
  ttsaProfiles, InsertTtsaProfile,
  teamEconomicModel, InsertTeamEconomicModel,
  sessionRunnerState, InsertSessionRunnerState,
  accountabilityAssessments, InsertAccountabilityAssessment,
  modelLibrary, InsertModelLibraryEntry,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================
// USERS
// ============================================================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    // Handle passwordHash for email/password auth
    if (user.passwordHash !== undefined) {
      values.passwordHash = user.passwordHash;
      updateSet.passwordHash = user.passwordHash;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// AGENT PROFILES
// ============================================================
export async function getAgentProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(agentProfiles).where(eq(agentProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertAgentProfile(data: Partial<InsertAgentProfile> & { userId: number }) {
  const db = await getDb();
  if (!db) return;
  const existing = await getAgentProfile(data.userId);
  if (existing) {
    await db.update(agentProfiles).set(data).where(eq(agentProfiles.userId, data.userId));
  } else {
    await db.insert(agentProfiles).values(data as InsertAgentProfile);
  }
}

// ============================================================
// DELIVERABLES
// ============================================================
export async function getUserDeliverables(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deliverables).where(eq(deliverables.userId, userId));
}

export async function upsertDeliverable(data: InsertDeliverable) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(deliverables)
    .where(and(eq(deliverables.userId, data.userId), eq(deliverables.deliverableId, data.deliverableId)))
    .limit(1);
  if (existing.length > 0) {
    await db.update(deliverables)
      .set(data)
      .where(and(eq(deliverables.userId, data.userId), eq(deliverables.deliverableId, data.deliverableId)));
  } else {
    await db.insert(deliverables).values(data);
  }
}

export async function bulkInsertDeliverables(items: InsertDeliverable[]) {
  const db = await getDb();
  if (!db || items.length === 0) return;
  await db.insert(deliverables).values(items);
}

// ============================================================
// LEADS
// ============================================================
export async function getUserLeads(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).where(eq(leads.userId, userId)).orderBy(desc(leads.createdAt));
}

export async function insertLead(data: InsertLead) {
  const db = await getDb();
  if (!db) return;
  await db.insert(leads).values(data);
}

export async function updateLead(userId: number, leadId: string, updates: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) return;
  await db.update(leads).set(updates).where(and(eq(leads.userId, userId), eq(leads.leadId, leadId)));
}

export async function deleteLead(userId: number, leadId: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(leads).where(and(eq(leads.userId, userId), eq(leads.leadId, leadId)));
}

// ============================================================
// TRANSACTIONS
// ============================================================
export async function getUserTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
}

export async function getTransaction(userId: number, transactionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.transactionId, transactionId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTransactionPublic(transactionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({
    propertyAddress: transactions.propertyAddress,
    clientName: transactions.clientName,
    status: transactions.status,
    closeDate: transactions.closeDate,
    type: transactions.type,
  }).from(transactions).where(eq(transactions.transactionId, transactionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function insertTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) return;
  await db.insert(transactions).values(data);
}

export async function updateTransaction(userId: number, transactionId: string, updates: Partial<InsertTransaction>) {
  const db = await getDb();
  if (!db) return;
  await db.update(transactions).set(updates).where(and(eq(transactions.userId, userId), eq(transactions.transactionId, transactionId)));
}

// ============================================================
// FINANCIALS
// ============================================================
export async function getUserFinancials(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(financialEntries).where(eq(financialEntries.userId, userId)).orderBy(desc(financialEntries.createdAt));
}

export async function insertFinancialEntry(data: InsertFinancialEntry) {
  const db = await getDb();
  if (!db) return;
  await db.insert(financialEntries).values(data);
}

export async function getFinancialEntriesByYear(userId: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(financialEntries)
    .where(and(
      eq(financialEntries.userId, userId),
      sql`YEAR(${financialEntries.createdAt}) = ${year}`
    ));
}

// ============================================================
// SOPs
// ============================================================
export async function getUserSOPs(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sops).where(eq(sops.userId, userId)).orderBy(desc(sops.createdAt));
}

export async function insertSOP(data: InsertSOP) {
  const db = await getDb();
  if (!db) return;
  await db.insert(sops).values(data);
}

export async function updateSOP(userId: number, sopId: string, updates: Partial<InsertSOP>) {
  const db = await getDb();
  if (!db) return;
  await db.update(sops).set(updates).where(and(eq(sops.userId, userId), eq(sops.sopId, sopId)));
}

// ============================================================
// CULTURE DOCS
// ============================================================
export async function getUserCultureDoc(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(cultureDocs).where(eq(cultureDocs.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertCultureDoc(data: InsertCultureDoc) {
  const db = await getDb();
  if (!db) return;
  const existing = await getUserCultureDoc(data.userId);
  if (existing) {
    await db.update(cultureDocs).set(data).where(eq(cultureDocs.userId, data.userId));
  } else {
    await db.insert(cultureDocs).values(data);
  }
}

// ============================================================
// AI COACHING
// ============================================================
export async function insertCoachingLog(data: InsertAICoachingLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(aiCoachingLogs).values(data);
}

export async function getUserCoachingLogs(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiCoachingLogs).where(eq(aiCoachingLogs.userId, userId)).orderBy(desc(aiCoachingLogs.createdAt)).limit(limit);
}

// ============================================================
// CALENDAR TOKENS (Phase 4)
// ============================================================
export async function getCalendarToken(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(calendarTokens).where(eq(calendarTokens.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertCalendarToken(data: InsertCalendarToken) {
  const db = await getDb();
  if (!db) return;
  const existing = await getCalendarToken(data.userId);
  if (existing) {
    await db.update(calendarTokens).set(data).where(eq(calendarTokens.userId, data.userId));
  } else {
    await db.insert(calendarTokens).values(data);
  }
}

// ============================================================
// COACH RELATIONSHIPS (Phase 4)
// ============================================================
export async function createCoachRelationship(data: Partial<InsertCoachRelationship> & { agentId: number }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(coachRelationships).values(data as InsertCoachRelationship);
}

export async function getCoachRelationshipByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(coachRelationships).where(eq(coachRelationships.inviteToken, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCoachRelationship(id: number, updates: Partial<InsertCoachRelationship>) {
  const db = await getDb();
  if (!db) return;
  await db.update(coachRelationships).set(updates).where(eq(coachRelationships.id, id));
}

export async function getCoachRelationships(coachId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coachRelationships).where(eq(coachRelationships.coachId, coachId));
}

export async function getCoachRelationshipForPair(coachId: number, agentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(coachRelationships)
    .where(and(eq(coachRelationships.coachId, coachId), eq(coachRelationships.agentId, agentId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAgentCoaches(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coachRelationships).where(eq(coachRelationships.agentId, agentId));
}

// ============================================================
// COACH COMMENTS (Phase 4)
// ============================================================
export async function createCoachComment(data: InsertCoachComment) {
  const db = await getDb();
  if (!db) return;
  await db.insert(coachComments).values(data);
}

export async function getAgentCoachComments(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coachComments).where(eq(coachComments.agentId, agentId)).orderBy(desc(coachComments.createdAt));
}

// ============================================================
// RECRUITS (Phase 4)
// ============================================================
export async function getUserRecruits(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(recruits).where(eq(recruits.userId, userId)).orderBy(desc(recruits.createdAt));
}

export async function insertRecruit(data: InsertRecruit) {
  const db = await getDb();
  if (!db) return;
  await db.insert(recruits).values(data);
}

export async function updateRecruit(userId: number, recruitId: string, updates: Partial<InsertRecruit>) {
  const db = await getDb();
  if (!db) return;
  await db.update(recruits).set(updates).where(and(eq(recruits.userId, userId), eq(recruits.recruitId, recruitId)));
}

export async function deleteRecruit(userId: number, recruitId: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(recruits).where(and(eq(recruits.userId, userId), eq(recruits.recruitId, recruitId)));
}

// ============================================================
// TRANSACTION COMMS (Phase 4)
// ============================================================
export async function getTransactionComms(userId: number, transactionId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactionComms)
    .where(and(eq(transactionComms.userId, userId), eq(transactionComms.transactionId, transactionId)))
    .orderBy(desc(transactionComms.sentAt));
}

export async function getTransactionCommsPublic(transactionId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: transactionComms.id,
    milestone: transactionComms.milestone,
    channel: transactionComms.channel,
    messageBody: transactionComms.messageBody,
    sentAt: transactionComms.sentAt,
  }).from(transactionComms).where(eq(transactionComms.transactionId, transactionId)).orderBy(desc(transactionComms.sentAt));
}

export async function createTransactionComm(data: InsertTransactionComm) {
  const db = await getDb();
  if (!db) return;
  await db.insert(transactionComms).values(data);
}

// ============================================================
// CLIENT PORTAL TOKENS (Phase 4)
// ============================================================
export async function createPortalToken(data: InsertClientPortalToken) {
  const db = await getDb();
  if (!db) return;
  await db.insert(clientPortalTokens).values(data);
}

export async function getPortalToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clientPortalTokens).where(eq(clientPortalTokens.token, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// REFERRAL PARTNERS (Phase 4)
// ============================================================
export async function getReferralPartners(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(referralPartners).where(eq(referralPartners.userId, userId)).orderBy(desc(referralPartners.lifetimeGCIGenerated));
}

export async function createReferralPartner(data: InsertReferralPartner) {
  const db = await getDb();
  if (!db) return;
  await db.insert(referralPartners).values(data);
}

export async function updateReferralPartner(userId: number, partnerId: string, updates: Partial<InsertReferralPartner>) {
  const db = await getDb();
  if (!db) return;
  await db.update(referralPartners).set(updates).where(and(eq(referralPartners.userId, userId), eq(referralPartners.partnerId, partnerId)));
}

export async function incrementPartnerCount(userId: number, partnerId: string, field: 'referralsSentCount' | 'referralsReceivedCount') {
  const db = await getDb();
  if (!db) return;
  await db.update(referralPartners)
    .set({ [field]: sql`${referralPartners[field]} + 1` })
    .where(and(eq(referralPartners.userId, userId), eq(referralPartners.partnerId, partnerId)));
}

// ============================================================
// REFERRAL EXCHANGES (Phase 4)
// ============================================================
export async function getReferralExchanges(userId: number, partnerId?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(referralExchanges.userId, userId)];
  if (partnerId) conditions.push(eq(referralExchanges.partnerId, partnerId));
  return db.select().from(referralExchanges).where(and(...conditions)).orderBy(desc(referralExchanges.referralDate));
}

export async function createReferralExchange(data: InsertReferralExchange) {
  const db = await getDb();
  if (!db) return;
  await db.insert(referralExchanges).values(data);
}

// ============================================================
// REVIEWS (Phase 4)
// ============================================================
export async function getUserReviews(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.userId, userId)).orderBy(desc(reviews.createdAt));
}

export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) return;
  await db.insert(reviews).values(data);
}

export async function updateReview(userId: number, reviewId: string, updates: Partial<InsertReview>) {
  const db = await getDb();
  if (!db) return;
  await db.update(reviews).set(updates).where(and(eq(reviews.userId, userId), eq(reviews.reviewId, reviewId)));
}

// ============================================================
// BROKERAGE CONFIG (Phase 4)
// ============================================================
export async function getBrokerageConfig(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(brokerageConfig).where(eq(brokerageConfig.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertBrokerageConfig(data: Partial<InsertBrokerageConfig> & { userId: number }) {
  const db = await getDb();
  if (!db) return;
  const existing = await getBrokerageConfig(data.userId);
  if (existing) {
    await db.update(brokerageConfig).set(data).where(eq(brokerageConfig.userId, data.userId));
  } else {
    await db.insert(brokerageConfig).values(data as InsertBrokerageConfig);
  }
}

// ============================================================
// SUBSCRIPTIONS (Phase 6)
// ============================================================
import {
  subscriptions, InsertSubscription,
  coachingSessions, InsertCoachingSession,
  coachingCommitments, InsertCoachingCommitment,
  coachingCohorts, InsertCoachingCohort,
  cohortMembers, InsertCohortMember,
  certifications, InsertCertification,
} from "../drizzle/schema";

export async function getSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) return;
  await db.insert(subscriptions).values(data);
}

export async function updateSubscription(
  userId: number,
  data: Partial<InsertSubscription>
) {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscriptions.userId, userId));
}

export async function getSubscriptionByStripeCustomer(stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.stripeCustomerId, stripeCustomerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// COACHING SESSIONS (Phase 6)
// ============================================================
export async function createSession(data: InsertCoachingSession) {
  const db = await getDb();
  if (!db) return;
  await db.insert(coachingSessions).values(data);
}

export async function getSession(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(coachingSessions).where(eq(coachingSessions.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSession(sessionId: string, updates: Partial<InsertCoachingSession>) {
  const db = await getDb();
  if (!db) return;
  await db.update(coachingSessions).set({ ...updates, updatedAt: new Date() }).where(eq(coachingSessions.sessionId, sessionId));
}

export async function getCoachUpcomingSessions(coachId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coachingSessions)
    .where(and(eq(coachingSessions.coachId, coachId), gt(coachingSessions.scheduledAt, new Date())))
    .orderBy(asc(coachingSessions.scheduledAt))
    .limit(20);
}

export async function getAgentSessions(agentId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coachingSessions)
    .where(eq(coachingSessions.agentId, agentId))
    .orderBy(desc(coachingSessions.scheduledAt))
    .limit(limit);
}

export async function getCoachAllSessions(coachId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coachingSessions)
    .where(eq(coachingSessions.coachId, coachId))
    .orderBy(desc(coachingSessions.scheduledAt))
    .limit(50);
}

// ============================================================
// COACHING COMMITMENTS (Phase 6)
// ============================================================
export async function getAgentCommitments(agentId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coachingCommitments)
    .where(eq(coachingCommitments.agentId, agentId))
    .orderBy(desc(coachingCommitments.createdAt))
    .limit(limit);
}

export async function createCommitment(data: InsertCoachingCommitment) {
  const db = await getDb();
  if (!db) return;
  await db.insert(coachingCommitments).values(data);
}

export async function markCommitmentComplete(commitmentId: string, agentId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(coachingCommitments)
    .set({ isComplete: true, completedAt: new Date() })
    .where(and(
      eq(coachingCommitments.commitmentId, commitmentId),
      eq(coachingCommitments.agentId, agentId)
    ));
}

// ============================================================
// COACHING COHORTS (Phase 6)
// ============================================================
export async function getCoachCohorts(coachId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coachingCohorts).where(eq(coachingCohorts.coachId, coachId)).orderBy(desc(coachingCohorts.createdAt));
}

export async function createCohort(data: InsertCoachingCohort) {
  const db = await getDb();
  if (!db) return;
  await db.insert(coachingCohorts).values(data);
}

export async function getCohort(cohortId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(coachingCohorts).where(eq(coachingCohorts.cohortId, cohortId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCohort(cohortId: string, updates: Partial<InsertCoachingCohort>) {
  const db = await getDb();
  if (!db) return;
  await db.update(coachingCohorts).set(updates).where(eq(coachingCohorts.cohortId, cohortId));
}

// ============================================================
// COHORT MEMBERS (Phase 6)
// ============================================================
export async function getCohortMembers(cohortId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cohortMembers).where(eq(cohortMembers.cohortId, cohortId));
}

export async function addCohortMember(data: InsertCohortMember) {
  const db = await getDb();
  if (!db) return;
  await db.insert(cohortMembers).values(data);
}

export async function updateCohortMemberStatus(
  cohortId: string, agentId: number,
  status: 'active' | 'paused' | 'graduated' | 'removed'
) {
  const db = await getDb();
  if (!db) return;
  await db.update(cohortMembers)
    .set({ status })
    .where(and(eq(cohortMembers.cohortId, cohortId), eq(cohortMembers.agentId, agentId)));
}

export async function getAgentActiveCohort(agentId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(cohortMembers)
    .where(and(eq(cohortMembers.agentId, agentId), eq(cohortMembers.status, 'active')));
  if (result.length === 0) return null;
  return getCohort(result[0].cohortId);
}

// ============================================================
// CERTIFICATIONS (Phase 6)
// ============================================================
export async function getCoachCertification(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(certifications).where(eq(certifications.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertCoachCertification(
  userId: number,
  data: Partial<InsertCertification>
) {
  const db = await getDb();
  if (!db) return;
  const existing = await getCoachCertification(userId);
  if (existing) {
    await db.update(certifications).set({ ...data, updatedAt: new Date() }).where(eq(certifications.userId, userId));
  } else {
    await db.insert(certifications).values({
      userId,
      status: 'in_progress',
      moduleProgress: { m1: false, m2: false, m3: false, m4: false, m5: false },
      ...data,
    } as InsertCertification);
  }
}

export async function getCertificationCandidates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certifications).where(eq(certifications.status, 'assessment_pending'));
}

// ============================================================
// HELPER: getUserByEmail (Phase 6)
// ============================================================
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}


// ============================================================
// PHASE 9 — JOURNEY POSTS
// ============================================================

export async function createJourneyPost(data: InsertJourneyPost) {
  const db = await getDb();
  if (!db) return;
  await db.insert(journeyPosts).values(data);
}

export async function getJourneyPost(postId: string) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(journeyPosts)
    .where(eq(journeyPosts.postId, postId));
  return row ?? null;
}

export async function getUserJourneyPosts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(journeyPosts)
    .where(eq(journeyPosts.userId, userId))
    .orderBy(desc(journeyPosts.createdAt))
    .limit(100);
}

export async function getUserDraftPosts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(journeyPosts)
    .where(and(
      eq(journeyPosts.userId, userId),
      eq(journeyPosts.isPublished, false)
    ))
    .orderBy(desc(journeyPosts.createdAt));
}

export async function publishPost(
  postId: string,
  userId: number,
  updates: { caption?: string; visibility: string }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(journeyPosts)
    .set({ ...updates, isPublished: true, updatedAt: new Date() } as any)
    .where(and(
      eq(journeyPosts.postId, postId),
      eq(journeyPosts.userId, userId)
    ));
}

export async function deletePost(postId: string, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(journeyPosts)
    .where(and(
      eq(journeyPosts.postId, postId),
      eq(journeyPosts.userId, userId)
    ));
}

export async function featurePost(postId: string, coachId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(journeyPosts)
    .set({ isFeatured: true, featuredBy: coachId, featuredAt: new Date() })
    .where(eq(journeyPosts.postId, postId));
}

export async function getFeedForUser(
  userId: number,
  limit = 30,
  offset = 0
) {
  const db = await getDb();
  if (!db) return [];

  // Get cohort member IDs for this user
  const cohort = await getAgentActiveCohort(userId);
  const cohortMemberIds: number[] = [];
  if (cohort) {
    const members = await getCohortMembers(cohort.cohortId);
    cohortMemberIds.push(...members.map(m => m.agentId));
  }

  // Get followed user IDs
  const following = await db.select().from(feedConnections)
    .where(eq(feedConnections.followerId, userId));
  const followingIds = following.map(f => f.followingId);

  // Eligible user IDs for this feed
  const eligibleIds = Array.from(new Set([userId, ...cohortMemberIds, ...followingIds]));

  return db.select().from(journeyPosts)
    .where(and(
      eq(journeyPosts.isPublished, true),
      or(
        // Own posts at any visibility
        eq(journeyPosts.userId, userId),
        // Cohort/following posts at cohort+ visibility
        and(
          inArray(journeyPosts.userId, eligibleIds.length > 0 ? eligibleIds : [0]),
          or(
            eq(journeyPosts.visibility, 'cohort'),
            eq(journeyPosts.visibility, 'community'),
            eq(journeyPosts.visibility, 'network'),
          )
        ),
        // Community posts from anyone
        eq(journeyPosts.visibility, 'community'),
        eq(journeyPosts.visibility, 'network'),
      )
    ))
    .orderBy(
      desc(journeyPosts.isFeatured),
      desc(journeyPosts.createdAt)
    )
    .limit(limit)
    .offset(offset);
}

export async function getPostComments(postId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(journeyComments)
    .where(and(
      eq(journeyComments.postId, postId),
      eq(journeyComments.isApproved, true),
      isNull(journeyComments.parentCommentId)
    ))
    .orderBy(asc(journeyComments.createdAt))
    .limit(50);
}

export async function createComment(data: InsertJourneyComment) {
  const db = await getDb();
  if (!db) return;
  await db.insert(journeyComments).values(data);
  // Increment post comment count
  await db.update(journeyPosts)
    .set({ commentsCount: sql`${journeyPosts.commentsCount} + 1` })
    .where(eq(journeyPosts.postId, data.postId));
}

export async function addReaction(
  postId: string,
  userId: number,
  type: string
) {
  const db = await getDb();
  if (!db) return;
  // Upsert — one reaction type per user per post
  const existing = await db.select().from(journeyReactions)
    .where(and(
      eq(journeyReactions.postId, postId),
      eq(journeyReactions.userId, userId)
    ));

  if (existing.length > 0) {
    if (existing[0].type === type) {
      // Remove reaction (toggle off)
      await db.delete(journeyReactions)
        .where(and(
          eq(journeyReactions.postId, postId),
          eq(journeyReactions.userId, userId)
        ));
      await db.update(journeyPosts)
        .set({ reactionsCount: sql`${journeyPosts.reactionsCount} - 1` })
        .where(eq(journeyPosts.postId, postId));
    } else {
      // Change reaction type
      await db.update(journeyReactions)
        .set({ type: type as any })
        .where(and(
          eq(journeyReactions.postId, postId),
          eq(journeyReactions.userId, userId)
        ));
    }
  } else {
    await db.insert(journeyReactions).values({ postId, userId, type: type as any });
    await db.update(journeyPosts)
      .set({ reactionsCount: sql`${journeyPosts.reactionsCount} + 1` })
      .where(eq(journeyPosts.postId, postId));
  }
}

export async function getPostReactions(postId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(journeyReactions)
    .where(eq(journeyReactions.postId, postId));
}

export async function followUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(feedConnections)
    .where(and(
      eq(feedConnections.followerId, followerId),
      eq(feedConnections.followingId, followingId)
    ));
  if (!existing.length) {
    await db.insert(feedConnections).values({ followerId, followingId });
  }
}

export async function unfollowUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(feedConnections)
    .where(and(
      eq(feedConnections.followerId, followerId),
      eq(feedConnections.followingId, followingId)
    ));
}

// ============================================================
// PHASE 10 — AI TOOLS DIRECTORY
// ============================================================

export async function getAllTools(filters?: {
  category?: string;
  curationTier?: string;
  pricingModel?: string;
  integrationStatus?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(aiTools.isApproved, true)];

  if (filters?.category) {
    conditions.push(eq(aiTools.category, filters.category as any));
  }
  if (filters?.curationTier) {
    conditions.push(eq(aiTools.curationTier, filters.curationTier as any));
  }
  if (filters?.integrationStatus) {
    conditions.push(eq(aiTools.integrationStatus, filters.integrationStatus as any));
  }

  return db.select().from(aiTools)
    .where(and(...conditions))
    .orderBy(asc(aiTools.sortOrder), desc(aiTools.upvoteCount));
}

export async function getTool(toolId: string) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(aiTools)
    .where(eq(aiTools.toolId, toolId));
  return row ?? null;
}

export async function upsertTool(data: InsertAITool) {
  const db = await getDb();
  if (!db) return;
  await db.insert(aiTools).values(data)
    .onDuplicateKeyUpdate({ set: { ...data, updatedAt: new Date() } });
}

export async function logToolClick(data: InsertToolClick) {
  const db = await getDb();
  if (!db) return;
  await db.insert(toolClicks).values(data);
  await db.update(aiTools)
    .set({ clickCount: sql`${aiTools.clickCount} + 1` })
    .where(eq(aiTools.toolId, data.toolId));
}

export async function getToolClickStats(toolId: string) {
  const db = await getDb();
  if (!db) return { total: 0, last30Days: 0 };
  const clicks = await db.select().from(toolClicks)
    .where(eq(toolClicks.toolId, toolId));
  const last30Days = clicks.filter(
    c => new Date(c.createdAt).getTime() > Date.now() - 30 * 86400000
  ).length;
  return { total: clicks.length, last30Days };
}

export async function saveTool(userId: number, toolId: string, notes?: string) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(toolSaves)
    .where(and(eq(toolSaves.userId, userId), eq(toolSaves.toolId, toolId)));
  if (!existing.length) {
    await db.insert(toolSaves).values({ userId, toolId, notes });
    await db.update(aiTools)
      .set({ saveCount: sql`${aiTools.saveCount} + 1` })
      .where(eq(aiTools.toolId, toolId));
  }
}

export async function unsaveTool(userId: number, toolId: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(toolSaves)
    .where(and(eq(toolSaves.userId, userId), eq(toolSaves.toolId, toolId)));
  await db.update(aiTools)
    .set({ saveCount: sql`${aiTools.saveCount} - 1` })
    .where(eq(aiTools.toolId, toolId));
}

export async function getUserSavedTools(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const saves = await db.select().from(toolSaves)
    .where(eq(toolSaves.userId, userId));
  const toolIds = saves.map(s => s.toolId);
  if (!toolIds.length) return [];
  return db.select().from(aiTools)
    .where(inArray(aiTools.toolId, toolIds));
}

export async function upvoteTool(userId: number, toolId: string) {
  const db = await getDb();
  if (!db) return { voted: false };
  const existing = await db.select().from(toolUpvotes)
    .where(and(eq(toolUpvotes.userId, userId), eq(toolUpvotes.toolId, toolId)));
  if (!existing.length) {
    await db.insert(toolUpvotes).values({ userId, toolId });
    await db.update(aiTools)
      .set({ upvoteCount: sql`${aiTools.upvoteCount} + 1` })
      .where(eq(aiTools.toolId, toolId));
    return { voted: true };
  } else {
    await db.delete(toolUpvotes)
      .where(and(eq(toolUpvotes.userId, userId), eq(toolUpvotes.toolId, toolId)));
    await db.update(aiTools)
      .set({ upvoteCount: sql`${aiTools.upvoteCount} - 1` })
      .where(eq(aiTools.toolId, toolId));
    return { voted: false };
  }
}

export async function submitTool(data: InsertToolSubmission) {
  const db = await getDb();
  if (!db) return;
  await db.insert(toolSubmissions).values(data);
}

export async function addCoachRecommendation(data: InsertCoachToolRecommendation) {
  const db = await getDb();
  if (!db) return;
  await db.insert(coachToolRecommendations).values(data);
}

export async function getAgentToolRecommendations(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  const recs = await db.select().from(coachToolRecommendations)
    .where(eq(coachToolRecommendations.agentId, agentId))
    .orderBy(desc(coachToolRecommendations.createdAt));

  return Promise.all(recs.map(async rec => {
    const tool = await getTool(rec.toolId);
    const coach = await getAgentProfile(rec.coachId);
    return { ...rec, tool, coach };
  }));
}

// ============================================================
// PHASE 11 — KW MODEL LIBRARY
// ============================================================

// ── One Thing ──────────────────────────────────────────────
export async function getUserOneThings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(oneThing)
    .where(and(eq(oneThing.userId, userId), eq(oneThing.isActive, true)))
    .orderBy(asc(oneThing.period));
}

export async function createOneThing(data: InsertOneThing) {
  const db = await getDb();
  if (!db) return;
  await db.insert(oneThing).values(data);
}

export async function deactivateOneThing(userId: number, period: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(oneThing)
    .set({ isActive: false })
    .where(and(eq(oneThing.userId, userId), eq(oneThing.period, period as InsertOneThing['period'])));
}

export async function completeOneThing(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(oneThing)
    .set({ completedAt: new Date() })
    .where(and(eq(oneThing.id, id), eq(oneThing.userId, userId)));
}

// ── GPS Plans ──────────────────────────────────────────────
export async function getUserGPSPlans(userId: number, quarter?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(gpsPlans.userId, userId)];
  if (quarter) conditions.push(eq(gpsPlans.quarter, quarter));
  return db.select().from(gpsPlans)
    .where(and(...conditions))
    .orderBy(desc(gpsPlans.createdAt));
}

export async function upsertGPSPlan(data: InsertGpsPlan) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(gpsPlans)
    .where(eq(gpsPlans.planId, data.planId))
    .limit(1);
  if (existing.length > 0) {
    await db.update(gpsPlans).set(data).where(eq(gpsPlans.planId, data.planId));
  } else {
    await db.insert(gpsPlans).values(data);
  }
}

// ── Bold Goal ──────────────────────────────────────────────
export async function getUserBoldGoal(userId: number, year: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(boldGoal)
    .where(and(eq(boldGoal.userId, userId), eq(boldGoal.year, year)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertBoldGoal(data: InsertBoldGoal) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(boldGoal)
    .where(and(eq(boldGoal.userId, data.userId), eq(boldGoal.year, data.year)))
    .limit(1);
  if (existing.length > 0) {
    await db.update(boldGoal).set(data)
      .where(and(eq(boldGoal.userId, data.userId), eq(boldGoal.year, data.year)));
  } else {
    await db.insert(boldGoal).values(data);
  }
}

// ── 8x8 ────────────────────────────────────────────────────
export async function getUserActive8x8(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eightByEight)
    .where(and(eq(eightByEight.userId, userId), eq(eightByEight.status, 'active')))
    .orderBy(desc(eightByEight.startedAt));
}

export async function createEightByEight(data: InsertEightByEight) {
  const db = await getDb();
  if (!db) return;
  await db.insert(eightByEight).values(data);
}

export async function completeEightByEightTouch(
  enrollmentId: string,
  userId: number,
  touchNumber: number,
  note?: string
) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(eightByEight)
    .where(and(eq(eightByEight.enrollmentId, enrollmentId), eq(eightByEight.userId, userId)))
    .limit(1);
  if (existing.length === 0) return;
  const current = existing[0];
  const completedTouches = (current.completedTouches as Array<{ touch: number; note?: string; date: string }>) || [];
  completedTouches.push({ touch: touchNumber, note, date: new Date().toISOString() });
  const nextTouch = touchNumber + 1;
  const isComplete = nextTouch > 8;
  await db.update(eightByEight)
    .set({
      completedTouches,
      currentTouch: isComplete ? 8 : nextTouch,
      status: isComplete ? 'complete' : 'active',
      completedAt: isComplete ? new Date() : undefined,
    })
    .where(eq(eightByEight.enrollmentId, enrollmentId));
}

// ── 33 Touch ───────────────────────────────────────────────
export async function getUserThirtyThreeTouchStatus(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(thirtyThreeTouch)
    .where(and(eq(thirtyThreeTouch.userId, userId), eq(thirtyThreeTouch.isActive, true)));
}

export async function createThirtyThreeTouch(data: InsertThirtyThreeTouch) {
  const db = await getDb();
  if (!db) return;
  await db.insert(thirtyThreeTouch).values(data);
}

export async function logThirtyThreeTouch(
  userId: number,
  leadId: string,
  entry: { type: string; date: Date; note?: string }
) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(thirtyThreeTouch)
    .where(and(
      eq(thirtyThreeTouch.userId, userId),
      eq(thirtyThreeTouch.leadId, leadId),
      eq(thirtyThreeTouch.isActive, true)
    ))
    .limit(1);
  if (existing.length === 0) return;
  const current = existing[0];
  const touchLog = (current.touchLog as Array<typeof entry>) || [];
  touchLog.push(entry);
  const nextTouchDue = new Date(Date.now() + 11 * 24 * 60 * 60 * 1000);
  await db.update(thirtyThreeTouch)
    .set({
      touchesCompleted: current.touchesCompleted + 1,
      lastTouchDate: entry.date,
      nextTouchDue,
      touchLog,
    })
    .where(and(eq(thirtyThreeTouch.userId, userId), eq(thirtyThreeTouch.leadId, leadId)));
}

// ── TTSA Profiles ──────────────────────────────────────────
export async function getUserTTSAProfiles(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ttsaProfiles)
    .where(eq(ttsaProfiles.userId, userId))
    .orderBy(asc(ttsaProfiles.teamMemberName));
}

export async function upsertTTSA(data: Partial<InsertTtsaProfile> & { userId: number; teamMemberName: string }) {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    await db.update(ttsaProfiles).set(data).where(and(eq(ttsaProfiles.id, data.id), eq(ttsaProfiles.userId, data.userId)));
  } else {
    await db.insert(ttsaProfiles).values(data as InsertTtsaProfile);
  }
}

export async function deleteTTSAProfile(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(ttsaProfiles).where(and(eq(ttsaProfiles.id, id), eq(ttsaProfiles.userId, userId)));
}

// ── Team Economic Model ────────────────────────────────────
export async function getTeamEconomicModel(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(teamEconomicModel)
    .where(eq(teamEconomicModel.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertTeamEconomicModel(data: InsertTeamEconomicModel) {
  const db = await getDb();
  if (!db) return;
  const existing = await getTeamEconomicModel(data.userId);
  if (existing) {
    await db.update(teamEconomicModel).set(data).where(eq(teamEconomicModel.userId, data.userId));
  } else {
    await db.insert(teamEconomicModel).values(data);
  }
}

// ── Session Runner ─────────────────────────────────────────
export async function initSessionRunner(data: InsertSessionRunnerState) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(sessionRunnerState)
    .where(eq(sessionRunnerState.sessionId, data.sessionId))
    .limit(1);
  if (existing.length > 0) {
    await db.update(sessionRunnerState)
      .set({ currentSegment: 0, segmentStartedAt: new Date(), isComplete: false, notes: data.notes })
      .where(eq(sessionRunnerState.sessionId, data.sessionId));
  } else {
    await db.insert(sessionRunnerState).values(data);
  }
}

export async function advanceSessionSegment(sessionId: string, noteForCurrentSegment?: string) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(sessionRunnerState)
    .where(eq(sessionRunnerState.sessionId, sessionId))
    .limit(1);
  if (existing.length === 0) return null;
  const current = existing[0];
  const notes = (current.notes as Record<string, string>) || {};
  if (noteForCurrentSegment) {
    notes[`segment_${current.currentSegment}`] = noteForCurrentSegment;
  }
  const nextSegment = current.currentSegment + 1;
  const isComplete = nextSegment >= 6; // 6 segments total
  await db.update(sessionRunnerState)
    .set({
      currentSegment: isComplete ? 5 : nextSegment,
      segmentStartedAt: new Date(),
      notes,
      isComplete,
    })
    .where(eq(sessionRunnerState.sessionId, sessionId));
  return { currentSegment: isComplete ? 5 : nextSegment, isComplete };
}

export async function getSessionRunnerState(sessionId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(sessionRunnerState)
    .where(eq(sessionRunnerState.sessionId, sessionId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// ── Accountability Assessments ─────────────────────────────
export async function createAccountabilityAssessment(data: InsertAccountabilityAssessment) {
  const db = await getDb();
  if (!db) return;
  await db.insert(accountabilityAssessments).values(data);
}

export async function getAgentAccountabilityHistory(agentId: number, coachId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(accountabilityAssessments)
    .where(and(
      eq(accountabilityAssessments.agentId, agentId),
      eq(accountabilityAssessments.coachId, coachId)
    ))
    .orderBy(desc(accountabilityAssessments.createdAt));
}

// ── Model Library ──────────────────────────────────────────
export async function getModelLibrary(category?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(modelLibrary.isActive, true)];
  if (category) conditions.push(eq(modelLibrary.category, category as InsertModelLibraryEntry['category']));
  return db.select().from(modelLibrary)
    .where(and(...conditions))
    .orderBy(asc(modelLibrary.sortOrder));
}

export async function getModel(modelId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(modelLibrary)
    .where(eq(modelLibrary.modelId, modelId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// ── Database Health Score ──────────────────────────────────
export async function getDatabaseHealthScore(userId: number) {
  const leads = await getUserLeads(userId);
  const thirtyThreeTouchEnrolled = await getUserThirtyThreeTouchStatus(userId);
  const eightByEightActive = await getUserActive8x8(userId);

  const inProgram = thirtyThreeTouchEnrolled.length + eightByEightActive.length;
  const programCoverage = leads.length > 0 ? inProgram / leads.length : 0;

  const healthScore = Math.min(100,
    Math.round(
      (programCoverage * 40) +
      (leads.length > 50 ? 20 : leads.length / 50 * 20) +
      (eightByEightActive.length > 0 ? 20 : 0) +
      (thirtyThreeTouchEnrolled.length > 0 ? 20 : 0)
    )
  );

  return {
    totalLeads: leads.length,
    inProgram,
    programCoverage: Math.round(programCoverage * 100),
    healthScore,
  };
}

// ============================================================
// Phase 7 — Google Drive helpers
// ============================================================
import {
  driveTokens, InsertDriveToken,
  driveSyncLog,
  weeklyPulses, InsertWeeklyPulse, WeeklyPulse,
} from "../drizzle/schema";

export async function getDriveTokens(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(driveTokens).where(eq(driveTokens.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function saveDriveTokens(
  userId: number,
  accessToken: string,
  refreshToken: string,
  expiresAt?: Date
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await getDriveTokens(userId);
  if (existing) {
    await db.update(driveTokens)
      .set({ accessToken, refreshToken, expiresAt: expiresAt ?? null, updatedAt: new Date() })
      .where(eq(driveTokens.userId, userId));
  } else {
    const row: InsertDriveToken = { userId, accessToken, refreshToken, expiresAt: expiresAt ?? null };
    await db.insert(driveTokens).values(row);
  }
}

export async function saveDriveFolderIds(
  userId: number,
  rootFolderId: string,
  sheetIds: Record<string, string>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(driveTokens)
    .set({ rootFolderId, sheetIds, updatedAt: new Date() })
    .where(eq(driveTokens.userId, userId));
}

export async function saveMCRollupSheetId(
  userId: number,
  rollupSheetId: string,
  rollupFolderId: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(driveTokens)
    .set({ rollupSheetId, rollupFolderId, updatedAt: new Date() })
    .where(eq(driveTokens.userId, userId));
}

export async function logDriveSync(
  userId: number,
  syncType: string,
  status: 'success' | 'failed',
  error?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(driveSyncLog).values({ userId, syncType, status, error: error ?? null });
}

/**
 * Returns users who have a Drive rollupSheetId set (i.e., MC-level users with a rollup sheet).
 */
export async function getMCAccounts(): Promise<Array<{ userId: number; rollupSheetId: string | null }>> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    userId: driveTokens.userId,
    rollupSheetId: driveTokens.rollupSheetId,
  }).from(driveTokens).where(sql`${driveTokens.rollupSheetId} IS NOT NULL`);
  return result;
}

/**
 * Returns agent user IDs that share the same marketCenter as the MC user.
 * Falls back to empty array if no profile found.
 */
export async function getMCAgentIds(mcUserId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const mcProfile = await getAgentProfile(mcUserId);
  if (!mcProfile?.marketCenter) return [];
  const agents = await db.select({ userId: agentProfiles.userId })
    .from(agentProfiles)
    .where(and(
      eq(agentProfiles.marketCenter, mcProfile.marketCenter),
      sql`${agentProfiles.userId} != ${mcUserId}`
    ));
  return agents.map(a => a.userId);
}

// ============================================================
// WEEKLY PULSES (Phase 7b)
// ============================================================
export async function saveWeeklyPulse(data: InsertWeeklyPulse): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(weeklyPulses).values(data);
}

export async function getWeeklyPulses(userId: number, limit = 12): Promise<WeeklyPulse[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weeklyPulses)
    .where(eq(weeklyPulses.userId, userId))
    .orderBy(desc(weeklyPulses.createdAt))
    .limit(limit);
}

export async function getUsersWithDriveTokens(): Promise<Array<{ id: number }>> {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select({ userId: driveTokens.userId }).from(driveTokens);
  return results.map(r => ({ id: r.userId }));
}

// ============================================================
// PHASE 8 — WEALTH JOURNEY helpers
// ============================================================
import {
  wealthMilestones, InsertWealthMilestone, WealthMilestone,
  wealthProfile, InsertWealthProfile, WealthProfile,
  investmentProperties, InsertInvestmentProperty, InvestmentProperty,
} from '../drizzle/schema';

export async function getWealthMilestones(userId: number): Promise<WealthMilestone[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(wealthMilestones).where(eq(wealthMilestones.userId, userId));
}

export async function upsertWealthMilestone(
  userId: number,
  input: { milestoneKey: string; status: 'not_started' | 'in_progress' | 'done'; notes?: string; completedDate?: string }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(wealthMilestones)
    .where(and(eq(wealthMilestones.userId, userId), eq(wealthMilestones.milestoneKey, input.milestoneKey)))
    .limit(1);
  const completedDateVal = (input.completedDate ?? null) as any;
  if (existing.length > 0) {
    await db.update(wealthMilestones)
      .set({ status: input.status, notes: input.notes ?? null, completedDate: completedDateVal })
      .where(eq(wealthMilestones.id, existing[0].id));
  } else {
    await (db.insert(wealthMilestones) as any).values({
      userId,
      milestoneKey: input.milestoneKey,
      status: input.status,
      notes: input.notes ?? null,
      completedDate: completedDateVal,
    });
  }
}

export async function getWealthProfile(userId: number): Promise<WealthProfile | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(wealthProfile).where(eq(wealthProfile.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertWealthProfile(
  userId: number,
  input: Partial<InsertWealthProfile> & { fiNumber?: number }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ id: wealthProfile.id }).from(wealthProfile)
    .where(eq(wealthProfile.userId, userId)).limit(1);
  if (existing.length > 0) {
    await db.update(wealthProfile).set({ ...input, updatedAt: new Date() })
      .where(eq(wealthProfile.userId, userId));
  } else {
    await db.insert(wealthProfile).values({ userId, ...input } as InsertWealthProfile);
  }
}

export async function setWealthProfileFlag(userId: number, flag: string, value: boolean): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ id: wealthProfile.id }).from(wealthProfile)
    .where(eq(wealthProfile.userId, userId)).limit(1);
  const update = { [flag]: value, updatedAt: new Date() };
  if (existing.length > 0) {
    await db.update(wealthProfile).set(update).where(eq(wealthProfile.userId, userId));
  } else {
    await db.insert(wealthProfile).values({ userId, [flag]: value } as InsertWealthProfile);
  }
}

export async function getInvestmentProperties(userId: number): Promise<InvestmentProperty[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(investmentProperties).where(eq(investmentProperties.userId, userId));
}

export async function addInvestmentProperty(
  userId: number,
  input: Omit<InsertInvestmentProperty, 'userId' | 'id' | 'createdAt'>
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.insert(investmentProperties).values({ userId, ...input } as InsertInvestmentProperty);
  return (result as any).insertId ?? 0;
}

export async function updateInvestmentProperty(
  userId: number,
  id: number,
  input: Partial<InsertInvestmentProperty>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(investmentProperties).set(input)
    .where(and(eq(investmentProperties.id, id), eq(investmentProperties.userId, userId)));
}

export async function deleteInvestmentProperty(userId: number, id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(investmentProperties)
    .where(and(eq(investmentProperties.id, id), eq(investmentProperties.userId, userId)));
}
