CREATE TABLE `accountability_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` varchar(32) NOT NULL,
	`coachId` int NOT NULL,
	`agentId` int NOT NULL,
	`sessionId` varchar(32),
	`commitmentDescription` text,
	`ladderLevel` enum('blame','justification','shame','obligation','responsibility','accountability','ownership') NOT NULL,
	`coachNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accountability_assessments_id` PRIMARY KEY(`id`),
	CONSTRAINT `accountability_assessments_assessmentId_unique` UNIQUE(`assessmentId`)
);
--> statement-breakpoint
CREATE TABLE `bold_goal` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`year` int NOT NULL,
	`goal` text NOT NULL,
	`whyItMatters` text,
	`measurableOutcome` text,
	`targetDate` timestamp,
	`progressNotes` json,
	`isAchieved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bold_goal_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eight_by_eight` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrollmentId` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`leadId` varchar(32) NOT NULL,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`currentTouch` int NOT NULL DEFAULT 1,
	`completedTouches` json,
	`eightByEightStatus` enum('active','complete','paused','converted') NOT NULL DEFAULT 'active',
	`completedAt` timestamp,
	CONSTRAINT `eight_by_eight_id` PRIMARY KEY(`id`),
	CONSTRAINT `eight_by_eight_enrollmentId_unique` UNIQUE(`enrollmentId`)
);
--> statement-breakpoint
CREATE TABLE `gps_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`quarter` varchar(7) NOT NULL,
	`goal` text NOT NULL,
	`priority1` text,
	`priority1Strategies` json,
	`priority2` text,
	`priority2Strategies` json,
	`priority3` text,
	`priority3Strategies` json,
	`reviewDate` timestamp,
	`isComplete` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gps_plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `gps_plans_planId_unique` UNIQUE(`planId`)
);
--> statement-breakpoint
CREATE TABLE `model_library` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modelId` varchar(64) NOT NULL,
	`title` varchar(256) NOT NULL,
	`modelCategory` enum('mrea_core','goal_setting','lead_generation','business_philosophy','team_leadership','coaching_accountability') NOT NULL,
	`summary` text NOT NULL,
	`content` json,
	`relevantLevels` json,
	`relatedModels` json,
	`sortOrder` int DEFAULT 100,
	`isActive` boolean NOT NULL DEFAULT true,
	CONSTRAINT `model_library_id` PRIMARY KEY(`id`),
	CONSTRAINT `model_library_modelId_unique` UNIQUE(`modelId`)
);
--> statement-breakpoint
CREATE TABLE `one_thing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`period` enum('daily','weekly','monthly','annual') NOT NULL,
	`focusingQuestion` text NOT NULL,
	`statement` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `one_thing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session_runner_state` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(32) NOT NULL,
	`currentSegment` int NOT NULL DEFAULT 0,
	`segmentStartedAt` timestamp,
	`notes` json,
	`isComplete` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `session_runner_state_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_runner_state_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `team_economic_model` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`teamGciGoal` decimal(12,2),
	`avgSalePrice` decimal(12,2),
	`teamCommissionRate` decimal(5,4),
	`teamSplitToAgents` decimal(5,4),
	`leaderGciTarget` decimal(12,2),
	`staffingCosts` decimal(12,2),
	`marketingBudget` decimal(12,2),
	`techBudget` decimal(12,2),
	`otherExpenses` decimal(12,2),
	`targetNetProfit` decimal(12,2),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_economic_model_id` PRIMARY KEY(`id`),
	CONSTRAINT `team_economic_model_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `thirty_three_touch` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`leadId` varchar(32) NOT NULL,
	`year` int NOT NULL,
	`touchesCompleted` int NOT NULL DEFAULT 0,
	`lastTouchDate` timestamp,
	`nextTouchDue` timestamp,
	`touchLog` json,
	`isActive` boolean NOT NULL DEFAULT true,
	CONSTRAINT `thirty_three_touch_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ttsa_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`teamMemberName` varchar(128) NOT NULL,
	`role` varchar(64),
	`talentScore` int,
	`talentNotes` text,
	`trainingStatus` enum('not_started','in_progress','complete','needs_refresh'),
	`currentTraining` varchar(256),
	`systemsOwned` json,
	`accountabilityMethod` varchar(256),
	`gwcGetsIt` boolean,
	`gwcWantsIt` boolean,
	`gwcCapacity` boolean,
	`lastReviewDate` timestamp,
	`careerVision` text,
	`discProfile` enum('D','I','S','C','DI','DC','IS','SC'),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ttsa_profiles_id` PRIMARY KEY(`id`)
);
