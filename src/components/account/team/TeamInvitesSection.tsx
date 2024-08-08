import React from "react";
import AcceptInvite from "./AcceptInvite";
import RejectInvite from "./RejectInvite";

type Invite = {
  inviteId: number;
  inviterId: number;
  teamId: number;
  inviteeId: number;
  teamName: string;
  inviterGamerTag: string | null;
};

type TeamInvitesSectionProps = {
  invites: Invite[];
};

const TeamInvitesSection = ({ invites }: TeamInvitesSectionProps) => (
  <section className="w-full pt-4">
    <div className="flex w-full items-center justify-between border-b pb-2 mb-2">
      <h1 className="text-2xl">Team Invites</h1>
    </div>
    <div>
      {invites.map((invite) => (
        <div
          key={invite.teamId}
          className="flex justify-between border p-2 rounded-md"
        >
          <p>
            {invite.teamName + " - " + (invite.inviterGamerTag || "Unknown")}
          </p>
          <div className="flex space-x-2">
            <AcceptInvite teamId={invite.teamId} userId={invite.inviteeId} />
            <RejectInvite teamId={invite.teamId} userId={invite.inviteeId} />
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TeamInvitesSection;
