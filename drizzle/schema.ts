import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Agent profile — extends user with real estate-specific fields.
 * One-to-one with users table.
 */
export const agentProfiles = mysqlTable("agent_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  brokerage: varchar("brokerage", { length: 128 }),
  marketCenter: varchar("marketCenter", { length: 128 }),
  state: varchar("state", { length: 4 }),
  yearsExperience: int("yearsExperience"),
  gciLastYear: int("gciLastYear"),
  teamSize: int("teamSize").default(1),
  currentLevel: int("currentLevel").default(1).notNull(),
  operationalScore: int("operationalScore").default(0),
  incomeGoal: int("incomeGoal").default(250000),
  diagnosticAnswers: json("diagnosticAnswers"),
  topProblems: json("topProblems"),
  isOnboarded: boolean("isOnboarded").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentProfile = typeof agentProfiles.$inferSelect;
export type InsertAgentProfile = typeof agentProfiles.$inferInsert;

/**
 * Deliverable tracking — each row is a deliverable for a specific agent.
 */
export const deliverables = mysqlTable("deliverables", {
  id: int("id").autoincrement().primaryKey(),
  deliverableId: varchar("deliverableId", { length: 32 }).notNull(),
  userId: int("userId").notNull(),
  level: int("level").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  isComplete: boolean("isComplete").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  builderData: json("builderData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Deliverable = typeof deliverables.$inferSelect;
export type InsertDeliverable = typeof deliverables.$inferInsert;

/**
 * Leads / Pipeline
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  leadId: varchar("leadId", { length: 32 }).notNull(),
  userId: int("userId").notNull(),
  firstName: varchar("firstName", { length: 128 }).notNull(),
  lastName: varchar("lastName", { length: 128 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  type: mysqlEnum("type", ["buyer", "seller", "both", "investor", "renter"]).default("buyer").notNull(),
  source: varchar("source", { length: 64 }),
  stage: varchar("stage", { length: 32 }).default("New Lead").notNull(),
  budget: int("budget").default(0),
  timeline: varchar("timeline", { length: 64 }),
  tags: json("tags"),
  lastContactedAt: timestamp("lastContactedAt"),
  nextAction: text("nextAction"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Transactions
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: varchar("transactionId", { length: 32 }).notNull(),
  userId: int("userId").notNull(),
  propertyAddress: varchar("propertyAddress", { length: 512 }).notNull(),
  clientName: varchar("clientName", { length: 256 }),
  type: mysqlEnum("transactionType", ["buyer", "seller", "dual"]).default("buyer").notNull(),
  status: mysqlEnum("status", ["pre-contract", "under-contract", "clear-to-close", "closed", "cancelled"]).default("pre-contract").notNull(),
  salePrice: int("salePrice").default(0),
  commission: int("commission").default(0),
  closeDate: varchar("closeDate", { length: 32 }),
  checklist: json("checklist"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Financial entries (income + expenses)
 */
export const financialEntries = mysqlTable("financial_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("entryType", ["income", "expense"]).notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  description: text("description"),
  amount: int("amount").notNull(),
  date: varchar("date", { length: 32 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FinancialEntry = typeof financialEntries.$inferSelect;
export type InsertFinancialEntry = typeof financialEntries.$inferInsert;

/**
 * SOPs / Knowledge Library
 */
export const sops = mysqlTable("sops", {
  id: int("id").autoincrement().primaryKey(),
  sopId: varchar("sopId", { length: 32 }).notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  category: varchar("category", { length: 128 }),
  content: text("content"),
  status: mysqlEnum("sopStatus", ["draft", "active", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SOP = typeof sops.$inferSelect;
export type InsertSOP = typeof sops.$inferInsert;

/**
 * Compliance logs
 */
export const complianceLogs = mysqlTable("compliance_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  inputText: text("inputText").notNull(),
  result: mysqlEnum("result", ["pass", "warning", "fail"]).notNull(),
  flaggedItems: json("flaggedItems"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type ComplianceLog = typeof complianceLogs.$inferSelect;
export type InsertComplianceLog = typeof complianceLogs.$inferInsert;

/**
 * Culture documents (mission, vision, values)
 */
export const cultureDocs = mysqlTable("culture_docs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  missionStatement: text("missionStatement"),
  visionStatement: text("visionStatement"),
  coreValues: json("coreValues"),
  teamCommitments: json("teamCommitments"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CultureDoc = typeof cultureDocs.$inferSelect;
export type InsertCultureDoc = typeof cultureDocs.$inferInsert;

/**
 * AI coaching interactions
 */
export const aiCoachingLogs = mysqlTable("ai_coaching_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  context: varchar("context", { length: 128 }).notNull(),
  prompt: text("prompt").notNull(),
  response: text("response"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AICoachingLog = typeof aiCoachingLogs.$inferSelect;
export type InsertAICoachingLog = typeof aiCoachingLogs.$inferInsert;
