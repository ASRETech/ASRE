CREATE TABLE `calendarEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventType` enum('financial','milestone','deliverable','lead_gen_block','pulse_reminder') NOT NULL,
	`sourceType` varchar(50),
	`sourceKey` varchar(100),
	`title` varchar(255) NOT NULL,
	`description` text,
	`suggestedDate` varchar(10),
	`suggestedStartTime` varchar(5),
	`durationMinutes` int DEFAULT 60,
	`isRecurring` boolean DEFAULT false,
	`recurrenceRule` varchar(255),
	`gcalColorId` varchar(5),
	`remindMinutesBefore` int DEFAULT 30,
	`calEventStatus` enum('pending','pushed','skipped','completed','cancelled') DEFAULT 'pending',
	`gcalEventId` varchar(255),
	`gcalCalendarId` varchar(255),
	`pushedAt` timestamp,
	`completedAt` timestamp,
	`isPreferredWindow` boolean DEFAULT true,
	`fallbackReason` varchar(100),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `calendarEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `calendarSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gcalAccessToken` text,
	`gcalRefreshToken` text,
	`gcalCalendarId` varchar(255),
	`gcalWatchChannelId` varchar(255),
	`gcalWatchExpiry` timestamp,
	`leadGenEnabled` boolean DEFAULT true,
	`leadGenStartTime` varchar(5) DEFAULT '07:00',
	`leadGenDays` varchar(50) DEFAULT 'MO,TU,WE,TH,FR',
	`contactsPerHour` decimal(4,1) DEFAULT '2.0',
	`requireApprovalBeforePush` boolean DEFAULT true,
	`notifyFinancialDeadlines` boolean DEFAULT true,
	`notifyMilestones` boolean DEFAULT true,
	`notifyDeliverables` boolean DEFAULT true,
	`notifyPulseReminder` boolean DEFAULT true,
	`pulseReminderTime` varchar(5) DEFAULT '17:00',
	`calSettingsUpdatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `calendarSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `calendarSettings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `scheduleBucketCustomizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bucketKey` varchar(50) NOT NULL,
	`label` varchar(100),
	`color` varchar(20),
	`bucketCustUpdatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `scheduleBucketCustomizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schedulePreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weeklyGrid` json,
	`templateApplied` varchar(50),
	`schedPrefUpdatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `schedulePreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `schedulePreferences_userId_unique` UNIQUE(`userId`)
);
