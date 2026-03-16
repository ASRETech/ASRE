CREATE TABLE `certifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`certStatus` enum('not_started','in_progress','assessment_pending','certified') NOT NULL DEFAULT 'not_started',
	`moduleProgress` json,
	`assessmentScheduledAt` timestamp,
	`certifiedAt` timestamp,
	`renewalDueAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `certifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `certifications_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `coaching_cohorts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cohortId` varchar(32) NOT NULL,
	`coachId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`maxMembers` int DEFAULT 20,
	`startDate` timestamp,
	`endDate` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_cohorts_id` PRIMARY KEY(`id`),
	CONSTRAINT `coaching_cohorts_cohortId_unique` UNIQUE(`cohortId`)
);
--> statement-breakpoint
CREATE TABLE `coaching_commitments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commitmentId` varchar(32) NOT NULL,
	`sessionId` varchar(32) NOT NULL,
	`agentId` int NOT NULL,
	`text` text NOT NULL,
	`dueDate` timestamp,
	`isComplete` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_commitments_id` PRIMARY KEY(`id`),
	CONSTRAINT `coaching_commitments_commitmentId_unique` UNIQUE(`commitmentId`)
);
--> statement-breakpoint
CREATE TABLE `coaching_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(32) NOT NULL,
	`coachId` int NOT NULL,
	`agentId` int,
	`cohortId` int,
	`sessionType` enum('one_on_one','group_monthly','group_checkin') NOT NULL DEFAULT 'one_on_one',
	`scheduledAt` timestamp,
	`completedAt` timestamp,
	`coachNotes` text,
	`clientSummary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `coaching_sessions_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `cohort_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cohortId` varchar(32) NOT NULL,
	`agentId` int NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cohort_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tier` enum('self_guided','group','one_on_one') NOT NULL DEFAULT 'self_guided',
	`subStatus` enum('trialing','active','past_due','canceled','incomplete') NOT NULL DEFAULT 'trialing',
	`stripeCustomerId` varchar(128),
	`stripeSubscriptionId` varchar(128),
	`currentPeriodEnd` timestamp,
	`trialEndsAt` timestamp,
	`cancelAtPeriodEnd` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `agent_profiles` ADD `assignedCoachId` int;