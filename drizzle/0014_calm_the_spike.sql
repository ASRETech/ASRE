CREATE TABLE `appLocks` (
	`lockKey` varchar(100) NOT NULL,
	`lockedAt` timestamp NOT NULL,
	`lockedBy` varchar(100),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `appLocks_lockKey` PRIMARY KEY(`lockKey`)
);
--> statement-breakpoint
ALTER TABLE `calendarSettings` ADD `gcalWatchChannelToken` varchar(100);--> statement-breakpoint
ALTER TABLE `calendarSettings` ADD `hasScopeCalendar` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `calendarSettings` ADD `timezone` varchar(60) DEFAULT 'America/New_York';--> statement-breakpoint
ALTER TABLE `wealthProfile` ADD `aiInsightsJson` json;--> statement-breakpoint
ALTER TABLE `wealthProfile` ADD `aiInsightsCachedAt` timestamp;