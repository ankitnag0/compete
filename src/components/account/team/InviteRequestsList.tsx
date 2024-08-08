import React from "react";
import CancelInvite from "./CancelInvite";

type InviteRequestsListProps = {
  teamId: number;
  invites: { userId: number; gamerTag: string | null; status: string }[];
  userId: number;
};

const InviteRequestsList = ({
  teamId,
  invites,
  userId,
}: InviteRequestsListProps) => (
  <div>
    <h3 className="text-lg font-semibold">Invite Requests</h3>
    {invites.map((invite) => (
      <div
        key={invite.userId}
        className="flex justify-between border p-2 rounded-md"
      >
        <p>{invite.gamerTag || "Unknown"}</p>
        <div className="flex items-center">
          {userId === teamId && invite.status === "pending" ? (
            <div className="flex space-x-2">
              <CancelInvite teamId={teamId} userId={invite.userId} />
            </div>
          ) : (
            <p>{invite.status}</p>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default InviteRequestsList;
