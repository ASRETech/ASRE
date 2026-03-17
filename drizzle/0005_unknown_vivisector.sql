CREATE TABLE `ai_tools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`toolId` varchar(32) NOT NULL,
	`name` varchar(256) NOT NULL,
	`tagline` varchar(256) NOT NULL,
	`description` text NOT NULL,
	`logoUrl` varchar(512),
	`websiteUrl` varchar(512) NOT NULL,
	`affiliateUrl` varchar(512),
	`affiliateCookieDays` int DEFAULT 30,
	`toolCategory` enum('lead_generation','ai_writing','video_presentations','transaction_management','financial_intelligence','team_operations','marketing_social','learning_coaching','compliance','data_analytics') NOT NULL,
	`pricingModel` enum('free','freemium','paid','per_seat','usage_based','enterprise') NOT NULL,
	`pricingFrom` int,
	`pricingLabel` varchar(64),
	`curationTier` enum('vetted','listed','featured','integrated','deprecated') NOT NULL DEFAULT 'listed',
	`integrationStatus` enum('native','connected','planned','none') NOT NULL DEFAULT 'none',
	`relevantLevels` json,
	`endorsementQuote` text,
	`endorsementContext` varchar(256),
	`upvoteCount` int NOT NULL DEFAULT 0,
	`clickCount` int NOT NULL DEFAULT 0,
	`saveCount` int NOT NULL DEFAULT 0,
	`submittedBy` int,
	`isApproved` boolean NOT NULL DEFAULT false,
	`tags` json,
	`sortOrder` int NOT NULL DEFAULT 100,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_tools_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_tools_toolId_unique` UNIQUE(`toolId`)
);
--> statement-breakpoint
CREATE TABLE `coach_tool_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`agentId` int NOT NULL,
	`toolId` varchar(32) NOT NULL,
	`note` text,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coach_tool_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comment_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commentId` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comment_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feed_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`followerId` int NOT NULL,
	`followingId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feed_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journey_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commentId` varchar(32) NOT NULL,
	`postId` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`body` text NOT NULL,
	`myExperience` text,
	`whatHelped` text,
	`isApproved` boolean NOT NULL DEFAULT true,
	`flaggedForReview` boolean NOT NULL DEFAULT false,
	`parentCommentId` varchar(32),
	`likesCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journey_comments_id` PRIMARY KEY(`id`),
	CONSTRAINT `journey_comments_commentId_unique` UNIQUE(`commentId`)
);
--> statement-breakpoint
CREATE TABLE `journey_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`postType` enum('level_advance','deliverable_complete','team_hire','production_milestone','certification','streak','coaching_milestone','culture_win','custom') NOT NULL,
	`postVisibility` enum('private','cohort','community','network') NOT NULL DEFAULT 'cohort',
	`headline` varchar(256) NOT NULL,
	`caption` text,
	`metadata` json,
	`isPublished` boolean NOT NULL DEFAULT false,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`featuredBy` int,
	`featuredAt` timestamp,
	`isPinned` boolean NOT NULL DEFAULT false,
	`reactionsCount` int NOT NULL DEFAULT 0,
	`commentsCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journey_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `journey_posts_postId_unique` UNIQUE(`postId`)
);
--> statement-breakpoint
CREATE TABLE `journey_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`reactionType` enum('fire','leveling_up','lets_go','been_there','coach_feature') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journey_reactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tool_clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clickId` varchar(32) NOT NULL,
	`toolId` varchar(32) NOT NULL,
	`userId` int,
	`sessionId` varchar(64),
	`referrer` varchar(256),
	`source` varchar(64),
	`ipHash` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tool_clicks_id` PRIMARY KEY(`id`),
	CONSTRAINT `tool_clicks_clickId_unique` UNIQUE(`clickId`)
);
--> statement-breakpoint
CREATE TABLE `tool_saves` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`toolId` varchar(32) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tool_saves_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tool_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` varchar(32) NOT NULL,
	`submittedBy` int NOT NULL,
	`toolName` varchar(256) NOT NULL,
	`toolUrl` varchar(512) NOT NULL,
	`category` varchar(64),
	`description` text,
	`whyRecommend` text,
	`submissionStatus` enum('pending','approved','rejected','merged') NOT NULL DEFAULT 'pending',
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tool_submissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `tool_submissions_submissionId_unique` UNIQUE(`submissionId`)
);
--> statement-breakpoint
CREATE TABLE `tool_upvotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`toolId` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tool_upvotes_id` PRIMARY KEY(`id`)
);
