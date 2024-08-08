import React from "react";
import { GroupedTeam } from "@/types/teams";
import RemoveTeamMember from "./RemoveTeamMember";

type TeamMemberListProps = {
  teamId: number;
  members: { userId: number; gamerTag: string | null }[];
  userId: number;
  captainId: number;
};

const TeamMemberList = ({
  teamId,
  members,
  userId,
  captainId,
}: TeamMemberListProps) => (
  <div className="flex flex-col gap-2">
    <h3 className="text-lg font-semibold">Members</h3>
    {members.map((member) => (
      <div
        key={member.userId}
        className="flex justify-between border p-2 rounded-md"
      >
        <p>{member.gamerTag}</p>
        {member.userId !== userId && captainId === userId && (
          <RemoveTeamMember teamId={teamId} memberId={member.userId} />
        )}
      </div>
    ))}
  </div>
);

export default TeamMemberList;
