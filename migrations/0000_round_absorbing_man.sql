CREATE TABLE `team_members` (
	`teamId` integer NOT NULL,
	`userId` integer NOT NULL,
	PRIMARY KEY(`teamId`, `userId`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`captainId` integer NOT NULL,
	`type` text NOT NULL,
	FOREIGN KEY (`captainId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`gamerTag` text
);
