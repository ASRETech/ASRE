CREATE TABLE `brokerage_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`brokerageName` varchar(256),
	`brandColor` varchar(7) DEFAULT '#DC143C',
	`frameworkName` varchar(128) DEFAULT 'MREA',
	`level1Name` varchar(128) DEFAULT 'The Solo Agent',
	`level2Name` varchar(128) DEFAULT 'First Admin Hire',
	`level3Name` varchar(128) DEFAULT 'First Buyer''s Agent',
	`level4Name` varchar(128) DEFAULT 'Multiple Buyer''s Agents',
	`level5Name` varchar(128) DEFAULT 'Listing Specialist + DOO',
	`level6Name` varchar(128) DEFAULT 'Full Leadership Team',
	`level7Name` varchar(128) DEFAULT 'The 7th Level Business',
	`valuesFramework` varchar(128) DEFAULT 'WI4C2TS',
	`showKWContent` boolean NOT NULL DEFAULT true,
	`coachingProgramName` varchar(128) DEFAULT 'MAPS Coaching',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brokerage_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `brokerage_config_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `calendar_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` varchar(32) NOT NULL DEFAULT 'google',
	`accessToken` text,
	`refreshToken` text,
	`expiresAt` timestamp,
	`calendarId` varchar(256),
	`syncEnabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendar_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `calendar_tokens_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `client_portal_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(64) NOT NULL,
	`transactionId` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`clientEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `client_portal_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_portal_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `coach_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`agentId` int NOT NULL,
	`deliverableId` varchar(32) NOT NULL,
	`comment` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coach_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coach_relationships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int,
	`agentId` int NOT NULL,
	`coachRelStatus` enum('pending','active','ended') NOT NULL DEFAULT 'pending',
	`inviteToken` varchar(64),
	`inviteEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coach_relationships_id` PRIMARY KEY(`id`),
	CONSTRAINT `coach_relationships_inviteToken_unique` UNIQUE(`inviteToken`)
);
--> statement-breakpoint
CREATE TABLE `recruits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recruitId` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`phone` varchar(32),
	`email` varchar(320),
	`currentBrokerage` varchar(256),
	`yearsLicensed` int,
	`annualVolume` int,
	`recruitStage` enum('identified','contacted','interviewing','offered','accepted','onboarded') NOT NULL DEFAULT 'identified',
	`gwcGet` enum('yes','maybe','no'),
	`gwcWant` enum('yes','maybe','no'),
	`gwcCapacity` enum('yes','maybe','no'),
	`cultureFitScore` int,
	`cultureFitNotes` text,
	`notes` text,
	`nextTouchDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recruits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referral_exchanges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`partnerId` varchar(32) NOT NULL,
	`direction` enum('sent','received') NOT NULL,
	`contactName` varchar(256),
	`estimatedGCI` int DEFAULT 0,
	`referralStatus` enum('referred','active','closed','lost') NOT NULL DEFAULT 'referred',
	`notes` text,
	`referralDate` timestamp NOT NULL DEFAULT (now()),
	`closedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referral_exchanges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referral_partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`company` varchar(256),
	`partnerRole` varchar(128),
	`email` varchar(320),
	`phone` varchar(32),
	`partnerTier` enum('A','B','C') NOT NULL DEFAULT 'B',
	`referralsSentCount` int NOT NULL DEFAULT 0,
	`referralsReceivedCount` int NOT NULL DEFAULT 0,
	`lifetimeGCIGenerated` int NOT NULL DEFAULT 0,
	`lastTouchDate` timestamp,
	`nextTouchDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referral_partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`platform` enum('google','zillow','realtor','facebook','other') NOT NULL DEFAULT 'google',
	`reviewerName` varchar(256),
	`rating` int,
	`reviewText` text,
	`reviewDate` varchar(32),
	`transactionId` varchar(32),
	`requestSentAt` timestamp,
	`requestChannel` enum('sms','email'),
	`responseText` text,
	`respondedAt` timestamp,
	`isPublic` boolean DEFAULT false,
	`sourceUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transaction_comms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`transactionId` varchar(32) NOT NULL,
	`milestone` varchar(64) NOT NULL,
	`commChannel` enum('sms','email') NOT NULL,
	`messageBody` text,
	`commStatus` varchar(32) NOT NULL DEFAULT 'sent',
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transaction_comms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agent_profiles` ADD `name` varchar(256);--> statement-breakpoint
ALTER TABLE `agent_profiles` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `agent_profiles` ADD `coachMode` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `agent_profiles` ADD `googleBusinessUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `agent_profiles` ADD `reviewRequestTemplate` text;--> statement-breakpoint
ALTER TABLE `financial_entries` ADD `receiptUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `financial_entries` ADD `receiptText` text;--> statement-breakpoint
ALTER TABLE `financial_entries` ADD `autoCategory` varchar(128);--> statement-breakpoint
ALTER TABLE `transactions` ADD `clientEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `transactions` ADD `clientPhone` varchar(32);