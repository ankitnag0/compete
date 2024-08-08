import React from "react";
import { getUserDetails } from "@/actions/user-actions";
import {
  fetchTeamInvites,
  fetchUserJoinRequests,
  getUserTeams,
} from "@/actions/team-actions";
import UserCard from "@/components/account/user/UserCard";
import TeamSection from "@/components/account/team/TeamSection";
import TeamInvitesSection from "@/components/account/team/TeamInvitesSection";
import JoinTeamSection from "@/components/account/team/JoinTeamsSection";

export default async function Account() {
  const { data } = await getUserDetails();
  if (!data?.userId) {
    return <p>Error: No user data found</p>;
  }

  const teamsResponse = await getUserTeams(data.userId);
  const invitesResponse = await fetchTeamInvites(data.userId);
  const joinRequestsResponse = await fetchUserJoinRequests(data.userId);
  console.log("🚀 ~ Account ~ joinRequestsResponse:", joinRequestsResponse);

  return (
    <>
      <UserCard gamerTag={data.gamerTag || "Unknown User"} />
      <TeamSection teams={teamsResponse.data || []} userId={data.userId} />
      <TeamInvitesSection invites={invitesResponse.data || []} />
      <JoinTeamSection joinRequests={joinRequestsResponse.data || []} />
    </>
  );
}
