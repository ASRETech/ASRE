-- ASRE Execution System: Action Completions, Streaks, Daily Stats
-- Migration: 0016_execution_system
-- Updated: adds completionDate column + idempotency unique index

CREATE TABLE IF NOT EXISTS `executionActionCompletions` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `actionId` varchar(100) NOT NULL,
  `actionType` varchar(64) NOT NULL,
  `points` int NOT NULL DEFAULT 10,
  `completionDate` varchar(10) NOT NULL,
  `completedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `metadata` json,
  -- Prevents same action being completed twice on the same day
  UNIQUE INDEX `execCompletions_userId_actionId_date_uniq` (`userId`, `actionId`, `completionDate`),
  INDEX `execCompletions_userId_completedAt_idx` (`userId`, `completedAt`)
);

CREATE TABLE IF NOT EXISTS `executionStreaks` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `currentStreak` int NOT NULL DEFAULT 0,
  `longestStreak` int NOT NULL DEFAULT 0,
  `lastQualifiedDate` varchar(10),
  `execStreakUpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX `executionStreaks_userId_unique` (`userId`)
);

CREATE TABLE IF NOT EXISTS `executionDailyStats` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `date` varchar(10) NOT NULL,
  `actionsCompleted` int NOT NULL DEFAULT 0,
  `qualifiedDay` boolean NOT NULL DEFAULT false,
  `scoreAtClose` int,
  `execDailyStatsCreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX `execDailyStats_userId_date_uniq` (`userId`, `date`)
);

-- executionWeeklyStats: persisted weekly leading indicators for Analytics Pulse tab
CREATE TABLE IF NOT EXISTS `executionWeeklyStats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `weekStart` varchar(10) NOT NULL COMMENT 'Monday YYYY-MM-DD UTC',
  `contacts` int NOT NULL DEFAULT 0,
  `appointments` int NOT NULL DEFAULT 0,
  `listings` int NOT NULL DEFAULT 0,
  `closings` int NOT NULL DEFAULT 0,
  `reviewRequests` int NOT NULL DEFAULT 0,
  `referrals` int NOT NULL DEFAULT 0,
  `actionsCompleted` int NOT NULL DEFAULT 0,
  `qualifiedDays` int NOT NULL DEFAULT 0,
  `gciCents` int NOT NULL DEFAULT 0,
  `notes` varchar(500),
  `execWeeklyStatsCreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execWeeklyStatsUpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `execWeeklyStats_userId_weekStart_uniq` (`userId`, `weekStart`)
);
