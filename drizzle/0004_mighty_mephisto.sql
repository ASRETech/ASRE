ALTER TABLE `coaching_cohorts` RENAME COLUMN `maxMembers` TO `maxSize`;--> statement-breakpoint
ALTER TABLE `certifications` MODIFY COLUMN `certStatus` enum('not_started','in_progress','assessment_pending','certified','expired','revoked') NOT NULL DEFAULT 'not_started';--> statement-breakpoint
ALTER TABLE `coaching_cohorts` MODIFY COLUMN `maxSize` int NOT NULL DEFAULT 20;--> statement-breakpoint
ALTER TABLE `coaching_sessions` MODIFY COLUMN `cohortId` varchar(32);--> statement-breakpoint
ALTER TABLE `coaching_sessions` MODIFY COLUMN `sessionType` enum('one_on_one','group_monthly','group_checkin') NOT NULL;--> statement-breakpoint
ALTER TABLE `coaching_sessions` MODIFY COLUMN `scheduledAt` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `tier` enum('self_guided','group','one_on_one','enterprise') NOT NULL DEFAULT 'self_guided';--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `subStatus` enum('trialing','active','past_due','cancelled') NOT NULL DEFAULT 'trialing';--> statement-breakpoint
ALTER TABLE `agent_profiles` ADD `isAssociateCoach` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `agent_profiles` ADD `coachBio` text;--> statement-breakpoint
ALTER TABLE `certifications` ADD `certifiedBy` int;--> statement-breakpoint
ALTER TABLE `certifications` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `coaching_cohorts` ADD `cohortType` enum('foundation','growth','scale') DEFAULT 'foundation' NOT NULL;--> statement-breakpoint
ALTER TABLE `coaching_cohorts` ADD `targetLevelMin` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `coaching_cohorts` ADD `targetLevelMax` int DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE `coaching_cohorts` ADD `cohortStatus` enum('forming','active','completed') DEFAULT 'forming' NOT NULL;--> statement-breakpoint
ALTER TABLE `coaching_cohorts` ADD `zoomLink` varchar(512);--> statement-breakpoint
ALTER TABLE `coaching_cohorts` ADD `slackChannelUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `coaching_cohorts` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `coaching_cohorts` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD `coachId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `coaching_commitments` ADD `linkedDeliverableId` varchar(32);--> statement-breakpoint
ALTER TABLE `coaching_sessions` ADD `durationMinutes` int;--> statement-breakpoint
ALTER TABLE `coaching_sessions` ADD `rating` int;--> statement-breakpoint
ALTER TABLE `coaching_sessions` ADD `preBriefSentAt` timestamp;--> statement-breakpoint
ALTER TABLE `coaching_sessions` ADD `zoomLink` varchar(512);--> statement-breakpoint
ALTER TABLE `coaching_sessions` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `cohort_members` ADD `memberStatus` enum('active','paused','graduated','removed') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `monthlyPriceCents` int DEFAULT 9700 NOT NULL;--> statement-breakpoint
ALTER TABLE `coaching_cohorts` DROP COLUMN `startDate`;--> statement-breakpoint
ALTER TABLE `coaching_cohorts` DROP COLUMN `endDate`;--> statement-breakpoint
ALTER TABLE `coaching_cohorts` DROP COLUMN `isActive`;