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
 */
export const agentProfiles = mysqlTable("agent_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }),
  phone: varchar("phone", { length: 32 }),
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
  // Phase 4 additions
  coachMode: boolean("coachMode").default(false).notNull(),
  googleBusinessUrl: varchar("googleBusinessUrl", { length: 512 }),
  reviewRequestTemplate: text("reviewRequestTemplate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentProfile = typeof agentProfiles.$inferSelect;
export type InsertAgentProfile = typeof agentProfiles.$inferInsert;

/**
 * Deliverable tracking
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
  // Phase 4 additions
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 32 }),
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
  // Phase 4 additions
  receiptUrl: varchar("receiptUrl", { length: 512 }),
  receiptText: text("receiptText"),
  autoCategory: varchar("autoCategory", { length: 128 }),
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

// ═══════════════════════════════════════════════════════════════════
// PHASE 4 — NEW TABLES
// ═══════════════════════════════════════════════════════════════════

/**
 * Google Calendar integration tokens
 */
export const calendarTokens = mysqlTable("calendar_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  provider: varchar("provider", { length: 32 }).default("google").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  calendarId: varchar("calendarId", { length: 256 }),
  syncEnabled: boolean("syncEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CalendarToken = typeof calendarTokens.$inferSelect;
export type InsertCalendarToken = typeof calendarTokens.$inferInsert;

/**
 * Coach-Agent relationships
 */
export const coachRelationships = mysqlTable("coach_relationships", {
  id: int("id").autoincrement().primaryKey(),
  coachId: int("coachId"),
  agentId: int("agentId").notNull(),
  status: mysqlEnum("coachRelStatus", ["pending", "active", "ended"]).default("pending").notNull(),
  inviteToken: varchar("inviteToken", { length: 64 }).unique(),
  inviteEmail: varchar("inviteEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachRelationship = typeof coachRelationships.$inferSelect;
export type InsertCoachRelationship = typeof coachRelationships.$inferInsert;

/**
 * Coach comments on deliverables
 */
export const coachComments = mysqlTable("coach_comments", {
  id: int("id").autoincrement().primaryKey(),
  coachId: int("coachId").notNull(),
  agentId: int("agentId").notNull(),
  deliverableId: varchar("deliverableId", { length: 32 }).notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoachComment = typeof coachComments.$inferSelect;
export type InsertCoachComment = typeof coachComments.$inferInsert;

/**
 * Recruiting pipeline
 */
export const recruits = mysqlTable("recruits", {
  id: int("id").autoincrement().primaryKey(),
  recruitId: varchar("recruitId", { length: 32 }).notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  currentBrokerage: varchar("currentBrokerage", { length: 256 }),
  yearsLicensed: int("yearsLicensed"),
  annualVolume: int("annualVolume"),
  stage: mysqlEnum("recruitStage", ["identified", "contacted", "interviewing", "offered", "accepted", "onboarded"]).default("identified").notNull(),
  gwcGet: mysqlEnum("gwcGet", ["yes", "maybe", "no"]),
  gwcWant: mysqlEnum("gwcWant", ["yes", "maybe", "no"]),
  gwcCapacity: mysqlEnum("gwcCapacity", ["yes", "maybe", "no"]),
  cultureFitScore: int("cultureFitScore"),
  cultureFitNotes: text("cultureFitNotes"),
  notes: text("notes"),
  nextTouchDate: timestamp("nextTouchDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recruit = typeof recruits.$inferSelect;
export type InsertRecruit = typeof recruits.$inferInsert;

/**
 * Transaction communications
 */
export const transactionComms = mysqlTable("transaction_comms", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  transactionId: varchar("transactionId", { length: 32 }).notNull(),
  milestone: varchar("milestone", { length: 64 }).notNull(),
  channel: mysqlEnum("commChannel", ["sms", "email"]).notNull(),
  messageBody: text("messageBody"),
  status: varchar("commStatus", { length: 32 }).default("sent").notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TransactionComm = typeof transactionComms.$inferSelect;
export type InsertTransactionComm = typeof transactionComms.$inferInsert;

/**
 * Client portal tokens (public access to transaction status)
 */
export const clientPortalTokens = mysqlTable("client_portal_tokens", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  transactionId: varchar("transactionId", { length: 32 }).notNull(),
  userId: int("userId").notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClientPortalToken = typeof clientPortalTokens.$inferSelect;
export type InsertClientPortalToken = typeof clientPortalTokens.$inferInsert;

/**
 * Referral partners
 */
export const referralPartners = mysqlTable("referral_partners", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: varchar("partnerId", { length: 32 }).notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  company: varchar("company", { length: 256 }),
  role: varchar("partnerRole", { length: 128 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  tier: mysqlEnum("partnerTier", ["A", "B", "C"]).default("B").notNull(),
  referralsSentCount: int("referralsSentCount").default(0).notNull(),
  referralsReceivedCount: int("referralsReceivedCount").default(0).notNull(),
  lifetimeGCIGenerated: int("lifetimeGCIGenerated").default(0).notNull(),
  lastTouchDate: timestamp("lastTouchDate"),
  nextTouchDate: timestamp("nextTouchDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReferralPartner = typeof referralPartners.$inferSelect;
export type InsertReferralPartner = typeof referralPartners.$inferInsert;

/**
 * Referral exchanges (sent/received referrals)
 */
export const referralExchanges = mysqlTable("referral_exchanges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  partnerId: varchar("partnerId", { length: 32 }).notNull(),
  direction: mysqlEnum("direction", ["sent", "received"]).notNull(),
  contactName: varchar("contactName", { length: 256 }),
  estimatedGCI: int("estimatedGCI").default(0),
  status: mysqlEnum("referralStatus", ["referred", "active", "closed", "lost"]).default("referred").notNull(),
  notes: text("notes"),
  referralDate: timestamp("referralDate").defaultNow().notNull(),
  closedAt: timestamp("closedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReferralExchange = typeof referralExchanges.$inferSelect;
export type InsertReferralExchange = typeof referralExchanges.$inferInsert;

/**
 * Reviews
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  reviewId: varchar("reviewId", { length: 32 }).notNull(),
  userId: int("userId").notNull(),
  platform: mysqlEnum("platform", ["google", "zillow", "realtor", "facebook", "other"]).default("google").notNull(),
  reviewerName: varchar("reviewerName", { length: 256 }),
  rating: int("rating"),
  reviewText: text("reviewText"),
  reviewDate: varchar("reviewDate", { length: 32 }),
  transactionId: varchar("transactionId", { length: 32 }),
  requestSentAt: timestamp("requestSentAt"),
  requestChannel: mysqlEnum("requestChannel", ["sms", "email"]),
  responseText: text("responseText"),
  respondedAt: timestamp("respondedAt"),
  isPublic: boolean("isPublic").default(false),
  sourceUrl: varchar("sourceUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Brokerage configuration (multi-brokerage support)
 */
export const brokerageConfig = mysqlTable("brokerage_config", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  brokerageName: varchar("brokerageName", { length: 256 }),
  brandColor: varchar("brandColor", { length: 7 }).default("#DC143C"),
  frameworkName: varchar("frameworkName", { length: 128 }).default("MREA"),
  level1Name: varchar("level1Name", { length: 128 }).default("The Solo Agent"),
  level2Name: varchar("level2Name", { length: 128 }).default("First Admin Hire"),
  level3Name: varchar("level3Name", { length: 128 }).default("First Buyer's Agent"),
  level4Name: varchar("level4Name", { length: 128 }).default("Multiple Buyer's Agents"),
  level5Name: varchar("level5Name", { length: 128 }).default("Listing Specialist + DOO"),
  level6Name: varchar("level6Name", { length: 128 }).default("Full Leadership Team"),
  level7Name: varchar("level7Name", { length: 128 }).default("The 7th Level Business"),
  valuesFramework: varchar("valuesFramework", { length: 128 }).default("WI4C2TS"),
  showKWContent: boolean("showKWContent").default(true).notNull(),
  coachingProgramName: varchar("coachingProgramName", { length: 128 }).default("MAPS Coaching"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BrokerageConfig = typeof brokerageConfig.$inferSelect;
export type InsertBrokerageConfig = typeof brokerageConfig.$inferInsert;
