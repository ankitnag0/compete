CREATE TABLE `team_invite_requests` (
	`id` integer PRIMARY KEY NOT NULL,
	`teamId` integer NOT NULL,
	`inviterId` integer NOT NULL,
	`inviteeId` integer NOT NULL,
	`status` text NOT NULL,
	`dateSent` text NOT NULL,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inviterId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inviteeId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `team_join_requests` (
	`id` integer PRIMARY KEY NOT NULL,
	`teamId` integer NOT NULL,
	`requesterId` integer NOT NULL,
	`status` text NOT NULL,
	`dateRequested` text NOT NULL,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`requesterId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_team_request` ON `team_join_requests` (`teamId`,`requesterId`);