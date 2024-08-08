"use server";

import { db } from "@/db";
import { teamInviteRequests, teamJoinRequests } from "@/db/schema/join-invites";
import { teamMembers, teams } from "@/db/schema/teams";
import { users } from "@/db/schema/users";
import CreateTeamSchema from "@/lib/schema/CreateTeamSchema";
import { GroupedTeam } from "@/types/teams";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { and, eq, inArray, like, ne, notInArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { format } from "date-fns"; // Import date-fns for date formatting

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

  if (removeTeamMember.length === 1) {
    revalidatePath("/account");
    return {
      success: true,
      message: "Team member removed from team",
    };
  }
}

export async function getUserTeams(userId: number) {
  try {
    // 1. Fetch teams where the user is a captain or a member
    const teamsQuery = db
      .select()
      .from(teams)
      .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
      .where(or(eq(teams.captainId, userId), eq(teamMembers.userId, userId)));
    const teamsData = await teamsQuery;

    // Extract team IDs for further queries
    const teamIds = Array.from(
      new Set(
        teamsData
          .flatMap((team) => [
            team.teams.id,
            team.team_members ? team.team_members.userId : [],
          ])
          .flat()
      )
    ).filter((id): id is number => typeof id === "number"); // Filter out any non-numbers

    // 2. Fetch pending join requests for those teams
    const joinRequestsQuery = db
      .select()
      .from(teamJoinRequests)
      .where(
        and(
          eq(teamJoinRequests.status, "pending"),
          inArray(teamJoinRequests.teamId, teamIds)
        )
      );
    const joinRequestsData = await joinRequestsQuery;
    const requestersIds = Array.from(
      new Set(joinRequestsData.map((request) => request.requesterId))
    );

    // 3. Fetch gamer tags for all users involved
    // - Fetch team members including captain
    const allUserIds = Array.from(
      new Set(
        teamsData.flatMap((team) => [
          team.teams.captainId,
          team.team_members ? team.team_members.userId : [],
        ])
      )
    ).filter((id): id is number => typeof id === "number"); // Filter out any non-numbers

    const membersQuery = db
      .select()
      .from(users)
      .where(inArray(users.id, allUserIds));
    const membersData = await membersQuery;

    // - Fetch requesters
    const requestersQuery = db
      .select()
      .from(users)
      .where(inArray(users.id, requestersIds));
    const requestersData = await requestersQuery;

    // - Fetch invites
    const invitesQuery = db
      .select()
      .from(teamInviteRequests)
      .where(
        and(
          eq(teamInviteRequests.status, "pending"),
          inArray(teamInviteRequests.teamId, teamIds)
        )
      );
    const invitesData = await invitesQuery;
    const inviteesIds = Array.from(
      new Set(invitesData.map((invite) => invite.inviteeId))
    );

    // - Fetch invitees
    const inviteesQuery = db
      .select()
      .from(users)
      .where(inArray(users.id, inviteesIds));
    const inviteesData = await inviteesQuery;

    // 4. Combine results
    const groupedTeams: { [key: number]: GroupedTeam } = {};

    for (const teamItem of teamsData) {
      const teamId = teamItem.teams.id;

      if (!groupedTeams[teamId]) {
        groupedTeams[teamId] = {
          team: teamItem.teams,
          members: [],
          invites: [],
          joinRequests: [],
        };
      }

      // Add members if not already added
      if (teamItem.team_members) {
        const userId = teamItem.team_members.userId;
        const isAlreadyAdded = groupedTeams[teamId].members.some(
          (member) => member.userId === userId
        );
        if (!isAlreadyAdded) {
          const member = membersData.find((user) => user.id === userId);
          groupedTeams[teamId].members.push({
            userId,
            gamerTag: member?.gamerTag || "Unknown",
          });
        }
      }

      // Always add captain if not already added
      const captainId = teamItem.teams.captainId;
      const isCaptainAlreadyAdded = groupedTeams[teamId].members.some(
        (member) => member.userId === captainId
      );
      if (!isCaptainAlreadyAdded) {
        const captain = membersData.find((user) => user.id === captainId);
        groupedTeams[teamId].members.push({
          userId: captainId,
          gamerTag: captain?.gamerTag || "Unknown",
        });
      }

      // Add join requests
      const joinRequestsForTeam = joinRequestsData.filter(
        (request) => request.teamId === teamId
      );
      groupedTeams[teamId].joinRequests = joinRequestsForTeam.map(
        (request) => ({
          userId: request.requesterId,
          gamerTag:
            requestersData.find((user) => user.id === request.requesterId)
              ?.gamerTag || "Unknown",
          status: request.status,
        })
      );

      // Add invites
      const invitesForTeam = invitesData.filter(
        (invite) => invite.teamId === teamId
      );
      groupedTeams[teamId].invites = invitesForTeam.map((invite) => ({
        userId: invite.inviteeId,
        gamerTag:
          inviteesData.find((user) => user.id === invite.inviteeId)?.gamerTag ||
          "Unknown",
        status: invite.status,
      }));
    }

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

    revalidatePath("/account");

    return {
      success: true,
      message: "Invite sent successfully.",
    };
  } catch (error) {
    console.log("🚀 ~ inviteUserToTeam ~ error:", error);
    return { success: false, error: "Something went wrong!" };
  }
}

const CancelInviteSchema = z.object({
  teamId: z.coerce.number(),
  userId: z.coerce.number(),
});

export async function cancelInvite(formInputs: unknown) {
  const { userId } = auth();
  if (!userId) {
    return { success: false, error: "No Logged In User" };
  }

  const parsed = CancelInviteSchema.safeParse(formInputs);
  if (parsed.error) {
    return { success: false, error: parsed.error.format() };
  }

  const { teamId, userId: inviteeId } = parsed.data;

  // Check ownership
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

  const invite = await db
    .select()
    .from(teamInviteRequests)
    .where(
      and(
        eq(teamInviteRequests.teamId, teamId),
        eq(teamInviteRequests.inviteeId, inviteeId)
      )
    );

  if (invite.length === 0) {
    return { success: false, error: "Invite not found" };
  }

  await db
    .delete(teamInviteRequests)
    .where(
      and(
        eq(teamInviteRequests.teamId, teamId),
        eq(teamInviteRequests.inviteeId, inviteeId)
      )
    );

  // Optionally, you might want to trigger a revalidation or refresh if needed
  revalidatePath("/account");

  return {
    success: true,
    message: "Invite cancelled successfully",
  };
}

export async function acceptJoinRequest(teamId: number, userId: number) {
  try {
    const { userId: authUserId } = auth();
    if (!authUserId) {
      return { success: false, error: "No Logged In User" };
    }

    // Get the current user's email
    const authUser = await clerkClient.users.getUser(authUserId);
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

    // Check if the join request exists and is pending
    const joinRequest = await db
      .select()
      .from(teamJoinRequests)
      .where(
        and(
          eq(teamJoinRequests.teamId, teamId),
          eq(teamJoinRequests.requesterId, userId),
          eq(teamJoinRequests.status, "pending")
        )
      );

    if (joinRequest.length === 0) {
      return {
        success: false,
        error: "Join request not found or already accepted/rejected",
      };
    }

    // Update the join request status to accepted
    await db
      .update(teamJoinRequests)
      .set({ status: "accepted" })
      .where(
        and(
          eq(teamJoinRequests.teamId, teamId),
          eq(teamJoinRequests.requesterId, userId)
        )
      );

    // Add the user to the team members
    await db.insert(teamMembers).values({
      teamId,
      userId,
    });

    revalidatePath("/account");

    return { success: true, message: "Join request accepted successfully." };
  } catch (error) {
    console.log("🚀 ~ acceptJoinRequest ~ error:", error);
    return { success: false, error: "Something went wrong!" };
  }
}

export async function rejectJoinRequest(teamId: number, userId: number) {
  try {
    const { userId: authUserId } = auth();
    if (!authUserId) {
      return { success: false, error: "No Logged In User" };
    }

    // Get the current user's email
    const authUser = await clerkClient.users.getUser(authUserId);
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

    // Check if the join request exists and is pending
    const joinRequest = await db
      .select()
      .from(teamJoinRequests)
      .where(
        and(
          eq(teamJoinRequests.teamId, teamId),
          eq(teamJoinRequests.requesterId, userId),
          eq(teamJoinRequests.status, "pending")
        )
      );

    if (joinRequest.length === 0) {
      return {
        success: false,
        error: "Join request not found or already accepted/rejected",
      };
    }

    // Update the join request status to rejected
    await db
      .update(teamJoinRequests)
      .set({ status: "rejected" })
      .where(
        and(
          eq(teamJoinRequests.teamId, teamId),
          eq(teamJoinRequests.requesterId, userId)
        )
      );

    revalidatePath("/account");

    return { success: true, message: "Join request rejected successfully." };
  } catch (error) {
    console.log("🚀 ~ rejectJoinRequest ~ error:", error);
    return { success: false, error: "Something went wrong!" };
  }
}

export async function fetchTeamInvites(userId: number) {
  try {
    const { userId: authUserId } = auth();
    if (!authUserId) {
      return { success: false, error: "No Logged In User" };
    }

    // Check if the user exists in the database
    const dbUserId = await getDbUserId(authUserId);
    if (!dbUserId.success) {
      return { success: false, error: "User not found in the database" };
    }

    // Fetch pending team invites for the user
    const invites = await db
      .select({
        inviteId: teamInviteRequests.id,
        inviterId: teamInviteRequests.inviterId,
        teamId: teamInviteRequests.teamId,
        inviteeId: teamInviteRequests.inviteeId,
        teamName: teams.name,
        inviterGamerTag: users.gamerTag,
      })
      .from(teamInviteRequests)
      .innerJoin(users, eq(teamInviteRequests.inviterId, users.id))
      .innerJoin(teams, eq(teamInviteRequests.teamId, teams.id))
      .where(
        and(
          eq(teamInviteRequests.inviteeId, userId),
          eq(teamInviteRequests.status, "pending")
        )
      );

    return { success: true, data: invites };
  } catch (error) {
    console.log("🚀 ~ fetchTeamInvites ~ error:", error);
    return { success: false, error: "Something went wrong!" };
  }
}

export async function acceptInvite(teamId: number, userId: number) {
  try {
    const { userId: authUserId } = auth();
    if (!authUserId) {
      return { success: false, error: "No Logged In User" };
    }

    // Get the current user's email
    const authUser = await clerkClient.users.getUser(authUserId);
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

    if (userId !== currentUserId) {
      return { success: false, error: "You are not invited to this team" };
    }

    // Check if the invite exists and is pending
    const invite = await db
      .select()
      .from(teamInviteRequests)
      .where(
        and(
          eq(teamInviteRequests.teamId, teamId),
          eq(teamInviteRequests.inviteeId, userId),
          eq(teamInviteRequests.status, "pending")
        )
      );

    if (invite.length === 0) {
      return {
        success: false,
        error: "Invite not found or already accepted/rejected",
      };
    }

    // Update the invite status to accepted
    await db
      .update(teamInviteRequests)
      .set({ status: "accepted" })
      .where(
        and(
          eq(teamInviteRequests.teamId, teamId),
          eq(teamInviteRequests.inviteeId, userId)
        )
      );

    // Add the user to the team members
    await db.insert(teamMembers).values({
      teamId,
      userId,
    });

    revalidatePath("/account");

    return { success: true, message: "Invite accepted successfully." };
  } catch (error) {
    console.log("🚀 ~ acceptInvite ~ error:", error);
    return { success: false, error: "Something went wrong!" };
  }
}

export async function rejectInvite(teamId: number, userId: number) {
  try {
    const { userId: authUserId } = auth();
    if (!authUserId) {
      return { success: false, error: "No Logged In User" };
    }

    // Get the current user's email
    const authUser = await clerkClient.users.getUser(authUserId);
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

    if (userId !== currentUserId) {
      return { success: false, error: "You are not invited to this team" };
    }

    // Check if the invite exists and is pending
    const invite = await db
      .select()
      .from(teamInviteRequests)
      .where(
        and(
          eq(teamInviteRequests.teamId, teamId),
          eq(teamInviteRequests.inviteeId, userId),
          eq(teamInviteRequests.status, "pending")
        )
      );

    if (invite.length === 0) {
      return {
        success: false,
        error: "Invite not found or already accepted/rejected",
      };
    }

    // Update the invite status to rejected
    await db
      .update(teamInviteRequests)
      .set({ status: "rejected" })
      .where(
        and(
          eq(teamInviteRequests.teamId, teamId),
          eq(teamInviteRequests.inviteeId, userId)
        )
      );

    revalidatePath("/account");

    return { success: true, message: "Invite rejected successfully." };
  } catch (error) {
    console.log("🚀 ~ rejectInvite ~ error:", error);
    return { success: false, error: "Something went wrong!" };
  }
}

export async function searchTeams(searchQuery: string) {
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

    // Fetch team IDs where the user is a member
    const userTeamsQuery = db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, dbUserId.userId));
    const userTeamsData = await userTeamsQuery;
    const userTeamIds = userTeamsData.map((row) => row.teamId);

    // Perform the search query for teams
    const results = await db
      .select()
      .from(teams)
      .where(
        and(
          like(teams.name, `%${searchQuery}%`),
          ne(teams.captainId, dbUserId.userId), // Exclude teams where the user is the captain
          notInArray(teams.id, userTeamIds) // Exclude teams where the user is already a member
        )
      );

    return { success: true, data: results };
  } catch (error) {
    console.log("🚀 ~ searchTeams ~ error:", error);
    return { success: false, error: "Something went wrong!" };
  }
}

export async function sendJoinRequest(teamId: number) {
  try {
    const { userId } = auth();
    if (!userId) {
      return { success: false, error: "No Logged In User" };
    }

    // Get the user's DB ID
    const dbUserId = await getDbUserId(userId);
    if (!dbUserId.success) {
      return { success: false, error: "User not found in the database" };
    }

    // Check if the team exists
    const teamQuery = db.select().from(teams).where(eq(teams.id, teamId));
    const teamData = await teamQuery;
    if (teamData.length === 0) {
      return { success: false, error: "Team not found" };
    }

    // Check if the user is already a member of the team
    const memberCheck = db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, dbUserId.userId)
        )
      );
    const memberData = await memberCheck;
    if (memberData.length > 0) {
      return { success: false, error: "You are already a member of this team" };
    }

    // Check if a join request already exists
    const existingRequestCheck = db
      .select()
      .from(teamJoinRequests)
      .where(
        and(
          eq(teamJoinRequests.teamId, teamId),
          eq(teamJoinRequests.requesterId, dbUserId.userId)
        )
      );
    const existingRequestData = await existingRequestCheck;
    if (existingRequestData.length > 0) {
      return { success: false, error: "Join request already exists" };
    }

    // Insert the join request
    const insertResult = await db.insert(teamJoinRequests).values({
      teamId,
      requesterId: dbUserId.userId,
      status: "pending",
      dateRequested: format(new Date(), "yyyy-MM-dd HH:mm:ss"), // Current date and time
    });

    revalidatePath("/account");

    return { success: true, message: "Join request sent successfully" };
  } catch (error) {
    console.log("🚀 ~ sendJoinRequest ~ error:", error);
    return { success: false, error: "Something went wrong!" };
  }
}

export async function fetchUserJoinRequests(userId: number) {
  try {
    const { userId: authUserId } = auth();
    if (!authUserId) {
      return { success: false, error: "No Logged In User" };
    }

    // Check if the user exists in the database
    const dbUserId = await getDbUserId(authUserId);
    if (!dbUserId.success) {
      return { success: false, error: "User not found in the database" };
    }

    // Fetch pending join requests made by the user
    const joinRequests = await db
      .select({
        requestId: teamJoinRequests.id,
        teamId: teamJoinRequests.teamId,
        requesterId: teamJoinRequests.requesterId,
        teamName: teams.name,
        status: teamJoinRequests.status,
        dateRequested: teamJoinRequests.dateRequested,
      })
      .from(teamJoinRequests)
      .innerJoin(teams, eq(teamJoinRequests.teamId, teams.id))
      .where(
        and(
          eq(teamJoinRequests.requesterId, userId),
          eq(teamJoinRequests.status, "pending")
        )
      );

    return { success: true, data: joinRequests };
  } catch (error) {
    console.log("🚀 ~ fetchUserJoinRequests ~ error:", error);
    return { success: false, error: "Something went wrong!" };
  }
}

export async function cancelJoinRequest(teamId: number) {
  try {
    const { userId: authUserId } = auth();
    if (!authUserId) {
      return { success: false, error: "No Logged In User" };
    }

    // Get the current user's DB ID
    const dbUserId = await getDbUserId(authUserId);
    if (!dbUserId.success) {
      return { success: false, error: "User not found in the database" };
    }

    // Check if the join request exists and is pending
    const joinRequest = await db
      .select()
      .from(teamJoinRequests)
      .where(
        and(
          eq(teamJoinRequests.teamId, teamId),
          eq(teamJoinRequests.requesterId, dbUserId.userId),
          eq(teamJoinRequests.status, "pending")
        )
      );

    if (joinRequest.length === 0) {
      return {
        success: false,
        error: "Join request not found or already processed",
      };
    }

    // Delete the join request
    await db
      .delete(teamJoinRequests)
      .where(
        and(
          eq(teamJoinRequests.teamId, teamId),
          eq(teamJoinRequests.requesterId, dbUserId.userId)
        )
      );

    revalidatePath("/account");

    return { success: true, message: "Join request canceled successfully." };
  } catch (error) {
    console.log("🚀 ~ cancelJoinRequest ~ error:", error);
    return { success: false, error: "Something went wrong!" };
  }
}
