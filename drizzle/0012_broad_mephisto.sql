CREATE TABLE `investmentProperties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`address` varchar(300),
	`purchaseDate` date,
	`purchasePrice` decimal(12,2),
	`currentValue` decimal(12,2),
	`monthlyRent` decimal(10,2),
	`monthlyExpenses` decimal(10,2),
	`strategy` enum('brrrr','buy_hold','flip','other') DEFAULT 'buy_hold',
	`status` enum('active','sold','under_contract') DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `investmentProperties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wealthMilestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`milestoneKey` varchar(100) NOT NULL,
	`status` enum('not_started','in_progress','done') DEFAULT 'not_started',
	`completedDate` date,
	`notes` text,
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `wealthMilestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wealthProfile` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`annualExpenses` decimal(12,2),
	`fiNumber` decimal(12,2),
	`savingsRatePct` decimal(5,2),
	`tithePct` decimal(5,2) DEFAULT '10',
	`expectedReturnPct` decimal(5,2) DEFAULT '8',
	`hasLLC` boolean DEFAULT false,
	`llcName` varchar(200),
	`llcFormDate` date,
	`hasSCorp` boolean DEFAULT false,
	`scorp2553FiledDate` date,
	`hasSepIra` boolean DEFAULT false,
	`hasRothIra` boolean DEFAULT false,
	`hasInvestmentProperty` boolean DEFAULT false,
	`hasEmergencyFund3Mo` boolean DEFAULT false,
	`hasBasicWill` boolean DEFAULT false,
	`hasCPA` boolean DEFAULT false,
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wealthProfile_id` PRIMARY KEY(`id`),
	CONSTRAINT `wealthProfile_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `wealthTracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackNumber` int NOT NULL,
	`isUnlocked` boolean DEFAULT false,
	`unlockedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `wealthTracks_id` PRIMARY KEY(`id`)
);
