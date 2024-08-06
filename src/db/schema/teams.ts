import {
  text,
  integer,
  sqliteTable,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { users } from "./users";

// Teams table schema
export const teams = sqliteTable("teams", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  captainId: integer("captainId")
    .notNull()
    .references(() => users.id),
  type: text("type", { enum: ["duo", "squad"] }).notNull(),
});

// TeamMembers table schema
export const teamMembers = sqliteTable(
  "team_members",
  {
    teamId: integer("teamId").notNull(),
    userId: integer("userId").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.teamId, table.userId] }),
    };
  }
);

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;
