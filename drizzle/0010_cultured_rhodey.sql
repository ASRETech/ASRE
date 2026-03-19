CREATE TABLE `drive_sync_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`syncType` varchar(64) NOT NULL,
	`status` enum('success','failed') NOT NULL,
	`error` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `drive_sync_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `drive_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text NOT NULL,
	`expiresAt` timestamp,
	`rootFolderId` varchar(64),
	`sheetIds` json,
	`rollupSheetId` varchar(64),
	`rollupFolderId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drive_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `drive_tokens_userId_unique` UNIQUE(`userId`)
);
