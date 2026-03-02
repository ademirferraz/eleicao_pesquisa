CREATE TABLE `adminSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`votingEnabled` boolean NOT NULL DEFAULT true,
	`registrationEnabled` boolean NOT NULL DEFAULT true,
	`maxCandidates` int NOT NULL DEFAULT 6,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `candidates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`number` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`party` varchar(100),
	`position` varchar(100),
	`photoUrl` text,
	`bio` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidates_id` PRIMARY KEY(`id`),
	CONSTRAINT `candidates_number_unique` UNIQUE(`number`)
);
--> statement-breakpoint
CREATE TABLE `voters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cpf` varchar(14) NOT NULL,
	`name` varchar(255) NOT NULL,
	`birthDate` varchar(10) NOT NULL,
	`state` varchar(2) NOT NULL,
	`municipality` varchar(100) NOT NULL,
	`neighborhood` varchar(100) NOT NULL,
	`hasVoted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `voters_id` PRIMARY KEY(`id`),
	CONSTRAINT `voters_cpf_unique` UNIQUE(`cpf`)
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`voterId` int NOT NULL,
	`candidateId` int NOT NULL,
	`candidateNumber` int NOT NULL,
	`state` varchar(2) NOT NULL,
	`municipality` varchar(100) NOT NULL,
	`neighborhood` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `votes_id` PRIMARY KEY(`id`)
);
