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
  assignedCoachId: int("assignedCoachId"),
  isAssociateCoach: boolean("isAssociateCoach").default(false).notNull(),
  coachBio: text("coachBio"),
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

// ═══════════════════════════════════════════════════════════════════
// PHASE 6 — COACHING BUSINESS INFRASTRUCTURE
// ═══════════════════════════════════════════════════════════════════

/**
 * Subscriptions (Stripe-backed tiers)
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  tier: mysqlEnum("tier", ["self_guided", "group", "one_on_one", "enterprise"]).default("self_guided").notNull(),
  status: mysqlEnum("subStatus", ["trialing", "active", "past_due", "cancelled"]).default("trialing").notNull(),
  monthlyPriceCents: int("monthlyPriceCents").default(9700).notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  trialEndsAt: timestamp("trialEndsAt"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Coaching sessions (1:1 or group)
 */
export const coachingSessions = mysqlTable("coaching_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 32 }).notNull().unique(),
  coachId: int("coachId").notNull(),
  agentId: int("agentId"),
  cohortId: varchar("cohortId", { length: 32 }),
  type: mysqlEnum("sessionType", ["one_on_one", "group_monthly", "group_checkin"]).notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  completedAt: timestamp("completedAt"),
  durationMinutes: int("durationMinutes"),
  coachNotes: text("coachNotes"),
  clientSummary: text("clientSummary"),
  rating: int("rating"),
  preBriefSentAt: timestamp("preBriefSentAt"),
  zoomLink: varchar("zoomLink", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachingSession = typeof coachingSessions.$inferSelect;
export type InsertCoachingSession = typeof coachingSessions.$inferInsert;

/**
 * Coaching commitments (action items from sessions)
 */
export const coachingCommitments = mysqlTable("coaching_commitments", {
  id: int("id").autoincrement().primaryKey(),
  commitmentId: varchar("commitmentId", { length: 32 }).notNull().unique(),
  sessionId: varchar("sessionId", { length: 32 }).notNull(),
  agentId: int("agentId").notNull(),
  coachId: int("coachId").notNull(),
  text: text("text").notNull(),
  linkedDeliverableId: varchar("linkedDeliverableId", { length: 32 }),
  dueDate: timestamp("dueDate"),
  isComplete: boolean("isComplete").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoachingCommitment = typeof coachingCommitments.$inferSelect;
export type InsertCoachingCommitment = typeof coachingCommitments.$inferInsert;

/**
 * Coaching cohorts (group coaching groups)
 */
export const coachingCohorts = mysqlTable("coaching_cohorts", {
  id: int("id").autoincrement().primaryKey(),
  cohortId: varchar("cohortId", { length: 32 }).notNull().unique(),
  coachId: int("coachId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  type: mysqlEnum("cohortType", ["foundation", "growth", "scale"]).default("foundation").notNull(),
  targetLevelMin: int("targetLevelMin").default(1).notNull(),
  targetLevelMax: int("targetLevelMax").default(2).notNull(),
  maxSize: int("maxSize").default(20).notNull(),
  status: mysqlEnum("cohortStatus", ["forming", "active", "completed"]).default("forming").notNull(),
  zoomLink: varchar("zoomLink", { length: 512 }),
  slackChannelUrl: varchar("slackChannelUrl", { length: 512 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachingCohort = typeof coachingCohorts.$inferSelect;
export type InsertCoachingCohort = typeof coachingCohorts.$inferInsert;

/**
 * Cohort members
 */
export const cohortMembers = mysqlTable("cohort_members", {
  id: int("id").autoincrement().primaryKey(),
  cohortId: varchar("cohortId", { length: 32 }).notNull(),
  agentId: int("agentId").notNull(),
  status: mysqlEnum("memberStatus", ["active", "paused", "graduated", "removed"]).default("active").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type CohortMember = typeof cohortMembers.$inferSelect;
export type InsertCohortMember = typeof cohortMembers.$inferInsert;

/**
 * Certifications (coach certification program)
 */
export const certifications = mysqlTable("certifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  status: mysqlEnum("certStatus", ["not_started", "in_progress", "assessment_pending", "certified", "expired", "revoked"]).default("not_started").notNull(),
  moduleProgress: json("moduleProgress"),
  assessmentScheduledAt: timestamp("assessmentScheduledAt"),
  certifiedAt: timestamp("certifiedAt"),
  certifiedBy: int("certifiedBy"),
  renewalDueAt: timestamp("renewalDueAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = typeof certifications.$inferInsert;


// ═══════════════════════════════════════════════════════════════════
// Phase 9 — Business Journey Feed
// ═══════════════════════════════════════════════════════════════════

/**
 * Journey posts — auto-generated or agent-written milestone posts
 */
export const journeyPosts = mysqlTable('journey_posts', {
  id: int('id').autoincrement().primaryKey(),
  postId: varchar('postId', { length: 32 }).notNull().unique(),
  userId: int('userId').notNull(),

  type: mysqlEnum('postType', [
    'level_advance',
    'deliverable_complete',
    'team_hire',
    'production_milestone',
    'certification',
    'streak',
    'coaching_milestone',
    'culture_win',
    'custom',
  ]).notNull(),

  visibility: mysqlEnum('postVisibility', [
    'private',
    'cohort',
    'community',
    'network',
  ]).default('cohort').notNull(),

  headline: varchar('headline', { length: 256 }).notNull(),
  caption: text('caption'),
  metadata: json('metadata'),

  isPublished: boolean('isPublished').default(false).notNull(),
  isFeatured: boolean('isFeatured').default(false).notNull(),
  featuredBy: int('featuredBy'),
  featuredAt: timestamp('featuredAt'),
  isPinned: boolean('isPinned').default(false).notNull(),

  reactionsCount: int('reactionsCount').default(0).notNull(),
  commentsCount: int('commentsCount').default(0).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type JourneyPost = typeof journeyPosts.$inferSelect;
export type InsertJourneyPost = typeof journeyPosts.$inferInsert;

/**
 * Reactions to posts
 */
export const journeyReactions = mysqlTable('journey_reactions', {
  id: int('id').autoincrement().primaryKey(),
  postId: varchar('postId', { length: 32 }).notNull(),
  userId: int('userId').notNull(),
  type: mysqlEnum('reactionType', [
    'fire',
    'leveling_up',
    'lets_go',
    'been_there',
    'coach_feature',
  ]).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type JourneyReaction = typeof journeyReactions.$inferSelect;
export type InsertJourneyReaction = typeof journeyReactions.$inferInsert;

/**
 * Comments on posts
 */
export const journeyComments = mysqlTable('journey_comments', {
  id: int('id').autoincrement().primaryKey(),
  commentId: varchar('commentId', { length: 32 }).notNull().unique(),
  postId: varchar('postId', { length: 32 }).notNull(),
  userId: int('userId').notNull(),
  body: text('body').notNull(),
  myExperience: text('myExperience'),
  whatHelped: text('whatHelped'),
  isApproved: boolean('isApproved').default(true).notNull(),
  flaggedForReview: boolean('flaggedForReview').default(false).notNull(),
  parentCommentId: varchar('parentCommentId', { length: 32 }),
  likesCount: int('likesCount').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type JourneyComment = typeof journeyComments.$inferSelect;
export type InsertJourneyComment = typeof journeyComments.$inferInsert;

/**
 * Comment likes
 */
export const commentLikes = mysqlTable('comment_likes', {
  id: int('id').autoincrement().primaryKey(),
  commentId: varchar('commentId', { length: 32 }).notNull(),
  userId: int('userId').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

/**
 * Feed connections — who each agent follows beyond their cohort
 */
export const feedConnections = mysqlTable('feed_connections', {
  id: int('id').autoincrement().primaryKey(),
  followerId: int('followerId').notNull(),
  followingId: int('followingId').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type FeedConnection = typeof feedConnections.$inferSelect;
export type InsertFeedConnection = typeof feedConnections.$inferInsert;

// ═══════════════════════════════════════════════════════════════════
// Phase 10 — AI Tools Directory
// ═══════════════════════════════════════════════════════════════════

/**
 * AI Tools directory entries
 */
export const aiTools = mysqlTable('ai_tools', {
  id: int('id').autoincrement().primaryKey(),
  toolId: varchar('toolId', { length: 32 }).notNull().unique(),
  name: varchar('name', { length: 256 }).notNull(),
  tagline: varchar('tagline', { length: 256 }).notNull(),
  description: text('description').notNull(),
  logoUrl: varchar('logoUrl', { length: 512 }),
  websiteUrl: varchar('websiteUrl', { length: 512 }).notNull(),
  affiliateUrl: varchar('affiliateUrl', { length: 512 }),
  affiliateCookieDays: int('affiliateCookieDays').default(30),

  category: mysqlEnum('toolCategory', [
    'lead_generation',
    'ai_writing',
    'video_presentations',
    'transaction_management',
    'financial_intelligence',
    'team_operations',
    'marketing_social',
    'learning_coaching',
    'compliance',
    'data_analytics',
  ]).notNull(),

  pricingModel: mysqlEnum('pricingModel', [
    'free',
    'freemium',
    'paid',
    'per_seat',
    'usage_based',
    'enterprise',
  ]).notNull(),
  pricingFrom: int('pricingFrom'),
  pricingLabel: varchar('pricingLabel', { length: 64 }),

  curationTier: mysqlEnum('curationTier', [
    'vetted',
    'listed',
    'featured',
    'integrated',
    'deprecated',
  ]).default('listed').notNull(),

  integrationStatus: mysqlEnum('integrationStatus', [
    'native',
    'connected',
    'planned',
    'none',
  ]).default('none').notNull(),

  relevantLevels: json('relevantLevels'),
  endorsementQuote: text('endorsementQuote'),
  endorsementContext: varchar('endorsementContext', { length: 256 }),

  upvoteCount: int('upvoteCount').default(0).notNull(),
  clickCount: int('clickCount').default(0).notNull(),
  saveCount: int('saveCount').default(0).notNull(),

  submittedBy: int('submittedBy'),
  isApproved: boolean('isApproved').default(false).notNull(),
  tags: json('tags'),
  sortOrder: int('sortOrder').default(100).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type AITool = typeof aiTools.$inferSelect;
export type InsertAITool = typeof aiTools.$inferInsert;

/**
 * Click tracking for affiliate attribution
 */
export const toolClicks = mysqlTable('tool_clicks', {
  id: int('id').autoincrement().primaryKey(),
  clickId: varchar('clickId', { length: 32 }).notNull().unique(),
  toolId: varchar('toolId', { length: 32 }).notNull(),
  userId: int('userId'),
  sessionId: varchar('sessionId', { length: 64 }),
  referrer: varchar('referrer', { length: 256 }),
  source: varchar('source', { length: 64 }),
  ipHash: varchar('ipHash', { length: 64 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type ToolClick = typeof toolClicks.$inferSelect;
export type InsertToolClick = typeof toolClicks.$inferInsert;

/**
 * Agent tool saves / bookmarks
 */
export const toolSaves = mysqlTable('tool_saves', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  toolId: varchar('toolId', { length: 32 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type ToolSave = typeof toolSaves.$inferSelect;
export type InsertToolSave = typeof toolSaves.$inferInsert;

/**
 * Tool upvotes
 */
export const toolUpvotes = mysqlTable('tool_upvotes', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  toolId: varchar('toolId', { length: 32 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

/**
 * Tool submissions from the community
 */
export const toolSubmissions = mysqlTable('tool_submissions', {
  id: int('id').autoincrement().primaryKey(),
  submissionId: varchar('submissionId', { length: 32 }).notNull().unique(),
  submittedBy: int('submittedBy').notNull(),
  toolName: varchar('toolName', { length: 256 }).notNull(),
  toolUrl: varchar('toolUrl', { length: 512 }).notNull(),
  category: varchar('category', { length: 64 }),
  description: text('description'),
  whyRecommend: text('whyRecommend'),
  status: mysqlEnum('submissionStatus', [
    'pending', 'approved', 'rejected', 'merged',
  ]).default('pending').notNull(),
  reviewNotes: text('reviewNotes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type ToolSubmission = typeof toolSubmissions.$inferSelect;
export type InsertToolSubmission = typeof toolSubmissions.$inferInsert;

/**
 * Coach tool recommendations to specific clients
 */
export const coachToolRecommendations = mysqlTable('coach_tool_recommendations', {
  id: int('id').autoincrement().primaryKey(),
  coachId: int('coachId').notNull(),
  agentId: int('agentId').notNull(),
  toolId: varchar('toolId', { length: 32 }).notNull(),
  note: text('note'),
  isRead: boolean('isRead').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type CoachToolRecommendation = typeof coachToolRecommendations.$inferSelect;
export type InsertCoachToolRecommendation = typeof coachToolRecommendations.$inferInsert;

// ─────────────────────────────────────────────────────────────
// PHASE 11 — KW Model Library
// ─────────────────────────────────────────────────────────────

/**
 * Agent's One Thing — weekly, monthly, annual focusing questions
 */
export const oneThing = mysqlTable('one_thing', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  period: mysqlEnum('period', ['daily', 'weekly', 'monthly', 'annual']).notNull(),
  focusingQuestion: text('focusingQuestion').notNull(),
  statement: text('statement').notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  completedAt: timestamp('completedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type OneThing = typeof oneThing.$inferSelect;
export type InsertOneThing = typeof oneThing.$inferInsert;

/**
 * GPS quarterly planning — Goals, Priorities, Strategies
 */
export const gpsPlans = mysqlTable('gps_plans', {
  id: int('id').autoincrement().primaryKey(),
  planId: varchar('planId', { length: 32 }).notNull().unique(),
  userId: int('userId').notNull(),
  quarter: varchar('quarter', { length: 7 }).notNull(),
  goal: text('goal').notNull(),
  priority1: text('priority1'),
  priority1Strategies: json('priority1Strategies'),
  priority2: text('priority2'),
  priority2Strategies: json('priority2Strategies'),
  priority3: text('priority3'),
  priority3Strategies: json('priority3Strategies'),
  reviewDate: timestamp('reviewDate'),
  isComplete: boolean('isComplete').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type GpsPlan = typeof gpsPlans.$inferSelect;
export type InsertGpsPlan = typeof gpsPlans.$inferInsert;

/**
 * 8x8 contact enrollment — 8 touches in 8 weeks
 */
export const eightByEight = mysqlTable('eight_by_eight', {
  id: int('id').autoincrement().primaryKey(),
  enrollmentId: varchar('enrollmentId', { length: 32 }).notNull().unique(),
  userId: int('userId').notNull(),
  leadId: varchar('leadId', { length: 32 }).notNull(),
  startedAt: timestamp('startedAt').defaultNow().notNull(),
  currentTouch: int('currentTouch').default(1).notNull(),
  completedTouches: json('completedTouches'),
  status: mysqlEnum('eightByEightStatus', [
    'active', 'complete', 'paused', 'converted',
  ]).default('active').notNull(),
  completedAt: timestamp('completedAt'),
});

export type EightByEight = typeof eightByEight.$inferSelect;
export type InsertEightByEight = typeof eightByEight.$inferInsert;

/**
 * 33 Touch annual relationship plan assignments
 */
export const thirtyThreeTouch = mysqlTable('thirty_three_touch', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  leadId: varchar('leadId', { length: 32 }).notNull(),
  year: int('year').notNull(),
  touchesCompleted: int('touchesCompleted').default(0).notNull(),
  lastTouchDate: timestamp('lastTouchDate'),
  nextTouchDue: timestamp('nextTouchDue'),
  touchLog: json('touchLog'),
  isActive: boolean('isActive').default(true).notNull(),
});

export type ThirtyThreeTouch = typeof thirtyThreeTouch.$inferSelect;
export type InsertThirtyThreeTouch = typeof thirtyThreeTouch.$inferInsert;

/**
 * Bold goal — annual transformative goal
 */
export const boldGoal = mysqlTable('bold_goal', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  year: int('year').notNull(),
  goal: text('goal').notNull(),
  whyItMatters: text('whyItMatters'),
  measurableOutcome: text('measurableOutcome'),
  targetDate: timestamp('targetDate'),
  progressNotes: json('progressNotes'),
  isAchieved: boolean('isAchieved').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type BoldGoal = typeof boldGoal.$inferSelect;
export type InsertBoldGoal = typeof boldGoal.$inferInsert;

/**
 * Team member TTSA profiles — Talent, Training, Systems, Accountability
 */
export const ttsaProfiles = mysqlTable('ttsa_profiles', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  teamMemberName: varchar('teamMemberName', { length: 128 }).notNull(),
  role: varchar('role', { length: 64 }),
  talentScore: int('talentScore'),
  talentNotes: text('talentNotes'),
  trainingStatus: mysqlEnum('trainingStatus', [
    'not_started', 'in_progress', 'complete', 'needs_refresh',
  ]),
  currentTraining: varchar('currentTraining', { length: 256 }),
  systemsOwned: json('systemsOwned'),
  accountabilityMethod: varchar('accountabilityMethod', { length: 256 }),
  gwcGetsIt: boolean('gwcGetsIt'),
  gwcWantsIt: boolean('gwcWantsIt'),
  gwcCapacity: boolean('gwcCapacity'),
  lastReviewDate: timestamp('lastReviewDate'),
  careerVision: text('careerVision'),
  discProfile: mysqlEnum('discProfile', ['D', 'I', 'S', 'C', 'DI', 'DC', 'IS', 'SC']),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type TtsaProfile = typeof ttsaProfiles.$inferSelect;
export type InsertTtsaProfile = typeof ttsaProfiles.$inferInsert;

/**
 * Team economic model — separate from individual economic model
 */
export const teamEconomicModel = mysqlTable('team_economic_model', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().unique(),
  teamGciGoal: decimal('teamGciGoal', { precision: 12, scale: 2 }),
  avgSalePrice: decimal('avgSalePrice', { precision: 12, scale: 2 }),
  teamCommissionRate: decimal('teamCommissionRate', { precision: 5, scale: 4 }),
  teamSplitToAgents: decimal('teamSplitToAgents', { precision: 5, scale: 4 }),
  leaderGciTarget: decimal('leaderGciTarget', { precision: 12, scale: 2 }),
  staffingCosts: decimal('staffingCosts', { precision: 12, scale: 2 }),
  marketingBudget: decimal('marketingBudget', { precision: 12, scale: 2 }),
  techBudget: decimal('techBudget', { precision: 12, scale: 2 }),
  otherExpenses: decimal('otherExpenses', { precision: 12, scale: 2 }),
  targetNetProfit: decimal('targetNetProfit', { precision: 12, scale: 2 }),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type TeamEconomicModel = typeof teamEconomicModel.$inferSelect;
export type InsertTeamEconomicModel = typeof teamEconomicModel.$inferInsert;

/**
 * Coaching session live runner state
 */
export const sessionRunnerState = mysqlTable('session_runner_state', {
  id: int('id').autoincrement().primaryKey(),
  sessionId: varchar('sessionId', { length: 32 }).notNull().unique(),
  currentSegment: int('currentSegment').default(0).notNull(),
  segmentStartedAt: timestamp('segmentStartedAt'),
  notes: json('notes'),
  isComplete: boolean('isComplete').default(false).notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type SessionRunnerState = typeof sessionRunnerState.$inferSelect;
export type InsertSessionRunnerState = typeof sessionRunnerState.$inferInsert;

/**
 * Accountability ladder assessments — per agent per coaching session
 */
export const accountabilityAssessments = mysqlTable('accountability_assessments', {
  id: int('id').autoincrement().primaryKey(),
  assessmentId: varchar('assessmentId', { length: 32 }).notNull().unique(),
  coachId: int('coachId').notNull(),
  agentId: int('agentId').notNull(),
  sessionId: varchar('sessionId', { length: 32 }),
  commitmentDescription: text('commitmentDescription'),
  ladderLevel: mysqlEnum('ladderLevel', [
    'blame', 'justification', 'shame',
    'obligation', 'responsibility', 'accountability', 'ownership',
  ]).notNull(),
  coachNotes: text('coachNotes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type AccountabilityAssessment = typeof accountabilityAssessments.$inferSelect;
export type InsertAccountabilityAssessment = typeof accountabilityAssessments.$inferInsert;

/**
 * KW model reference library — structured content for Knowledge Library
 */
export const modelLibrary = mysqlTable('model_library', {
  id: int('id').autoincrement().primaryKey(),
  modelId: varchar('modelId', { length: 64 }).notNull().unique(),
  title: varchar('title', { length: 256 }).notNull(),
  category: mysqlEnum('modelCategory', [
    'mrea_core', 'goal_setting', 'lead_generation',
    'business_philosophy', 'team_leadership', 'coaching_accountability',
  ]).notNull(),
  summary: text('summary').notNull(),
  content: json('content'),
  relevantLevels: json('relevantLevels'),
  relatedModels: json('relatedModels'),
  sortOrder: int('sortOrder').default(100),
  isActive: boolean('isActive').default(true).notNull(),
});

export type ModelLibraryEntry = typeof modelLibrary.$inferSelect;
export type InsertModelLibraryEntry = typeof modelLibrary.$inferInsert;
