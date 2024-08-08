import React from "react";
import { getUserDetails } from "@/actions/user-actions";
import { fetchTeamInvites, getUserTeams } from "@/actions/team-actions";
import UserCard from "./UserCard";
import TeamSection from "./TeamSection";
import TeamInvitesSection from "./TeamInvitesSection";

export default async function Account() {
  const { data } = await getUserDetails();
  if (!data?.userId) {
    return <p>Error: No user data found</p>;
  }

  const teamsResponse = await getUserTeams(data.userId);
  const invitesResponse = await fetchTeamInvites(data.userId);

  return (
    <>
      <UserCard gamerTag={data.gamerTag || "Unknown User"} />
      <TeamSection teams={teamsResponse.data || []} userId={data.userId} />
      <TeamInvitesSection invites={invitesResponse.data || []} />
    </>
  );
}
