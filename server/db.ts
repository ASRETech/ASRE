import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  agentProfiles, InsertAgentProfile,
  deliverables, InsertDeliverable,
  leads, InsertLead,
  transactions, InsertTransaction,
  financialEntries, InsertFinancialEntry,
  sops, InsertSOP,
  complianceLogs, InsertComplianceLog,
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

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
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
// COMPLIANCE
// ============================================================
export async function getUserComplianceLogs(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(complianceLogs).where(eq(complianceLogs.userId, userId)).orderBy(desc(complianceLogs.timestamp));
}

export async function insertComplianceLog(data: InsertComplianceLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(complianceLogs).values(data);
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
