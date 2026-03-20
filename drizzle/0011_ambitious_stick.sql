CREATE TABLE `weekly_pulses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weekEnding` varchar(20) NOT NULL,
	`contactsMade` int NOT NULL DEFAULT 0,
	`appointmentsSet` int NOT NULL DEFAULT 0,
	`appointmentsHeld` int NOT NULL DEFAULT 0,
	`buyerAgreements` int NOT NULL DEFAULT 0,
	`listingAppointments` int NOT NULL DEFAULT 0,
	`listingAgreements` int NOT NULL DEFAULT 0,
	`contractsWritten` int NOT NULL DEFAULT 0,
	`closings` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weekly_pulses_id` PRIMARY KEY(`id`)
);
