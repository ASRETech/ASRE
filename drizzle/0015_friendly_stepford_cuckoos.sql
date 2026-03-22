DROP TABLE `wealthTracks`;--> statement-breakpoint
ALTER TABLE `agent_profiles` ADD `marketCenterId` varchar(100);--> statement-breakpoint
ALTER TABLE `agent_profiles` ADD `marketCenterName` varchar(200);--> statement-breakpoint
ALTER TABLE `agent_profiles` ADD `agentRole` enum('agent','coach','mc_op','team_leader','admin') DEFAULT 'agent';--> statement-breakpoint
ALTER TABLE `wealthMilestones` ADD CONSTRAINT `wealthMilestones_userId_key_idx` UNIQUE(`userId`,`milestoneKey`);--> statement-breakpoint
CREATE INDEX `calendarEvents_userId_status_idx` ON `calendarEvents` (`userId`,`calEventStatus`);--> statement-breakpoint
CREATE INDEX `calendarEvents_sourceKey_idx` ON `calendarEvents` (`userId`,`sourceKey`);