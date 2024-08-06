import {
  text,
  integer,
  sqliteTable,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { teams } from "./teams";

// TeamInviteRequests table schema
export const teamInviteRequests = sqliteTable("team_invite_requests", {
  id: integer("id").primaryKey(),
  teamId: integer("teamId")
    .notNull()
    .references(() => teams.id),
  inviterId: integer("inviterId")
    .notNull()
    .references(() => users.id),
  inviteeId: integer("inviteeId")
    .notNull()
    .references(() => users.id),
  status: text("status", {
    enum: ["pending", "accepted", "rejected"],
  }).notNull(),
  dateSent: text("dateSent").notNull(),
});

// TeamJoinRequests table schema
export const teamJoinRequests = sqliteTable(
  "team_join_requests",
  {
    id: integer("id").primaryKey(),
    teamId: integer("teamId")
      .notNull()
      .references(() => teams.id),
    requesterId: integer("requesterId")
      .notNull()
      .references(() => users.id),
    status: text("status", {
      enum: ["pending", "accepted", "rejected"],
    }).notNull(),
    dateRequested: text("dateRequested").notNull(),
  },
  (table) => {
    return {
      uniqueRequest: uniqueIndex("unique_team_request").on(
        table.teamId,
        table.requesterId
      ),
    };
  }
);

export type TeamInviteRequest = typeof teamInviteRequests.$inferSelect;
export type InsertTeamInviteRequest = typeof teamInviteRequests.$inferInsert;

export type TeamJoinRequest = typeof teamJoinRequests.$inferSelect;
export type InsertTeamJoinRequest = typeof teamJoinRequests.$inferInsert;
