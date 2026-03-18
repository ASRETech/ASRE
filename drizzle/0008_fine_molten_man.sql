CREATE TABLE `compliance_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`inputText` text NOT NULL,
	`result` enum('pass','warning','fail') NOT NULL,
	`flaggedItems` json,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliance_logs_id` PRIMARY KEY(`id`)
);
