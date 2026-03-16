CREATE TABLE `agent_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`brokerage` varchar(128),
	`marketCenter` varchar(128),
	`state` varchar(4),
	`yearsExperience` int,
	`gciLastYear` int,
	`teamSize` int DEFAULT 1,
	`currentLevel` int NOT NULL DEFAULT 1,
	`operationalScore` int DEFAULT 0,
	`incomeGoal` int DEFAULT 250000,
	`diagnosticAnswers` json,
	`topProblems` json,
	`isOnboarded` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_coaching_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`context` varchar(128) NOT NULL,
	`prompt` text NOT NULL,
	`response` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_coaching_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`inputText` text NOT NULL,
	`result` enum('pass','warning','fail') NOT NULL,
	`flaggedItems` json,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliance_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `culture_docs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`missionStatement` text,
	`visionStatement` text,
	`coreValues` json,
	`teamCommitments` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `culture_docs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliverables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deliverableId` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`level` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`isComplete` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`builderData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliverables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entryType` enum('income','expense') NOT NULL,
	`category` varchar(128) NOT NULL,
	`description` text,
	`amount` int NOT NULL,
	`date` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `financial_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`firstName` varchar(128) NOT NULL,
	`lastName` varchar(128),
	`email` varchar(320),
	`phone` varchar(32),
	`type` enum('buyer','seller','both','investor','renter') NOT NULL DEFAULT 'buyer',
	`source` varchar(64),
	`stage` varchar(32) NOT NULL DEFAULT 'New Lead',
	`budget` int DEFAULT 0,
	`timeline` varchar(64),
	`tags` json,
	`lastContactedAt` timestamp,
	`nextAction` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sopId` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`category` varchar(128),
	`content` text,
	`sopStatus` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`propertyAddress` varchar(512) NOT NULL,
	`clientName` varchar(256),
	`transactionType` enum('buyer','seller','dual') NOT NULL DEFAULT 'buyer',
	`status` enum('pre-contract','under-contract','clear-to-close','closed','cancelled') NOT NULL DEFAULT 'pre-contract',
	`salePrice` int DEFAULT 0,
	`commission` int DEFAULT 0,
	`closeDate` varchar(32),
	`checklist` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
