CREATE TABLE `electionConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`state` varchar(2) NOT NULL,
	`municipality` varchar(100) NOT NULL,
	`electionName` varchar(255),
	`electionYear` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `electionConfig_id` PRIMARY KEY(`id`)
);
