import { eq, and, desc } from "drizzle-orm";
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

export async function upsertAgentProfile(data: InsertAgentProfile) {
  const db = await getDb();
  if (!db) return;
  const existing = await getAgentProfile(data.userId);
  if (existing) {
    await db.update(agentProfiles).set(data).where(eq(agentProfiles.userId, data.userId));
  } else {
    await db.insert(agentProfiles).values(data);
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
