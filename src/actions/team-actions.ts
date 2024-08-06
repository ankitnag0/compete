"use server";

import { db } from "@/db";
import { teamInviteRequests, teamJoinRequests } from "@/db/schema/join-invites";
import { teamMembers, teams } from "@/db/schema/teams";
import { users } from "@/db/schema/users";
import CreateTeamSchema from "@/lib/schema/CreateTeamSchema";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { and, eq, like, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function createTeam(formInputs: unknown) {
  try {
    const { userId } = auth();
    if (!userId) {
      return { success: false, error: "No Logged In User" };
    }
    const parsed = CreateTeamSchema.safeParse(formInputs);
    if (parsed.error) {
      return { success: false, error: parsed.error.format() };
    }

    const { teamName, teamType } = parsed.data;

    const authUser = await clerkClient.users.getUser(userId);
    const email = authUser.primaryEmailAddress?.emailAddress;
    if (!email) {
      return { success: false, error: "No email linked with user" };
    }

    const user = await db.select().from(users).where(eq(users.email, email));

    const team = await db.insert(teams).values({
      captainId: user[0].id,
      name: teamName,
      type: teamType,
    });

    const newTeamMember = await db.insert(teamMembers).values({
      teamId: Number(team.lastInsertRowid),
      userId: user[0].id,
    });

    revalidatePath("/account");

    return {
      success: true,
      message: "Team created.",
    };
  } catch (error) {
    console.log("🚀 ~ createTeam ~ error:", error);
    return {
      success: false,
      error: "Could not create team.",
    };
  }
}
export async function updateTeam(formInputs: { teamId: number } & unknown) {
  try {
    const { userId } = auth();
    if (!userId) {
      return { success: false, error: "No Logged In User" };
    }

    const parsed = CreateTeamSchema.safeParse(formInputs);
    if (parsed.error) {
      return { success: false, error: parsed.error.format() };
    }

    const teamId = formInputs.teamId;

    const { teamName, teamType } = parsed.data;

    const authUser = await clerkClient.users.getUser(userId);
    const email = authUser.primaryEmailAddress?.emailAddress;
    if (!email) {
      return { success: false, error: "No email linked with user" };
    }

    const user = await db.select().from(users).where(eq(users.email, email));
    const userIdFromDb = user[0].id;

    // Check if the team exists and if the current user is the captain
    const team = await db.select().from(teams).where(eq(teams.id, teamId));
    if (!team) {
      return { success: false, error: "Team not found" };
    }

    if (team[0].captainId !== userIdFromDb) {
      return { success: false, error: "You are not the captain of this team" };
    }

    // Update the team details
    await db
      .update(teams)
      .set({
        name: teamName,
        type: teamType,
      })
      .where(eq(teams.id, teamId));

    revalidatePath("/account");

    return {
      success: true,
      message: "Team updated successfully.",
    };
  } catch (error) {
    console.log("🚀 ~ updateTeam ~ error:", error);
    return {
      success: false,
      error: "Could not update team.",
    };
  }
}

const RemoveTeamMemberSchema = z.object({
  teamId: z.coerce.number(),
  memberId: z.coerce.number(),
});

export async function removeTeamMember(formInputs: unknown) {
  const { userId } = auth();
  if (!userId) {
    return { success: false, error: "No Logged In User" };
  }

  const parsed = RemoveTeamMemberSchema.safeParse(formInputs);
  if (parsed.error) {
    return { success: false, error: parsed.error.format() };
  }

  const { teamId, memberId } = parsed.data;

  // check owenership
  const dbUserId = await getDbUserId(userId);
  if (!dbUserId.success) {
    return { success: false, error: "User not found in the database" };
  }

  const team = await db
    .select()
    .from(teams)
    .where(and(eq(teams.id, teamId), eq(teams.captainId, dbUserId.userId)));

  if (team.length === 0) {
    return { success: false, error: "Team not found or not owned by user" };
  }

  await db
    .delete(teamMembers)
    .where(
      and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, memberId))
    );
  revalidatePath("/account");

  if (removeTeamMember.length === 1) {
    return {
      success: true,
      message: "Team member removed from team",
    };
  }
}

interface Team {
  id: number;
  name: string;
  captainId: number;
  type: "duo" | "squad";
}

interface TeamMember {
  teamId: number;
  userId: number;
}

interface User {
  id: number;
  email: string;
  phone: string;
  gamerTag: string;
}

// Define types for invite and join requests
type Invite = {
  userId: number;
  gamerTag: string | null; // Include gamerTag
  status: string; // Adjust status type if needed
};

type JoinRequest = {
  userId: number;
  gamerTag: string | null; // Include gamerTag
  status: string; // Adjust status type if needed
};

// Update the GroupedTeam type to include invites and joinRequests
type GroupedTeam = {
  team: {
    id: number;
    name: string;
    captainId: number;
    type: "duo" | "squad";
  };
  members: {
    userId: number;
    // email: string;
    // phone: string | null;
    gamerTag: string | null;
  }[];
  invites: Invite[];
  joinRequests: JoinRequest[];
};

export async function getUserTeams(userId: number) {
  try {
    // Create aliases for self-joins
    const inviteeAlias = alias(users, "invitee");
    const requesterAlias = alias(users, "requester");

    const userTeams = await db
      .select()
      .from(teams)
      .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
      .leftJoin(users, eq(teamMembers.userId, users.id))
      .leftJoin(teamInviteRequests, eq(teams.id, teamInviteRequests.teamId))
      .leftJoin(inviteeAlias, eq(teamInviteRequests.inviteeId, inviteeAlias.id)) // Join for invitees
      .leftJoin(teamJoinRequests, eq(teams.id, teamJoinRequests.teamId))
      .leftJoin(
        requesterAlias,
        eq(teamJoinRequests.requesterId, requesterAlias.id)
      ) // Join for requesters
      .where(eq(teams.captainId, userId));

    if (!userTeams) {
      return {
        success: false,
        error: "Teams not found",
      };
    }

    const groupedTeams = userTeams.reduce<{ [key: number]: GroupedTeam }>(
      (acc, item) => {
        const teamId = item.teams.id;

        // Check if the team is already in the accumulator
        if (!acc[teamId]) {
          acc[teamId] = {
            team: item.teams,
            members: [],
            invites: [],
            joinRequests: [],
          };
        }

        // Add team member if present
        if (item.team_members && item.users) {
          acc[teamId].members.push({
            userId: item.team_members.userId,
            // email: item.users.email,
            // phone: item.users.phone,
            gamerTag: item.users.gamerTag,
          });
        }

        // Add invite if present
        if (item.team_invite_requests && item.invitee) {
          acc[teamId].invites.push({
            userId: item.team_invite_requests.inviteeId,
            gamerTag: item.invitee.gamerTag, // Include gamerTag for invites
            status: item.team_invite_requests.status,
          });
        }

        // Add join request if present
        if (item.team_join_requests && item.requester) {
          acc[teamId].joinRequests.push({
            userId: item.team_join_requests.requesterId,
            gamerTag: item.requester.gamerTag, // Include gamerTag for join requests
            status: item.team_join_requests.status,
          });
        }

        return acc;
      },
      {}
    );

    // Convert to array if needed
    const result: GroupedTeam[] = Object.values(groupedTeams);

    return {
      success: true,
      message: "Teams fetched.",
      data: result,
    };
  } catch (error) {
    console.log("🚀 ~ getUserTeams ~ error:", error);
    return {
      success: false,
      error: "Could not fetch teams.",
    };
  }
}

type GetDbUserIdResult =
  | { success: true; userId: number }
  | { success: false; error: string };

async function getDbUserId(userId: string): Promise<GetDbUserIdResult> {
  try {
    const authUser = await clerkClient.users.getUser(userId);
    const email = authUser.primaryEmailAddress?.emailAddress;

    if (!email) {
      return { success: false, error: "No email linked with user" };
    }

    const user = await db.select().from(users).where(eq(users.email, email));

    if (user.length === 0) {
      return { success: false, error: "User not found in the database" };
    }

    const userIdFromDb = user[0].id;
    return { success: true, userId: userIdFromDb };
  } catch (error) {
    return {
      success: false,
      error: "An error occurred while fetching the user",
    };
  }
}

export async function searchUsers(searchQuery: string) {
  try {
    const { userId } = auth();
    if (!userId) {
      return { success: false, error: "No Logged In User" };
    }

    if (!searchQuery.trim()) {
      return { success: false, error: "Search query cannot be empty" };
    }

    const dbUserId = await getDbUserId(userId);
    if (!dbUserId.success) {
      return { success: false, error: "User not found in the database" };
    }

    // Perform the search query
    const results = await db
      .select()
      .from(users)
      .where(
        and(
          like(users.gamerTag, `%${searchQuery}%`),
          ne(users.id, dbUserId.userId)
          // users.id.neq(userId) // Using neq to exclude the current user
        )
      );
    // .where(like(users.gamerTag, `%${searchQuery}%`));
    return { success: true, data: results };
  } catch (error) {
    console.log("🚀 ~ searchUsers ~ error:", error);
    return { success: false, error: "Something went wrong!" };
  }
}

export async function inviteUserToTeam(teamId: number, memberId: number) {
  try {
    const { userId } = auth();
    if (!userId) {
      return { success: false, error: "No Logged In User" };
    }

    // Get the current user's email
    const authUser = await clerkClient.users.getUser(userId);
    const email = authUser.primaryEmailAddress?.emailAddress;
    if (!email) {
      return { success: false, error: "No email linked with user" };
    }

    // Get the current user's ID
    const user = await db.select().from(users).where(eq(users.email, email));
    const currentUserId = user[0].id;

    // Check if the team exists and if the current user is the captain
    const team = await db.select().from(teams).where(eq(teams.id, teamId));
    if (team.length === 0) {
      return { success: false, error: "Team not found" };
    }

    if (team[0].captainId !== currentUserId) {
      return { success: false, error: "You are not the captain of this team" };
    }

    // Check if an invite already exists
    const existingInvite = await db
      .select()
      .from(teamInviteRequests)
      .where(
        and(
          eq(teamInviteRequests.teamId, teamId),
          eq(teamInviteRequests.inviteeId, memberId)
        )
      );

    if (existingInvite.length > 0) {
      return { success: false, error: "Invite already exists" };
    }

    // Insert the invite
    const invite = await db.insert(teamInviteRequests).values({
      teamId,
      inviterId: currentUserId,
      inviteeId: memberId,
      status: "pending",
      dateSent: new Date().toISOString(), // Use ISO format for date storage
    });

    return {
      success: true,
      message: "Invite sent successfully.",
    };
  } catch (error) {
    console.log("🚀 ~ inviteUserToTeam ~ error:", error);
    return { success: false, error: "Something went wrong!" };
  }
}
